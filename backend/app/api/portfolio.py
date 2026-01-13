from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas, models
from app.services import portfolio_service
import yfinance as yf
from datetime import datetime

router = APIRouter()

@router.post("/analyze", response_model=schemas.PortfolioAnalysisResponse)
def analyze_portfolio(request: schemas.PortfolioAnalysisRequest):
    """
    Analyzes a portfolio screenshot using GPT-4o Vision.
    """
    try:
        result = portfolio_service.analyze_portfolio_image(request.image_base64)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai-insight", response_model=dict)
def get_portfolio_insight(db: Session = Depends(get_db)):
    """
    Analyzes the current user's portfolio for long-term investment perspective.
    """
    portfolio = db.query(models.Portfolio).order_by(models.Portfolio.created_at.desc()).first()
    if not portfolio or not portfolio.items:
        return {"insight": "포트폴리오 데이터가 부족하여 분석할 수 없습니다."}
    
    # Prepare data for analysis
    items_data = [
        {
            "symbol": item.symbol, 
            "quantity": item.quantity, 
            "avg_price": item.avg_price
        } for item in portfolio.items
    ]
    
    from app import rag
    insight = rag.analyze_portfolio_long_term(items_data)
    
    return {"insight": insight}

from app.models import User
from app.core import security

@router.post("/", response_model=bool)
def save_portfolio(portfolio: schemas.PortfolioCreate, db: Session = Depends(get_db)):
    """
    Saves the confirmed portfolio data to the database.
    Ensures a user exists to link the portfolio to (MVP Hack).
    """
    try:
        # MVP: Link to first found user or create a Demo User
        user = db.query(User).first()
        if not user:
            user = User(
                email="demo@logmind.ai",
                hashed_password=security.get_password_hash("demo1234")
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Create Portfolio container
        db_portfolio = models.Portfolio(
            name=portfolio.name,
            total_value=0, # Will be calculated
            user_id=user.id 
        )
        db.add(db_portfolio)
        db.commit()
        db.refresh(db_portfolio)

        total_val = 0
        for item in portfolio.items:
            db_item = models.PortfolioItem(
                portfolio_id=db_portfolio.id,
                symbol=item.symbol,
                name=item.name,
                quantity=item.quantity,
                avg_price=item.avg_price,
                current_price=item.current_price,
                sector=item.sector
            )
            total_val += (item.quantity * (item.current_price or item.avg_price))
            db.add(db_item)
        
        db_portfolio.total_value = total_val
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=schemas.PortfolioAnalysisResponse)
def get_portfolio(db: Session = Depends(get_db)):
    """
    Retrieves the latest portfolio and updates prices using yfinance.
    """
    # 1. Get latest portfolio
    portfolio = db.query(models.Portfolio).order_by(models.Portfolio.created_at.desc()).first()
    if not portfolio:
        return {"items": [], "total_value": 0, "risk_assessment": "No portfolio found."}
    
    # 2. Update prices (Simple implementation)
    items_data = []
    total_value = 0
    
    for item in portfolio.items:
        current_price = item.current_price
        
        # Determine if we should update price (e.g., if older than 5 mins) -> Skip complexity for now, just fetch every time or use cached
        try:
            # Very naive synchrounous fetching - in production use BackgroundTasks
            ticker = yf.Ticker(item.symbol)
            # fast_info is faster
            price = ticker.fast_info.last_price
            if price:
                current_price = price
                # Update DB
                item.current_price = price
        except Exception:
            pass # Keep old price if fetch fails
        
        value = float(item.quantity) * float(current_price or 0)
        total_value += value
        
        items_data.append(schemas.PortfolioItemBase(
            symbol=item.symbol,
            name=item.name,
            quantity=item.quantity,
            avg_price=item.avg_price,
            current_price=current_price,
            sector=item.sector
        ))
    
    db.commit() # Save updated prices
    
    return {
        "items": items_data,
        "total_value": total_value,
        "risk_assessment": "Portfolio loaded successfully."
    }

@router.get("/prices", response_model=dict)
def get_realtime_prices(db: Session = Depends(get_db)):
    """
    Fetches real-time prices for the current portfolio items without updating the DB.
    Optimized for polling.
    """
    portfolio = db.query(models.Portfolio).order_by(models.Portfolio.created_at.desc()).first()
    if not portfolio or not portfolio.items:
        return {}
    
    prices = {}
    for item in portfolio.items:
        try:
            ticker = yf.Ticker(item.symbol)
            # fast_info provides the latest available price efficiently
            price = ticker.fast_info.last_price
            prev_close = ticker.fast_info.previous_close
            change_percent = ((price - prev_close) / prev_close * 100) if prev_close else 0.0
            
            prices[item.symbol] = {
                "current_price": price,
                "change_percent": change_percent
            }
        except Exception:
            prices[item.symbol] = {
                "current_price": item.current_price, # Fallback to DB price
                "change_percent": 0.0
            }
            
    return prices

from fastapi import BackgroundTasks
from app.services.crawler import DataCrawler
from app.services.report_generator import ReportGenerator
from app.services.mailer import EmailService
from app import rag

async def generate_and_send_report(user_email: str, portfolio_items: list):
    """
    Background Task: Crawl -> Analyze -> Generate PDF -> Send Email
    """
    try:
        print(f"Starting report generation for {user_email}...")
        
        # 1. Collect Data & News
        stock_details = []
        for item in portfolio_items:
            # Fetch Financials
            fin = DataCrawler.get_financial_summary(item.symbol)
            # Fetch News
            news = DataCrawler.crawl_news(item.symbol, limit=3)
            
            # Simple AI Analysis per stock (Optimization: can be batched)
            # For now, just a placeholder or simple aggregation
            ai_summary = f"Sector: {fin.get('sector', 'N/A')}. Recent news mentions: {len(news)} articles."
            
            stock_details.append({
                "symbol": item.symbol,
                "name": item.name,
                "quantity": float(item.quantity),
                "avg_price": float(item.avg_price),
                "price": float(item.current_price or item.avg_price), # Use current or fallback
                "profit_rate": round(((float(item.current_price or item.avg_price) - float(item.avg_price)) / float(item.avg_price)) * 100, 2),
                "per": fin.get("per", "N/A"),
                "pbr": fin.get("pbr", "N/A"),
                "ai_summary": ai_summary
            })
            
        # 2. Overall Portfolio Analysis (using existing RAG logic)
        items_data = [{"symbol": s['symbol'], "quantity": s['quantity'], "avg_price": s['avg_price']} for s in stock_details]
        overall_insight = rag.analyze_portfolio_long_term(items_data)
        
        # 3. Generate PDF
        generator = ReportGenerator() # Templates are loaded from app/templates
        pdf_bytes = generator.create_pdf(
            user_email=user_email,
            portfolio_data={}, # Can add more metadata
            ai_insight=overall_insight,
            stock_details=stock_details
        )
        
        # 4. Send Email
        await EmailService.send_report_email(user_email, pdf_bytes)
        print("Report sent successfully.")
        
    except Exception as e:
        print(f"Report generation failed: {e}")
        import traceback
        traceback.print_exc()

@router.post("/report", status_code=202)
async def request_portfolio_report(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Triggers the generation and emailing of the investment report.
    Returns immediately (202 Accepted) while processing in background.
    """
    # Get Portfolio & User
    # MVP: Assume single user or demo user
    user = db.query(models.User).first()
    email = user.email if user else "demo@logmind.ai"
    
    portfolio = db.query(models.Portfolio).order_by(models.Portfolio.created_at.desc()).first()
    if not portfolio or not portfolio.items:
        raise HTTPException(status_code=400, detail="No portfolio found.")
    
    # Trigger Background Task
    background_tasks.add_task(generate_and_send_report, email, portfolio.items)
    
    return {"message": "Report generation started. You will receive an email shortly."}

from fastapi.responses import StreamingResponse
import io

@router.post("/report/download")
async def download_portfolio_report(db: Session = Depends(get_db)):
    """
    Generates and downloads the investment report directly.
    Processing happens synchronously, so it might take 10-20 seconds.
    """
    portfolio = db.query(models.Portfolio).order_by(models.Portfolio.created_at.desc()).first()
    if not portfolio or not portfolio.items:
        raise HTTPException(status_code=400, detail="No portfolio found.")
        
    try:
        # Reuse logic from generate_and_send_report but synchronous
        user = db.query(models.User).first()
        user_email = user.email if user else "demo@logmind.ai"
        
        # 1. Collect Data & News
        stock_details = []
        for item in portfolio.items:
            fin = DataCrawler.get_financial_summary(item.symbol)
            news = DataCrawler.crawl_news(item.symbol, limit=3)
            ai_summary = f"Sector: {fin.get('sector', 'N/A')}. Recent news mentions: {len(news)} articles."
            
            stock_details.append({
                "symbol": item.symbol,
                "name": item.name,
                "quantity": float(item.quantity),
                "avg_price": float(item.avg_price),
                "price": float(item.current_price or item.avg_price),
                "profit_rate": round(((float(item.current_price or item.avg_price) - float(item.avg_price)) / float(item.avg_price)) * 100, 2),
                "per": fin.get("per", "N/A"),
                "pbr": fin.get("pbr", "N/A"),
                "ai_summary": ai_summary
            })
            
        # 2. Overall Portfolio Analysis
        items_data = [{"symbol": s['symbol'], "quantity": s['quantity'], "avg_price": s['avg_price']} for s in stock_details]
        overall_insight = rag.analyze_portfolio_long_term(items_data)
        
        # 3. Generate PDF
        generator = ReportGenerator()
        pdf_bytes = generator.create_pdf(
            user_email=user_email,
            portfolio_data={},
            ai_insight=overall_insight,
            stock_details=stock_details
        )
        
        # Return as downloadable file
        return StreamingResponse(
            io.BytesIO(pdf_bytes), 
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=Investment_Report_{portfolio.id}.pdf"}
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")
