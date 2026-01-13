---
description: [현재 상태 & 할 일] 모든 작업의 기준점
---

# 📝 프로젝트 과제 및 상태 (Task & Status)

## 📌 현재 상태 (Current Status)
- **Backend**: FastAPI 서버 정상화 완료.
  - 404 Error (`/portfolio/ai-insight`) 해결 (Docker Rebuild 완료).
  - AI 분석 기능 (`GPT-4o` 기반) 구현 및 배포 완료.
- **Frontend**: Next.js 대시보드 구현 완료.
  - 포트폴리오 차트 애니메이션 및 디자인 개선.
  - AI 분석 결과 표시 UI 적용 (`aiInsight` state).

## ✅ 완료된 과제 (Completed Tasks)
- [x] **초기 설정**: FastAPI + Next.js + PostgreSQL(pgvector) Docker Compose 환경 구축.
- [x] **백엔드**: 기본 인증(Auth) 및 포트폴리오 CRUD API 구현.
- [x] **기능구현**: 스크린샷 업로드 및 Vision AI 분석 로직 구현.
- [x] **기능구현**: 포트폴리오 대시보드 (Chart + List) UI 개발.
- [x] **기능구현**: 장기 투자 AI 분석 기능 (`/portfolio/ai-insight`) 추가.
- [x] **트러블슈팅**: 404 API Not Found 문제 해결 (Volume 동기화 및 강제 빌드).

## 🚀 향후 과제 (Upcoming Tasks)
### 1. 안정화 및 최적화
- [ ] **백그라운드 작업**: 리포트 생성 등 무거운 작업을 비동기(`BackgroundTasks`)로 처리.
- [ ] **에러 처리**: API 예외 처리 강화 및 프론트엔드 에러 바운더리 적용.

### 2. 기능 확장: 실시간 시세 및 리포트
- [ ] **실시간 주가 추적 (Real-time Tracking)**:
  - [ ] **Backend**: `yfinance`를 활용하여 최신 주가를 조회하는 경량 API (`GET /portfolio/prices`) 구현.
  - [ ] **Frontend**: `SWR` 또는 `React Query`를 이용한 **Polling(5~10초 주기)** 방식의 실시간 가격 업데이트 구현.
  - [ ] **UI**: 주가 변동에 따른 깜빡임 효과 및 실시간 등락률 색상 적용.
- [ ] **데이터 수집 (크롤링)**:
  - [ ] `yfinance`를 활용한 주요 재무제표(매출, 영업이익, PER/PBR 등) 데이터 수집 로직 구현.
  - [ ] `BeautifulSoup` 또는 `Google News API`를 활용한 보유 종목 관련 최신 뉴스 크롤링.
- [ ] **AI 분석**:
  - [ ] 수집된 재무 데이터 + 뉴스를 GPT-4o에 주입하여 "종목별 투자 의견(매수/매도/관망)" 및 요약 생성.
- [ ] **이메일 서비스**:
  - [ ] `FastAPI-Mail` 설정 (SMTP 서버 연동).
  - [ ] HTML 이메일 템플릿 디자인 (차트 이미지 및 AI 요약 포함).
  - [ ] `/portfolio/report` 엔드포인트 구현 (리포트 생성 및 발송 트리거).

### 3. 인프라
- [ ] **로깅**: ELK 스택 또는 로컬 파일 로깅 시스템 구축.
- [ ] **CI/CD**: GitHub Actions 기본 워크플로우 설정 (Build & Test).
