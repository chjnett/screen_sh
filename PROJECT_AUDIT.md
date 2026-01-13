# 🏗️ 프로젝트 구조 및 아키텍처 감사 보고서 (Project Architecture & Audit Report)

본 문서는 `screen_sh` 프로젝트의 폴더 구조를 기반으로 시스템 아키텍처를 분석하고, 잠재적인 오류 발생 지점 및 유지보수 가이드를 제공합니다.

---

## 1. 📂 프로젝트 폴더 구조 (Directory Structure Audit)

이 프로젝트는 **Monorepo** 스타일로 구성되어 있으며, Frontend(Next.js)와 Backend(FastAPI)가 분리되어 Docker Compose로 통합됩니다.

```text
screen_sh/
├── 📂 frontend/                # [UI Layer] Next.js + React 기반 웹 애플리케이션
│   ├── 📂 app/                 # Next.js 13+ App Router 구조
│   │   ├── 📂 login/           # 로그인 페이지
│   │   ├── 📂 investments/     # 투자 분석 상세 페이지
│   │   ├── layout.tsx          # 전역 레이아웃 (Navbar, Sidebar)
│   │   └── page.tsx            # 메인 대시보드
│   ├── 📂 components/          # 재사용 가능한 UI 컴포넌트
│   │   ├── PortfolioDashboard.tsx # 포트폴리오 차트 및 현황판 (핵심)
│   │   └── RAGChat.tsx         # AI 챗봇 인터페이스
│   ├── Dockerfile              # 프론트엔드 빌드 명세 (Node.js)
│   └── package.json            # 프론트엔드 의존성 (Tailwind, Framer Motion, Recharts)
│
├── 📂 backend/                 # [Service Layer] FastAPI 기반 백엔드 서버
│   ├── 📂 app/
│   │   ├── 📂 api/             # API 엔드포인트 라우터
│   │   │   ├── auth.py         # JWT 인증 및 로그인
│   │   │   └── portfolio.py    # 포트폴리오 CRUD 및 리포트/AI 요청 처리 (핵심)
│   │   ├── 📂 core/            # 공통 설정
│   │   │   └── config.py       # 환경변수 로드 및 설정 관리
│   │   ├── 📂 services/        # 비즈니스 로직 (Controller)
│   │   │   ├── crawler.py      # [Crawler] yfinance & Google News 수집
│   │   │   ├── rag.py          # [AI] GPT-4o 기반 투자 분석 (LangChain)
│   │   │   ├── report_generator.py # [PDF] ReportLab 기반 PDF 생성기
│   │   │   ├── mailer.py       # [Email] SMTP 이메일 발송
│   │   │   └── portfolio_service.py # 포트폴리오 이미지 OCR 처리
│   │   ├── 📂 fonts/           # [Assets] PDF용 폰트 파일 (NanumGothic.ttf)
│   │   └── main.py             # FastAPI 앱 진입점 (CORS, 미들웨어 설정)
│   ├── Dockerfile              # 백엔드 빌드 명세 (Python 3.10)
│   └── requirements.txt        # 백엔드 의존성 (FastAPI, SQLAlchemy, ReportLab 등)
│
├── docker-compose.yml          # [Infra] 전체 서비스 오케스트레이션 (Front+Back+DB)
└── .env                        # [Config] 시스템 환경 변수 (DB 접속정보, API Keys)
```

---

## 2. 🏛️ 시스템 아키텍처 흐름 (Architecture Flow)

### 2.1 데이터 흐름도
```mermaid
graph TD
    User[👤 사용자] -->|접속| Frontend[🖥️ Next.js Frontend]
    Frontend -->|API 요청| API[🚀 FastAPI Backend]
    
    subgraph Service Layer
        API -->|1. 시세 조회| YF[yfinance API]
        API -->|2. 뉴스 수집| News[Google News RSS]
        API -->|3. AI 분석| GPT[OpenAI GPT-4o]
        API -->|4. PDF 생성| PDF[ReportLab Engine]
    end
    
    subgraph Data Layer
        API -->|CRUD| DB[(PostgreSQL + pgvector)]
    end

### 2.2 🧩 코드 레벨 상호작용 상세 (Code-Level Interaction Map)

각 기능이 실행될 때 파일 간에 어떤 함수가 호출되는지 상세 흐름을 설명합니다.

#### **A. 포트폴리오 대시보드 로딩 & AI 리포트 생성**
1.  **Frontend Trigger** (`PortfolioDashboard.tsx`)
    *   `fetchPortfolio()`: 페이지 로드 시 `GET /portfolio` 호출.
    *   `onClick={() => fetch(.../download)}`: 리포트 다운로드 버튼 클릭 시 호출.

2.  **API Router** (`backend/app/api/portfolio.py`)
    *   `@router.post("/report/download")`: 프론트 요청 수신.
    *   **Logic**:
        1.  `db.query(models.Portfolio)`: DB에서 사용자 포트폴리오 조회.
        2.  `DataCrawler.get_financial_summary()` 호출 -> `crawler.py`.
        3.  `rag.analyze_portfolio_long_term()` 호출 -> `rag.py`.
        4.  `ReportGenerator().create_pdf()` 호출 -> `report_generator.py`.
        5.  `StreamingResponse(pdf_bytes)`: 최종 PDF 파일 반환.

3.  **Service Layer (Controllers)**
    *   `crawler.py`: `yfinance`로 숫자 데이터, `BeautifulSoup`으로 뉴스 텍스트 수집.
    *   `rag.py`: 수집된 데이터를 텍스트 프롬프트로 변환하여 `OpenAI API`에 전송, 투자 조언 생성.
    *   `report_generator.py`: `ReportLab`을 이용해 Canvas에 선, 도형, 글자를 그려 PDF 바이너리 생성 (비동기 아님, CPU 연산).

#### **B. 실시간 시세 업데이트 (Polling)**
1.  **Frontend** (`PortfolioDashboard.tsx`)
    *   `useEffect` 내부 `setInterval(5000)`: 5초마다 백엔드 호출.
    *   요청: `GET /portfolio/prices`.

2.  **Backend** (`backend/app/api/portfolio.py`)
    *   `get_realtime_prices()` 함수 실행.
    *   **Logic**:
        *   DB에서 포트폴리오 종목 리스트(`item.symbol`)만 가져옴.
        *   `yfinance.Ticker(symbol).fast_info.last_price` 호출 (네트워크 요청).
        *   DB 업데이트 없이 **메모리 상에서만** 현재가 딕셔너리 생성 후 반환.
        *   *이유*: 5초마다 DB에 쓰기 작업을 하면 부하가 크기 때문.

#### **C. 로그인 및 인증 흐름**
1.  **Frontend** (`app/login/page.tsx`)
    *   폼 제출 -> `POST /auth/token`.
2.  **Backend** (`backend/app/api/auth.py`)
    *   `login_for_access_token()` 실행.
    *   `authenticate_user()` -> DB의 `users` 테이블 조회.
    *   `verify_password()` -> 해시된 비밀번호 비교.
    *   성공 시 `create_access_token()`으로 **JWT 토큰** 발급하여 반환.

---
```

---

## 3. 🚨 잠재적 오류 및 리스크 진단 (Audit & Risk Assessment)

폴더 구조와 코드를 분석했을 때 발견될 수 있는 잠재적 위험 요소입니다.

### 🔴 Critical (치명적 오류 가능성)
1.  **AI 분석 & ReportLab 폰트 호환성** (`backend/app/services/report_generator.py`)
    *   **위험**: PDF 생성 시 `.ttf` 폰트가 없으면 한글이 깨지거나(사각형), 프로그램이 종료됨.
    *   **진단**: `app/fonts/NanumGothic.ttf` 파일이 존재하는지, `Dockerfile` 빌드 시 해당 폴더가 컨테이너로 잘 복사되었는지 확인 필수.
    *   **조치**: `docker exec logmind-backend ls app/fonts` 로 파일 존재 확인.

2.  **크롤러 HTML 구조 변경** (`backend/app/services/crawler.py`)
    *   **위험**: Google News RSS 포맷이나 `yfinance` API가 변경되면 데이터 수집이 실패하여 0원 또는 빈 리스트 반환.
    *   **진단**: 주기적으로 크롤러 모듈 단독 테스트 필요.
    *   **조치**: `download_portfolio_report` 내의 Fail-Safe 로직(오류 발생 시에도 빈 리포트 생성)이 잘 작동하는지 확인.

3.  **데이터베이스 마이그레이션 부재** (`backend/app/models.py`)
    *   **위험**: 모델(`User`, `Portfolio`) 수정 시 DB 스키마가 자동으로 업데이트되지 않음. 현재 `alembic`을 사용하지 않고 `Base.metadata.create_all`만 사용 중.
    *   **진단**: 컬럼 추가/변경 시 테이블을 날리고 다시 만들어야 할 수 있음.
    *   **조치**: 향후 `Alembic` 도입 권장.

### 🟡 Warning (주의 요망)
1.  **동기식 처리의 한계** (`backend/app/api/portfolio.py`)
    *   **위험**: `/report/download`는 동기식(`async def`지만 내부 로직은 블로킹될 수 있음)으로 처리되어, 사용자가 많아지면 타임아웃 발생 가능.
    *   **조치**: 현재는 `StreamingResponse`로 즉시 반환하지만, 향후 작업 큐(Celery/Redis) 도입 고려.

2.  **환경 변수 관리** (`.env`)
    *   **위험**: `OPENAI_API_KEY`, `POSTGRES_PASSWORD` 등이 `.env`에 평문으로 저장됨.
    *   **조치**: 프로덕션 배포 시 Secret Manager 사용 권장.

---

## 4. ✅ 자가 진단 체크리스트 (Self-Audit Checklist)

시스템이 정상 작동하는지 확인하려면 다음 항목을 순서대로 점검하세요.

- [ ] **1. 컨테이너 상태 확인**:
  ```bash
  docker ps
  # logmind-frontend, logmind-backend, logmind-db 3개가 모두 Up 상태여야 함.
  ```

- [ ] **2. 백엔드 통신 확인**:
  - 브라우저에서 `http://localhost:8001/docs` 접속 -> Swagger UI가 뜨면 정상.
  
- [ ] **3. 데이터 파이프라인(Crawler) 테스트**:
  ```bash
  docker exec -it logmind-backend python app/services/crawler.py
  # JSON 형태의 뉴스 및 재무 데이터가 출력되어야 함.
  ```

- [ ] **4. PDF 폰트 확인**:
  ```bash
  docker exec logmind-backend ls -l app/fonts/NanumGothic.ttf
  # 파일이 존재해야 한글 리포트가 정상 생성됨.
  ```

- [ ] **5. 실시간 시세 연동 확인**:
  - 대시보드에서 포트폴리오 총 자산 가치가 5초마다 깜빡이며 변경되는지 확인. (장 중이 아니면 고정될 수 있음)

---
**작성일**: 2026-01-13
**작성자**: LogMind Architectural Auditor
