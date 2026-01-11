from pydantic import BaseModel
from typing import List, Optional

class RAGQueryRequest(BaseModel):
    query: str

class RAGResponse(BaseModel):
    answer: str
    sources: List[str]
