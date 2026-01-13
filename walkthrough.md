---
description: [기록] 주요 의사결정 및 트러블슈팅 기록
---

# 📚 워크스루 및 트러블슈팅 로그 (Walkthrough & Troubleshooting Log)

## 🛠 트러블슈팅 히스토리 (Troubleshooting History)

### [해결됨] `/portfolio/ai-insight` 지속적인 404 에러 (2026-01-13)
- **이슈**: 백엔드 코드를 업데이트하여 새 API 엔드포인트를 추가했으나, 요청 시 404 Not Found 반환.
- **원인**: Docker 볼륨 동기화 문제로 인해, 로컬에서 코드를 수정했음에도 컨테이너 내부에서는 실행 중인 프로세스에 라우터가 제대로 등록되지 않는 현상 발생(Stale code).
- **해결**: 다음 명령어로 백엔드 컨테이너를 강제로 재빌드하여 새 코드를 이미지에 반영함.
  ```powershell
  docker-compose up -d --build backend
  ```
- **결과**: API 엔드포인트가 정상적으로 등록되어 접근 가능해짐.

### [해결됨] 백엔드 시작 실패 (Email Validator) (2026-01-13)
- **이슈**: 백엔드 컨테이너가 실행 즉시 종료됨. 로그에 `ModuleNotFoundError: No module named 'email_validator'` 출력.
- **원인**: Pydantic 스키마 검증에 필수적인 `pydantic[email]` 의존성이 `requirements.txt`에 누락됨.
- **해결**: `requirements.txt`에 `email-validator`를 추가하고 컨테이너 재빌드.

### [해결됨] Next.js Fetch Error (Port 8001) (2026-01-13)
- **이슈**: 프론트엔드에서 백엔드 호출 시 `TypeError: Failed to fetch` 발생.
- **분석**: Docker 포트 매핑(`8001:8000`)은 정상이었으나, 위의 `email-validator` 에러로 인해 백엔드 서버가 죽어있는 상태였음이 확인됨.
- **해결**: 백엔드 크래시 문제를 해결함으로써 Fetch 에러도 자연스럽게 해결됨.

## 📝 설계 및 아키텍처 의사결정 (Design & Architecture Decisions)

### 1. 프로젝트 구조 통합
- 흩어져 있던 마크다운 가이드 파일들(`PRD.md`, `DOCKER_GUIDE.md` 등)을 다음 3개의 핵심 파일로 통합 정리:
  - `task.md`: 과제 및 진행 상태.
  - `implementation_plan.md`: 시스템 명세 및 아키텍처.
  - `walkthrough.md`: 로그 및 히스토리.

### 2. Docker 및 인프라
- 로컬 오케스트레이션을 위해 **Docker Compose** 사용.
- RAG 기능을 위해 `pgvector` 이미지가 포함된 **PostgreSQL** 사용.
- **포트 매핑**:
  - Backend: Host `8001` -> Container `8000` (일반적인 8000번 충돌 방지).
  - Frontend: Host `3000` -> Container `3000`.
  - DB: Host `5432` -> Container `5432`.

### 3. AI 분석 구현
- 별도의 POST `/portfolio/ai-insight` 엔드포인트를 추가하기로 결정.
- 뷰(View)를 깔끔하게 유지하기 위해 로직을 `rag.py`로 분리.
- 고품질의 금융 추론을 위해 `GPT-4o` 사용.

### 4. 고급 리포팅 시스템 (계획됨)
- **목표**: 이메일을 통해 전문가 수준의 투자 리포트 제공.
- **구성요소**:
  - **크롤러**: 실시간 재무제표(분기) 및 뉴스 수집. `yfinance`는 수치 데이터용, `BeautifulSoup`은 뉴스 텍스트용.
  - **분석**: AI가 "정량 데이터"(재무)와 "정성 데이터"(뉴스)를 종합하여 전체적인 관점 도출.
  - **전송**: 접근성과 보존성을 위해 HTML 이메일 채택.

### 5. 실시간 시세 추적 구현 방식 (결정됨)
- **방식**: 복잡한 WebSocket 대신 **Polling (단기 주기 호출)** 방식 채택.
- **이유**: 주식 시장 데이터는 초단위 변화가 크지 않으며, MVP 단계에서 WebSocket 서버 구축 비용과 복잡도를 줄이기 위함. `SWR`이나 `React Query` 라이브러리로 쉽게 구현 가능.
- **데이터 소스**: `yfinance` (무료, 지연 시세) 활용.

---
**비고 (Note)**: 이 문서는 프로젝트의 발전 과정과 문제 해결 여정을 기록하는 역사적 기록물입니다.
