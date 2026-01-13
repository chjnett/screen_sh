import yfinance as yf
import requests
from bs4 import BeautifulSoup
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

class DataCrawler:
    """
    Collects financial data and news for portfolio analysis.
    """
    
    @staticmethod
    def get_financial_summary(symbol: str) -> Dict:
        """
        Fetches key financial metrics using yfinance.
        """
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            # Extract key metrics safely
            metrics = {
                "market_cap": info.get("marketCap", 0),
                "per": info.get("trailingPE", 0),
                "pbr": info.get("priceToBook", 0),
                "dividend_yield": info.get("dividendYield", 0),
                "roe": info.get("returnOnEquity", 0),
                "revenue_growth": info.get("revenueGrowth", 0),
                "profit_margins": info.get("profitMargins", 0),
                "sector": info.get("sector", "Unknown"),
                "industry": info.get("industry", "Unknown")
            }
            
            # Get last 3 years of financials (Revenue & Net Income)
            try:
                financials = ticker.financials
                if not financials.empty:
                    # Select recent 3 columns
                    recent_years = financials.columns[:3]
                    financial_trend = {}
                    for date in recent_years:
                        year_str = date.strftime('%Y')
                        financial_trend[year_str] = {
                            "revenue": financials.loc.get("Total Revenue", financials.loc.get("TotalRevenue", pd.Series())).get(date),
                            "net_income": financials.loc.get("Net Income", financials.loc.get("NetIncome", pd.Series())).get(date)
                        }
                    metrics["trend"] = financial_trend
            except Exception as e:
                logger.warning(f"Financial trend fetch failed for {symbol}: {e}")
                metrics["trend"] = {}
                
            return metrics
        except Exception as e:
            logger.error(f"Failed to fetch financials for {symbol}: {e}")
            return {}

    @staticmethod
    def crawl_news(symbol: str, limit: int = 5) -> List[Dict]:
        """
        Crawls recent news headlines from Google News (via RSS).
        This is lighter and more reliable than scraping raw HTML without a proper crawler.
        """
        try:
            # Use Google News RSS
            url = f"https://news.google.com/rss/search?q={symbol}+stock&hl=en-US&gl=US&ceid=US:en"
            
            # For Korean stocks, ensure we search in Korean context if needed, but sticking to English for "Wall Street Analyst" persona
            if ".KS" in symbol or ".KQ" in symbol:
                clean_symbol = symbol.replace(".KS", "").replace(".KQ", "")
                url = f"https://news.google.com/rss/search?q={clean_symbol}+주식&hl=ko&gl=KR&ceid=KR:ko"

            response = requests.get(url, timeout=5)
            if response.status_code != 200:
                logger.error(f"News fetch failed status: {response.status_code}")
                return []

            # Use xml parser for RSS feeds (requires lxml installed)
            # Use built-in html.parser as lxml is not available in slim image without system deps
            soup = BeautifulSoup(response.content, features="html.parser")
            items = soup.find_all("item", limit=limit)
            
            news_list = []
            for item in items:
                news_list.append({
                    "title": item.title.text if item.title else "No Title",
                    "link": item.link.text if item.link else "#",
                    "pubDate": item.pubDate.text if item.pubDate else "",
                    "source": item.source.text if item.source else "Google News"
                })
                
            return news_list
        except Exception as e:
            logger.error(f"Failed to crawl news for {symbol}: {e}")
            return []

# Usage Example
if __name__ == "__main__":
    import json
    
    def print_pretty(title, data):
        print(f"\n=== {title} ===")
        print(json.dumps(data, indent=2, ensure_ascii=False))

    # Test 1: US Stock (Apple)
    print("\n[Testing US Stock: AAPL]")
    summary = DataCrawler.get_financial_summary("AAPL")
    print_pretty("Financials (AAPL)", summary)
    
    news = DataCrawler.crawl_news("AAPL", limit=3)
    print_pretty("News (AAPL)", news)

    # Test 2: KR Stock (Samsung Electronics)
    print("\n[Testing KR Stock: 005930.KS]")
    summary_kr = DataCrawler.get_financial_summary("005930.KS")
    print_pretty("Financials (Samsung)", summary_kr)
    
    news_kr = DataCrawler.crawl_news("005930.KS", limit=3)
    print_pretty("News (Samsung)", news_kr)
