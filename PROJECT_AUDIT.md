# 📘 LogMind System Architecture Deep Dive
> **Project**: LogMind Investment Dashboard  
> **Version**: 1.0.0 (MVP)  
> **Last Updated**: 2026-01-13

본 문서는 **LogMind** 애플리케이션의 **소스 코드, 데이터 흐름, 인프라 구조**를 개발자가 100% 이해할 수 있도록 상세하게 기술한 **심층 분석 보고서(Whitepaper)**입니다.

---

## 1. 🏗️ High-Level Architecture (거시적 구조)

이 시스템은 **MSA(Microservices Architecture)를 지향하는 모놀리식 구조**로, Docker Compose를 통해 3개의 컨테이너가 유기적으로 연결됩니다.

```mermaid
graph TD
    Client[🖥️ Browser (User)]
    
    subgraph "Docker Network: logmind-network"
        Frontend[⚡ Next.js Container :3000]
        Backend[🐍 FastAPI Container :8000]
        DB[🐘 PostgreSQL Container :5432]
    end

    Client -->|HTTP/TCP| Frontend
    Client -->|API Calls (Proxy/Direct)| Backend
    Backend -->|SQL| DB
    Backend -->|External API| World[🌐 External World]
    
    World -->|Yahoo Finance| Backend
    World -->|Google News| Backend
    World -->|OpenAI GPT| Backend
```

### 📋 Container Specs
| Service | Image Base | Role | Key Libs |
|---|---|---|---|
| **Frontend** | `node:18-alpine` | UI 렌더링, 클라이언트 로직 | React, Tailwind, Framer Motion, Recharts |
| **Backend** | `python:3.10` | API 서버, 비즈니스 로직, 데이터 처리 | FastAPI, SQLAlchemy, Pandas, ReportLab, LangChain |
| **Database** | `ankane/pgvector` | 영구 저장소 + 벡터 연산(AI용) | PostgreSQL 15, pgvector |

---

## 2. 🧩 Component & Code Interaction (코드 레벨 상세 분석)

### 2.1 🎨 Frontend Layer (`/frontend`)
Next.js 13+ App Router를 기반으로 하며, **Client-Side Component** 위주로 동작합니다.

*   **`app/layout.tsx`**: 애플리케이션의 뼈대. 전역 폰트 및 스타일(`globals.css`) 로드.
*   **`components/PortfolioDashboard.tsx`** (핵심 컴포넌트):
    *   **State**: `data`(포트폴리오), `polling`(실시간 가격).
    *   **Hooks**: `useEffect`로 5초마다 시세 업데이트 (`setInterval`).
    *   **Event**: "리포트 다운로드" 버튼 클릭 시 -> `API POST /report/download` 호출 -> `Blob` 수신 -> `<a download>` 태그 생성 및 클릭 트리거.

### 2.2 🧠 Backend Service Layer (`/backend/app`)
FastAPI의 라우터-서비스 패턴을 따릅니다.

#### **A. API Router (`api/portfolio.py`)**
모든 요청의 진입점입니다.
*   `GET /portfolio`: DB에서 User의 포트폴리오를 조회하여 반환.
*   `GET /portfolio/prices`: **DB를 거치지 않고** `yfinance`를 통해 실시간 시세만 빠르게 조회 (속도 최적화).
*   `POST /portfolio/report/download`: **동기식(Synchronous)**으로 리포트 생성 파이프라인 실행.

#### **B. Core Services (비즈니스 로직)**
가장 중요한 3가지 모듈이 협력하여 리포트를 생성합니다.

1.  **Crawler (`services/crawler.py`)**:
    *   **역할**: Raw Data 수집기.
    *   `get_financial_summary(symbol)`: `yfinance.Ticker` 객체 생성 -> `fast_info`로 실시간 가격, `info`로 PER/PBR 수집.
    *   `crawl_news(symbol)`: `requests`로 Google News RSS 요청 -> `BeautifulSoup(features='html.parser')`로 파싱.
    *   *Self-Correction*: `lxml` 라이브러리 부재로 인한 에러를 방지하기 위해 `html.parser` 강제 사용.

2.  **AI Analyst (`services/rag.py`)**:
    *   **역할**: 데이터 해석기.
    *   `analyze_portfolio_long_term(data)`: 수집된 재무/뉴스 데이터를 텍스트 프롬프트로 변환 -> `ChatOpenAI(GPT-4o)` 호출 -> 투자 인사이트(Text) 반환.
    *   *비용 절감*: 모든 뉴스를 다 넣지 않고 제목 위주로 요약해서 전송.

3.  **Report Generator (`services/report_generator.py`)**:
    *   **역할**: 최종 결과물 생산기 (PDF).
    *   **Library**: `ReportLab` (Pure Python PDF Engine).
    *   **Chart**: `Matplotlib(Agg Backend)`를 통해 메모리 상에서 파이차트 이미지 생성(`BytesIO`) -> PDF에 삽입.
    *   **Font**: `app/fonts/NanumGothic.ttf`를 로드하여 한글 깨짐 방지. **폰트 파일이 없으면 Helvetica로 강제 전환되는 Fail-Safe 존재.**

---

## 3. 🔄 Data Pipeline Workflow (데이터 처리 흐름)

사용자가 **"리포트 다운로드"**를 클릭했을 때 벌어지는 일련의 과정입니다.

1.  **Request**: `POST /report/download` (From Frontend)
2.  **Step 1: Data Gathering (Crawler)**
    *   *Input*: `['AAPL', '005930.KS']`
    *   *Processing*: 
        *   AAPL -> 가격 $185, PER 28, 뉴스 3건 수집.
        *   005930.KS -> 가격 73,000원, PER 15, 뉴스 3건 수집.
    *   *Output*: `List[StockDetail]` (가격, 뉴스, 재무지표 포함)
3.  **Step 2: AI Synthesis (RAG)**
    *   *Input*: 위 Step 1의 데이터 JSON.
    *   *Processing*: GPT-4o에게 "이 포트폴리오의 리스크와 전망을 3줄로 요약해" 요청.
    *   *Output*: "기술주 비중이 높으나 성장성 양호..." (String)
4.  **Step 3: Document Rendering (ReportLab)**
    *   *Input*: 유저 이메일, AI 분석글, 주식 데이터 리스트.
    *   *Processing*: 
        *   A4 종이 Canvas 생성.
        *   나눔고딕 폰트 로드.
        *   Matplotlib 차트 그리기.
        *   테이블 및 텍스트 배치.
    *   *Output*: `bytes` (PDF Binary)
5.  **Response**: `StreamingResponse` (To Frontend) -> 브라우저 자동 다운로드.

---

## 4. 🗄️ Database Schema (`models.py`)

PostgreSQL 스키마 구조입니다.

| Table | Column | Type | Description |
|---|---|---|---|
| **users** | `id` | Integer | PK |
| | `email` | String | 로그인 ID |
| | `password_hash` | String | Bcrypt Hash |
| **portfolios** | `id` | Integer | PK |
| | `user_id` | Integer | FK (users.id) |
| | `created_at` | DateTime | 생성일 |
| **items** | `id` | Integer | PK |
| | `portfolio_id` | Integer | FK (portfolios.id) |
| | `symbol` | String | 티커 (AAPL, 005930.KS) |
| | `quantity` | Float | 보유 수량 |
| | `avg_price` | Float | 평균 단가 (매수 가격) |
| | `current_price`| Float | (Optional) 최근 조회 가격 (캐싱용) |

---

## 5. ⚠️ Known Issues & Trouble Spots (주요 주의 지점)

개발자가 코드를 수정할 때 주의해야 할 부분입니다.

1.  **Crawler Stability**:
    *   `yfinance`는 비공식 API이므로 예고 없이 차단되거나 필드명이 바뀔 수 있습니다. (`Financial trend fetch failed` 경고가 뜨는 이유)
    *   -> **해결책**: `yfinance` 버전 고정 및 Fail-Safe 로직(데이터 없으면 0 처리) 필수.

2.  **PDF Font Dependency**:
    *   Docker 컨테이너를 새로 빌드할 때 `backend/app/fonts/NanumGothic.ttf` 파일이 반드시 포함되어야 합니다.
    *   -> **확인법**: `docker exec logmind-backend ls app/fonts/`

3.  **Memory Usage**:
    *   `Matplotlib` 차트 생성은 메모리를 많이 사용합니다. 동시 접속자가 수백 명이 될 경우 서버가 느려질 수 있습니다.
    *   -> **확인법**: `matplotlib.pyplot.close()`를 반드시 호출하여 메모리 누수 방지 (현재 코드에 적용됨).

---
**작성자**: LogMind Lead Architect
