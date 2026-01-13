---
description: [현재 상태 & 할 일] 모든 작업의 기준점
---

# 📝 Project Tasks & Status

## 📌 Current Status
- **Backend**: FastAPI 서버 정상화 완료.
  - 404 Error (`/portfolio/ai-insight`) 해결 (Docker Rebuild 완료).
  - AI 분석 기능 (`GPT-4o` 기반) 구현 및 배포 완료.
- **Frontend**: Next.js 대시보드 구현 완료.
  - 포트폴리오 차트 애니메이션 및 디자인 개선.
  - AI 분석 결과 표시 UI 적용 (`aiInsight` state).

## ✅ Completed Tasks
- [x] **Project Setup**: FastAPI + Next.js + PostgreSQL(pgvector) Docker Compose 환경 구축.
- [x] **Backend**: 기본 인증(Auth) 및 포트폴리오 CRUD API 구현.
- [x] **Feature**: 스크린샷 업로드 및 Vision AI 분석 로직 구현.
- [x] **Feature**: 포트폴리오 대시보드 (Chart + List) UI 개발.
- [x] **Feature**: 장기 투자 AI 분석 기능 (`/portfolio/ai-insight`) 추가.
- [x] **TroubleShooting**: 404 API Not Found 문제 해결 (Volume 동기화 및 강제 빌드).

## 🚀 Upcoming Tasks (Backlog)
### 1. Stability & Optimization
- [ ] **Background Tasks**: 주가 업데이트 로직(`yfinance`)을 백그라운드 작업(`Celery` or `BackgroundTasks`)으로 전환 (현재 동기식).
- [ ] **Error Handling**: API 예외 처리 강화 및 프론트엔드 에러 바운더리 적용.

### 2. Feature Expansion: Deep Analysis & Reporting
- [ ] **Data Gathering (Crawling)**:
  - [ ] `yfinance`를 활용한 주요 재무제표(매출, 영업이익, PER/PBR 등) 데이터 수집 로직 구현.
  - [ ] `BeautifulSoup` 또는 `Google News API`를 활용한 보유 종목 관련 최신 뉴스 크롤링.
- [ ] **AI Analysis**:
  - [ ] 수집된 재무 데이터 + 뉴스를 GPT-4o에 주입하여 "종목별 투자 의견(매수/매도/관망)" 및 요약 생성.
- [ ] **Email Service**:
  - [ ] `FastAPI-Mail` 설정 (SMTP 서버 연동).
  - [ ] HTML 이메일 템플릿 디자인 (차트 이미지 및 AI 요약 포함).
  - [ ] `/portfolio/report` 엔드포인트 구현 (리포트 생성 및 발송 트리거).

### 3. Infrastructure
- [ ] **Logging**: ELK 스택 또는 로컬 파일 로깅 시스템 구축.
- [ ] **CI/CD**: GitHub Actions 기본 워크플로우 설정 (Build & Test).
