from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models import MarketKnowledge
from app.core.config import settings
from openai import OpenAI
from typing import List

client = OpenAI(api_key=settings.openai_api_key)

def get_embedding(text: str) -> List[float]:
    """OpenAI API를 사용하여 주어진 텍스트의 임베딩 벡터를 생성합니다."""
    response = client.embeddings.create(
        input=text,
        model="text-embedding-3-small"
    )
    return response.data[0].embedding

def search_knowledge(db: Session, query: str, top_k: int = 3):
    """벡터 유사도를 사용하여 데이터베이스에서 유사한 문서를 검색합니다."""
    query_embedding = get_embedding(query)
    
    # pgvector가 제공하는 코사인 거리(<=>) 사용
    results = db.scalars(
        select(MarketKnowledge)
        .order_by(MarketKnowledge.embedding.cosine_distance(query_embedding))
        .limit(top_k)
    ).all()
    
    return results

def generate_answer(query: str, context_docs: List[MarketKnowledge]) -> str:
    """검색된 컨텍스트를 기반으로 GPT-4o를 사용하여 답변을 생성합니다."""
    context_text = "\n\n".join([f"Source: {doc.source_url or 'Unknown'}\nContent: {doc.content}" for doc in context_docs])
    
    system_prompt = """당신은 월스트리트의 수석 분석가입니다. 
사용자가 제공한 재무 데이터와 실시간 뉴스, 그리고 사용자의 매매 일지를 바탕으로 가장 객관적이고 날카로운 비평을 제공하십시오. 
모든 조언은 반드시 제공된 컨텍스트(뉴스, 데이터)를 근거로 들어야 하며, 토스증권의 UI에 맞게 명확한 결론부터 제시하십시오."""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Context:\n{context_text}\n\nQuestion: {query}"}
        ]
    )
    return response.choices[0].message.content
