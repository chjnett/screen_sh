from openai import OpenAI
from app.core.config import settings
import json
import logging

logger = logging.getLogger(__name__)

client = OpenAI(api_key=settings.openai_api_key)

SYSTEM_PROMPT = """
You are a financial portfolio analyzer. Your task is to extract portfolio holdings from a screenshot.
Identify the Ticker Symbol (e.g., AAPL, TSLA, 005930.KS), Quantity (Shares), Average Price, and if possible, the Sector.
Return the result as a strict JSON object with a list of items.

Format:
{
  "items": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "quantity": 10.5,
      "avg_price": 150.25,
      "current_price": 175.00,
      "sector": "Technology"
    }
  ],
  "total_value": 15200.50,
  "risk_assessment": "Short summary of risk based on sector allocation."
}

If you cannot identify specific numbers, make a reasonable estimate or return 0, but always try to find the Ticker.
If the image is not a portfolio, return an empty items list.
"""

def analyze_portfolio_image(image_base64: str):
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Analyze this portfolio screenshot and extract holdings."},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ],
            response_format={ "type": "json_object" }
        )
        
        content = response.choices[0].message.content
        logger.info(f"OpenAI Vision Response: {content}")
        return json.loads(content)
        
    except Exception as e:
        logger.error(f"Error in analyze_portfolio_image: {e}")
        raise e
