---
description: [설계도] 전체 시스템의 구조와 구현 계획
---

# 🏗 Implementation Plan & Architecture

## 1. System Architecture
- **Frontend**: Next.js (React), Tailwind CSS, Framer Motion
- **Backend**: FastAPI (Python), SQLAlchemy, LangChain
- **Database**: PostgreSQL (pgvector extension enabled)
- **AI/LLM**: OpenAI GPT-4o (Vision & Chat)
- **Data Pipeline**:
  - **Crawler**: `yfinance` (Financials), `BeautifulSoup` (News)
  - **Email Service**: `FastAPI-Mail` (SMTP)
- **Infrastructure**: Docker Compose (Self-managed)

## 2. Directory Structure
```
c:\workspace2\screen_sh\
├── backend/                # FastAPI Application
│   ├── app/
│   │   ├── api/            # API Endpoints (Auth, Portfolio)
│   │   ├── models.py       # SQLAlchemy Models
│   │   ├── schemas.py      # Pydantic Schemas
│   │   ├── rag.py          # RAG Logic (Embedding & Search)
│   │   └── services/       # Business Logic
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/               # Next.js Application
│   ├── app/                # App Router Pages
│   ├── components/         # UI Components (Recharts, Framer Motion)
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # Service Orchestration
└── task.md                 # Project Management
```

## 3. Database Schema
### `users`
- `id`: UUID (PK)
- `email`: VARCHAR (Unique)
- `hashed_password`: VARCHAR

### `portfolios`
- `id`: SERIAL (PK)
- `user_id`: UUID (FK)
- `name`: VARCHAR
- `total_value`: DECIMAL
- `risk_assessment`: TEXT (AI Insight)

### `portfolio_items`
- `id`: SERIAL (PK)
- `portfolio_id`: INTEGER (FK)
- `symbol`: VARCHAR
- `quantity`: DECIMAL
- `avg_price`: DECIMAL
- `current_price`: DECIMAL

### `market_knowledge` (RAG)
- `id`: SERIAL (PK)
- `embedding`: VECTOR(1536)
- `content`: TEXT
- `source_url`: TEXT

## 4. Key Workflows
### A. Portfolio Analysis Flow
1. **User**: Uploads screenshot -> Frontend sends to `/portfolio/analyze`.
2. **Backend**: 
   - `GPT-4o Vision` extracts Ticker, Quantity, Avg Price.
   - Returns JSON data.
3. **Frontend**: Displays confirm modal -> User approves -> POST `/portfolio`.
4. **Backend**: Saves to DB -> Calculates Total Value.

### B. AI Insight Flow
1. **Frontend**: Calls `/portfolio/ai-insight`.
2. **Backend**:
   - Fetches portfolio items from DB.
   - Generates prompt for "Long-term Investment Analysis".
   - Calls OpenAI Chat Completion.
   - Returns text insight.

### C. Daily Analysis Report (Email)
1. **Trigger**: User request (`POST /portfolio/report`) or Scheduled Task (Cron).
2. **Data Gathering**:
   - For each stock in portfolio:
     - Fetch **Financials** (Revenue, Net Income, PER, PBR) via `yfinance`.
     - Crawl top 3 **Recent News** via `BeautifulSoup` (Naver Finance/Google News).
3. **AI Processing**:
   - Prompt: "Analyze this stock based on these financials and news."
   - Output: Summary + Sentiment (Bullish/Bearish).
4. **Email Generation**:
   - Compile findings into an HTML Template.
   - Embed Portfolio Donut Chart (optional).
   - Send via SMTP (Gmail/AWS SES).

## 5. Design Guidelines (Toss Style)
- **Colors**: Dark Background (`#101113`), Card (`#1c1d20`), Accent Blue (`#3182f6`).
- **Typography**: Pretendard or Inter.
- **Interaction**: Micro-interactions with `Framer Motion`.
