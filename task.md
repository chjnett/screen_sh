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
- [x] **실시간 주가 추적 (Real-time Tracking)**:
  - [x] **Backend**: `yfinance`를 활용하여 최신 주가를 조회하는 경량 API (`GET /portfolio/prices`) 구현.
  - [x] **Frontend**: `SWR` 또는 `React Query`를 이용한 **Polling(5~10초 주기)** 방식의 실시간 가격 업데이트 구현.
  - [x] **UI**: 주가 변동에 따른 깜빡임 효과 및 실시간 등락률 색상 적용.
- [ ] **데이터 수집 (크롤링)**:하여 토큰 비용 최적화.
- [ ] **PDF 리포트 생성 (Generation)**:
  - [ ] **HTML 템플릿**: `Jinja2`로 디자인된 리포트 프레임(건전성, 심리, 전략, 캘린더) 작성.
  - [ ] **차트 생성**: `Matplotlib`으로 주요 지표를 시각화하여 이미지로 저장.
  - [ ] **PDF 변환**: `WeasyPrint`를 사용하여 HTML -> PDF 변환 로직 구현.
- [ ] **이메일 발송 (Delivery)**:
  - [ ] `FastAPI-Mail` + `BackgroundTasks` 연동 (비동기 발송).
  - [ ] `/portfolio/report` 엔드포인트 구현.

### 2.1. 리포트 상세 콘텐츠 구현 (Content)
- [ ] **① 재무 건전성**: PER/PBR 밴드 차트, 3개년 성장률 그래프 포함.
- [ ] **② 시장 심리**: 뉴스 키워드 분석 및 AI 감성 게이지 차트.
- [ ] **③ 대응 전략**: GPT-4o 기반 시나리오(매수/매도 가격대) 및 상관관계 분석.
- [ ] **④ 캘린더**: 보유 종목의 실적 발표일 및 배당 지급일 정리.

### 3. 인프라
- [ ] **로깅**: ELK 스택 또는 로컬 파일 로깅 시스템 구축.
- [ ] **CI/CD**: GitHub Actions 기본 워크플로우 설정 (Build & Test).
