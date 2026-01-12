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
