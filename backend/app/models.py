from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, DECIMAL, Date, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from app.database import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    portfolios = relationship("Portfolio", back_populates="user")
    journals = relationship("Journal", back_populates="user")

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    name = Column(String, default="My Portfolio")
    total_value = Column(DECIMAL, default=0)
    cash_balance = Column(DECIMAL, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="portfolios")
    items = relationship("PortfolioItem", back_populates="portfolio", cascade="all, delete-orphan")

class PortfolioItem(Base):
    __tablename__ = "portfolio_items"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"))
    symbol = Column(String, nullable=False) # Ticker (e.g., AAPL)
    name = Column(String) # Company Name
    quantity = Column(DECIMAL, nullable=False)
    avg_price = Column(DECIMAL, nullable=False)
    current_price = Column(DECIMAL) # Cached price
    sector = Column(String)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    portfolio = relationship("Portfolio", back_populates="items")

class FinancialStatement(Base):
    __tablename__ = "financial_statements"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, nullable=False)
    fiscal_date = Column(Date, nullable=False)
    revenue = Column(Integer)
    operating_income = Column(Integer)
    net_income = Column(Integer)
    cash_flow = Column(Integer)
    metrics = Column(JSONB)
    source = Column(Text, default="Financial APIs")

class Journal(Base):
    __tablename__ = "journals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    symbol = Column(String)
    content = Column(Text, nullable=False)
    screenshot_path = Column(Text)
    sentiment_score = Column(DECIMAL)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="journals")

class MarketKnowledge(Base):
    __tablename__ = "market_knowledge"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String)
    content = Column(Text)
    embedding = Column(Vector(1536))
    source_url = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
