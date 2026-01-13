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

def analyze_portfolio_long_term(items: List[dict]) -> str:
    """포트폴리오 구성 종목들을 받아 장기 투자 관점에서 분석합니다."""
    
    portfolio_text = "\n".join([f"- {item['symbol']}: {item['quantity']}주 (평단 ${item['avg_price']})" for item in items])
    
    system_prompt = """당신은 워렌 버핏과 레이 달리오의 투자 철학을 갖춘 장기 투자 전문가입니다. 
사용자의 포트폴리오 구성을 보고 다음 기준에 따라 한국어로 냉철하게 분석해 주세요.

1. **포트폴리오 안정성**: 섹터 분산이 잘 되어 있는지?
2. **성장 잠재력**: 보유 종목들이 3~10년 뒤에도 유망한지?
3. **리스크 요인**: 현재 시장 상황에서 주의해야 할 점은?
4. **종합 의견**: 한 문장의 명확한 조언.

답변은 짧고 명료하게(3~4문장), '해요'체로 부드럽게 작성해 주세요."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"내 포트폴리오 구성이다:\n{portfolio_text}\n\n이 포트폴리오의 장기 투자 적합성을 분석해줘."}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"분석 중 오류가 발생했습니다: {str(e)}"

