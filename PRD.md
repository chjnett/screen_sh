

이 문서는 단순한 기획을 넘어 **데이터 스키마, API 명세, UI 컴포넌트 구조, AI 파이프라인**을 모두 포함하고 있어, AI 에이전트가 즉시 코드 베이스를 생성하기에 최적화되어 있습니다.

---

# 🚀 [Master PRD] LogMind AI: Professional Investment Intelligence

## 1. Project Overview

* **Mission:** 사용자의 포트폴리오 스크린샷과 심리(일지)를 데이터화하고, 재무제표와 최신 뉴스를 결합하여 전문적인 투자 통찰을 제공한다.
* **Design Philosophy:** 토스증권(Toss Securities) 스타일 - 다크 모드, 미니멀 카드 UI, 모바일 최적화, 전문적인 톤.
* **Core Architecture:** Self-managed 인프라 (PostgreSQL + FastAPI + React).

---

## 2. Technical Stack

* **Frontend:** React (Next.js), Tailwind CSS, Framer Motion (토스 스타일 애니메이션).
* **Backend:** FastAPI (Python 3.10+), SQLAlchemy ORM.
* **Database:** PostgreSQL + **pgvector** (RAG 검색용).
* **AI/LLM:** OpenAI GPT-4o 또는 Claude 3.5 Sonnet, LangChain.
* **Data Source:** `yfinance` (재무 데이터), `BeautifulSoup/Selenium` (뉴스 크롤링).
* **Auth:** JWT (JSON Web Token) 기반 자체 인증.

---

## 3. Database Schema (DDL)

```sql
-- 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. 사용자
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 통합 포트폴리오 (Master View)
CREATE TABLE portfolios (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    symbol VARCHAR(20) NOT NULL,
    quantity DECIMAL NOT NULL,
    avg_price DECIMAL NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 전문 재무제표 (B안: 상세형)
CREATE TABLE financial_statements (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    fiscal_date DATE NOT NULL,
    revenue BIGINT,
    operating_income BIGINT,
    net_income BIGINT,
    cash_flow BIGINT,
    metrics JSONB, -- PER, PBR, ROE 등
    source TEXT DEFAULT 'Financial APIs',
    UNIQUE(symbol, fiscal_date)
);

-- 4. 스크린샷 및 매매 일지 (Time-machine)
CREATE TABLE journals (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    symbol VARCHAR(20),
    content TEXT NOT NULL,          -- 전문적 톤의 일지
    screenshot_path TEXT,           -- 로컬 스토리지 경로
    sentiment_score DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RAG용 지식 베이스 (크롤링 데이터)
CREATE TABLE market_knowledge (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20),
    content TEXT,
    embedding VECTOR(1536),         -- OpenAI embedding 전용
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

```

---

## 4. Key Functional Specifications

### 4.1. OCR & Capture Flow

* 사용자가 스크린샷 업로드 시 바텀 시트(Bottom Sheet) 오픈.
* 백엔드에서 Tesseract 또는 Vision API를 통해 종목명/평단가 추출.
* 사용자는 바텀 시트 내에서 전문적인 매매 근거 작성 후 저장.

### 4.2. 전문 재무제표 & AI Summary

* **UI:** 3개년 수치를 표(Table)로 출력. YoY(전년 대비) 성장률을 텍스트와 함께 **Sparkline(미니 추세선)**으로 표시.
* **AI:** RAG 파이프라인을 통해 "재무제표 수치 + 최신 뉴스 + 유저 일지"를 컨텍스트로 주입.
* **Output:** "매출은 전년 대비 15% 성장했으나, 부채비율이 상승 중입니다." 형태의 전문 분석가 톤 출력 (출처 명시).

### 4.3. 종목별 타임라인 (Mobile Path)

* 종목 상세 페이지 하단에 배치.
* [캡처 이미지 조각 + 일지 카드 + 당시 뉴스 헤드라인]을 시간순으로 나열하여 '투자 복기' 가능하게 구현.

---

## 5. UI/UX Components (Toss Style Guide)

1. **Colors:** * Background: `#101113` (Toss Dark)
* Card: `#1c1d20`
* Accent: `#3182f6` (Toss Blue)
* Up/Down: `#f04452` (Red) / `#3182f6` (Blue)


2. **Interaction:** * 카드 클릭 시 `Framer Motion`을 이용한 페이지 슬라이드 전환 (토스 앱 방식).
* 스크롤 시 헤더 투명도 변화 및 상단 고정.



---

## 6. API Endpoints (FastAPI)

* `POST /auth/register`: 회원가입
* `POST /auth/login`: 로그인 및 JWT 발급
* `POST /portfolio/upload`: 스크린샷 업로드 + OCR + 일지 저장
* `GET /portfolio/summary`: 통합 포트폴리오 데이터 반환
* `GET /stock/{symbol}/analysis`: 재무제표(표/추세선) + AI 요약 리포트 반환
* `GET /stock/{symbol}/timeline`: 해당 종목의 과거 기록 및 일지 반환

---

## 7. AI Prompt Strategy (System Instruction)

> "당신은 월스트리트의 수석 분석가입니다. 사용자가 제공한 재무 데이터와 실시간 뉴스, 그리고 사용자의 매매 일지를 바탕으로 가장 객관적이고 날카로운 비평을 제공하십시오. 모든 조언은 반드시 재무제표 수치와 뉴스 출처를 근거로 들어야 하며, 토스증권의 UI에 맞게 명확한 결론부터 제시하십시오."

---

**Antigravity에게 전달할 메시지:**


