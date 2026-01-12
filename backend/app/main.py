from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import engine, Base, get_db
from app import models, schemas, rag
from app.api import auth

# Create tables
from sqlalchemy import text
with engine.connect() as connection:
    connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    connection.commit()

Base.metadata.create_all(bind=engine)

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="LogMind AI API", version="0.1.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])

@app.get("/")
def read_root():
    return {"message": "LogMind AI API에 오신 것을 환영합니다"}

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post("/rag/query", response_model=schemas.RAGResponse)
def query_rag(request: schemas.RAGQueryRequest, db: Session = Depends(get_db)):
    logger.info(f"Received RAG query: {request.query}")
    try:
        # Check API Key
        from app.core.config import settings
        masked_key = settings.openai_api_key[:8] + "..." if settings.openai_api_key else "None"
        logger.info(f"Using OpenAI API Key: {masked_key}")

        # Retrieve relevant docs
        logger.info("Searching knowledge base...")
        docs = rag.search_knowledge(db, request.query)
        logger.info(f"Found {len(docs)} documents.")
        
        # Generate Answer
        logger.info("Generating answer with GPT-4o...")
        answer = rag.generate_answer(request.query, docs)
        logger.info("Answer generated successfully.")
        
        sources = [doc.source_url for doc in docs if doc.source_url]
        return {"answer": answer, "sources": list(set(sources))} # Unique sources
    except Exception as e:
        logger.error(f"Error in query_rag: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")
