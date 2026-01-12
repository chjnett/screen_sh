from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class RAGQueryRequest(BaseModel):
    query: str

class RAGResponse(BaseModel):
    answer: str
    sources: list[str]

# Portfolio Schemas
class PortfolioItemBase(BaseModel):
    symbol: str
    name: Optional[str] = None
    quantity: float
    avg_price: float
    current_price: Optional[float] = None
    sector: Optional[str] = None

class PortfolioCreate(BaseModel):
    name: str = "My Portfolio"
    items: list[PortfolioItemBase]

class PortfolioAnalysisRequest(BaseModel):
    image_base64: str

class PortfolioAnalysisResponse(BaseModel):
    items: list[PortfolioItemBase]
    total_value: Optional[float] = None
    risk_assessment: Optional[str] = None
