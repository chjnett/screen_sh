---
description: [기록] 주요 의사결정 및 트러블슈팅 기록
---

# 📚 Walkthrough & Troubleshooting Log

## 🛠 Troubleshooting History

### [Resolved] Persistent 404 Error on `/portfolio/ai-insight` (2026-01-13)
- **Issue**: Backend code was updated with new API endpoint, but requests returned 404 Not Found.
- **Cause**: Docker volume synchronization issue caused the container to run stale code despite local changes (`router` not registered correctly in running process).
- **Solution**: Forced rebuild of the backend container to bake in the new code.
  ```powershell
  docker-compose up -d --build backend
  ```
- **Result**: API endpoint successfully registered and accessible.

### [Resolved] Backend Startup Failure (Email Validator) (2026-01-13)
- **Issue**: Backend container exited immediately. Logs showed `ModuleNotFoundError: No module named 'email_validator'`.
- **Cause**: `pydantic[email]` requirement was missing in `requirements.txt` but consumed by schema validation.
- **Solution**: Added `email-validator` to `requirements.txt` and rebuilt container.

### [Resolved] Next.js Fetch Error (Port 8001) (2026-01-13)
- **Issue**: `TypeError: Failed to fetch` when calling backend from frontend.
- **Analysis**: Verified Docker port mapping (`8001:8000`). Confirmed backend was down due to the `email-validator` error above.
- **Solution**: Fixed backend crash, solving the fetch error.

## 📝 Design & Architecture Decisions

### 1. Unified Project Structure
- Consolidated scattered markdown guides (`PRD.md`, `DOCKER_GUIDE.md`, etc.) into three core files:
  - `task.md`: Tasks and Status.
  - `implementation_plan.md`: System specs and architecture.
  - `walkthrough.md`: Logs and history.

### 2. Docker & Infrastructure
- Used **Docker Compose** for local orchestration.
- **PostgreSQL** with `pgvector` image used for RAG capability.
- **Port Mapping**:
  - Backend: Host `8001` -> Container `8000` (to avoid conflict with common 8000 usage).
  - Frontend: Host `3000` -> Container `3000`.
  - DB: Host `5432` -> Container `5432`.

### 3. AI Analysis Implementation
- Decided to add a dedicated POST `/portfolio/ai-insight` endpoint.
- Logic separated into `rag.py` to keep views clean.
- Used `GPT-4o` for high-quality financial reasoning.

### 4. Advanced Reporting System (Planned)
- **Goal**: Provide professional-grade investment reports via email.
- **Components**:
  - **Crawler**: To fetch real-time financial statements (Quarterly) and News. `yfinance` is sufficient for numbers; `BeautifulSoup` needed for news text.
  - **Analysis**: AI will synthesize "Hard Data" (Financials) and "Soft Data" (News) to generate a holistic view.
  - **Delivery**: HTML Email chosen for accessibility and retention.

---
**Note**: This document serves as the historical record of the project's evolution and problem-solving journey.
