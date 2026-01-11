from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import engine, Base, get_db
from app import models, schemas, rag

# Create tables
from sqlalchemy import text
with engine.connect() as connection:
    connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    connection.commit()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="LogMind AI API", version="0.1.0")

@app.get("/")
def read_root():
    return {"message": "LogMind AI API에 오신 것을 환영합니다"}

@app.post("/rag/query", response_model=schemas.RAGResponse)
def query_rag(request: schemas.RAGQueryRequest, db: Session = Depends(get_db)):
    try:
        # Retrieve relevant docs
        docs = rag.search_knowledge(db, request.query)
        
        # Generate Answer
        answer = rag.generate_answer(request.query, docs)
        
        sources = [doc.source_url for doc in docs if doc.source_url]
        return {"answer": answer, "sources": list(set(sources))} # Unique sources
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
