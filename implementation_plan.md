---
description: [설계도] 전체 시스템의 구조와 구현 계획
---

# 🏗 구현 계획 및 아키텍처 (Implementation Plan & Architecture)

## 1. 시스템 아키텍처 (System Architecture)
- **Frontend**: Next.js (React), Tailwind CSS, Framer Motion
- **Backend**: FastAPI (Python), SQLAlchemy, LangChain
- **Database**: PostgreSQL (pgvector 확장 사용)
- **AI/LLM**: OpenAI GPT-4o (Vision & Chat)
- **데이터 파이프라인**:
  - **크롤러**: `yfinance` (재무지표), `BeautifulSoup` (뉴스)
  - **리포트 엔진**: `Jinja2` (HTML 템플릿), `WeasyPrint` (PDF 생성), `Matplotlib` (차트 이미지)
  - **이메일 서비스**: `FastAPI-Mail` (SMTP)
- **인프라**: Docker Compose (Self-managed)

## 2. 디렉토리 구조 (Directory Structure)
```
c:\workspace2\screen_sh\
├── backend/                # FastAPI 애플리케이션
│   ├── app/
│   │   ├── api/            # API 엔드포인트 (인증, 포트폴리오)
│   │   ├── models.py       # SQLAlchemy 데이터 모델
│   │   ├── schemas.py      # Pydantic 스키마
│   │   ├── rag.py          # RAG 로직 (임베딩 & 검색)
│   │   └── services/       # 비즈니스 로직
│   │       ├── report_generator.py # PDF Creation Logic
│   │       └── mailer.py           # Email Logic
│   │   ├── templates/              # Jinja2 HTML Templates
│   │       └── report_template.html
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/               # Next.js 애플리케이션
│   ├── app/                # App Router 페이지
│   ├── components/         # UI 컴포넌트 (Recharts, Framer Motion)
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # 서비스 오케스트레이션
└── task.md                 # 프로젝트 관리
```

## 3. 데이터베이스 스키마 (Database Schema)
### `users` (사용자)
- `id`: UUID (기본키)
- `email`: VARCHAR (고유값)
- `hashed_password`: VARCHAR

### `portfolios` (포트폴리오)
- `id`: SERIAL (기본키)
- `user_id`: UUID (외래키)
- `name`: VARCHAR
- `total_value`: DECIMAL (총 자산 가치)
- `risk_assessment`: TEXT (AI 분석 인사이트)

### `portfolio_items` (보유 종목)
- `id`: SERIAL (기본키)
- `portfolio_id`: INTEGER (외래키)
- `symbol`: VARCHAR (티커)
- `quantity`: DECIMAL (수량)
- `avg_price`: DECIMAL (평단가)
- `current_price`: DECIMAL (현재가)

### `market_knowledge` (RAG 지식베이스)
- `id`: SERIAL (기본키)
- `embedding`: VECTOR(1536) (벡터 임베딩)
- `content`: TEXT (본문 내용)
- `source_url`: TEXT (출처 URL)

## 4. 주요 워크플로우 (Key Workflows)
### A. 포트폴리오 분석 흐름
1. **사용자**: 스크린샷 업로드 -> Frontend가 `/portfolio/analyze` 호출.
2. **Backend**: 
   - `GPT-4o Vision`이 티커, 수량, 평단가를 추출.
   - JSON 형태로 데이터 반환.
3. **Frontend**: 확인 모달 표시 -> 사용자 승인 -> `POST /portfolio`.
4. **Backend**: DB 저장 -> 총 자산 가치 계산.

### B. AI 인사이트 흐름
1. **Frontend**: `/portfolio/ai-insight` 호출.
2. **Backend**:
   - DB에서 보유 종목 조회.
   - "장기 투자 분석" 프롬프트 생성.
   - OpenAI Chat Completion 호출.
   - 텍스트 인사이트 반환.

### C. 일일 분석 리포트 (이메일)
1. **트리거**: 사용자 요청 (`POST /portfolio/report`) 또는 스케줄링 (Cron).
2. **데이터 수집**:
   - 각 보유 종목에 대해:
     - `yfinance`로 **재무제표** 조회 (매출, 순이익, PER, PBR).
     - `BeautifulSoup`으로 상위 3개 **최신 뉴스** 크롤링 (네이버 금융/구글 뉴스).
3. **AI 처리**:
   - 프롬프트: "이 재무 데이터와 뉴스를 기반으로 종목을 분석해줘."
   - 결과: 요약 + 시장 심리 (매수/매도).
4. **이메일 생성**:
   - HTML 템플릿에 분석 내용 병합.
   - 포트폴리오 도넛 차트 포함 (선택 사항).
   - SMTP로 발송 (Gmail/AWS SES).

### D. 실시간 주가 업데이트 흐름
1. **Frontend**: 대시보드 진입 시 `GET /portfolio/prices` 폴링 시작 (예: 10초 간격).
2. **Backend**:
   - `yfinance`의 `FastInfo` 기능을 사용하여 지연 없이 최신가 조회.
   - DB 업데이트 없이 메모리/캐시에서 빠르게 응답 (성능 최적화).
3. **Frontend**:
   - 응답받은 현재가를 기존 데이터와 비교.
   - 가격 변동 시 UI 업데이트 (Flash Effect).

## 5. 디자인 가이드 (Toss 스타일)
- **색상**: 다크 배경 (`#101113`), 카드 (`#1c1d20`), 강조 블루 (`#3182f6`).
- **타이포그래피**: Pretendard 또는 Inter.
- **인터랙션**: `Framer Motion`을 활용한 마이크로 인터랙션.
