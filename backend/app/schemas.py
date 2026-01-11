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
