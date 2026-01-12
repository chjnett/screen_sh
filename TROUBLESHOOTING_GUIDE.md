# 트러블슈팅 가이드 (Troubleshooting Guide)

이 문서는 프로젝트 개발 중 발생했던 주요 오류와 그 해결 방법을 기록합니다. 추후 유사한 문제 발생 시 참고하여 빠르게 대응할 수 있습니다.

## 1. CORS (Cross-Origin Resource Sharing) 오류

**증상:**
브라우저 콘솔에 다음과 같은 에러가 출력되며 API 요청이 실패함.
```
Access to fetch at 'http://localhost:8000/auth/register' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**원인:**
프론트엔드(Port 3000)와 백엔드(Port 8000)의 도메인(포트)이 달라서 브라우저 보안 정책에 의해 차단됨.

**해결 방법:**
1.  **Backend 설정 (`backend/app/main.py`)**:
    FastAPI 앱에 `CORSMiddleware`를 추가하고 허용할 Origin을 명시합니다.
    ```python
    from fastapi.middleware.cors import CORSMiddleware

    # ... app 선언 후
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    ```
2.  **Docker 재빌드**: 코드를 수정했다면 반드시 컨테이너를 재시작해야 적용됩니다.
    ```powershell
    docker-compose up -d --build backend
    ```
3.  **브라우저 캐시 삭제**: 브라우저가 이전의 실패 응답을 캐싱하고 있을 수 있으므로, **시크릿 모드**를 사용하거나 **강력 새로고침(Ctrl+Shift+R)**을 시도합니다.

---

## 2. Bcrypt 버전 호환성 오류 (AttributeError)

**증상:**
백엔드 로그(`docker logs`)에 다음과 같은 에러가 발생하며 서버가 500 에러를 뱉음.
```
AttributeError: module 'bcrypt' has no attribute '__about__'
```

**원인:**
Python의 비밀번호 해싱 라이브러리인 `passlib`이 최신 버전의 `bcrypt` 라이브러리와 호환되지 않아서 발생합니다.

**해결 방법:**
`backend/requirements.txt` 파일에서 `bcrypt` 버전을 **4.0.1**로 고정합니다.
```text
passlib[bcrypt]
bcrypt==4.0.1
```
수정 후 백엔드 컨테이너를 재빌드합니다.

---

## 3. ModuleNotFoundError: 'pgvector'

**증상:**
백엔드 서버 실행 중 또는 `import` 시점에 모듈을 찾을 수 없다는 에러 발생.
```
ModuleNotFoundError: No module named 'pgvector'
```

**원인:**
`requirements.txt`에 해당 라이브러리가 누락되었거나, 추가 후 Docker 이미지를 재빌드하지 않음.

**해결 방법:**
1.  `backend/requirements.txt`에 `pgvector` 추가.
2.  **반드시** Docker 이미지를 다시 빌드하여 라이브러리를 설치해야 함.
    ```powershell
    docker-compose up -d --build backend
    ```

---

## 4. DB 연결 확인 및 데이터 조회 방법

로그인/회원가입이 성공했는지 DB 내부 데이터를 보고 싶을 때 사용합니다.

**터미널 명령어:**
```powershell
docker exec -it logmind-db psql -U user -d logmind -c "SELECT * FROM users;"
```

**DBeaver 접속 정보:**
*   Host: `localhost`
*   Port: `5432`
*   Database: `logmind`
*   Username: `user`
*   Password: `password` (또는 docker-compose.yml의 POSTGRES_PASSWORD 값)

---

## 5. 프론트엔드 통신 오류 (net::ERR_EMPTY_RESPONSE)

**증상:**
RAG 챗봇에서 질문 전송 시 브라우저 콘솔에 다음과 같은 에러가 발생함.
```
POST http://localhost:8000/rag/query net::ERR_EMPTY_RESPONSE
TypeError: Failed to fetch
```

**원인:**
서버가 응답을 보내기 전에 연결이 끊어졌거나, 백엔드 서버가 실행되지 않은 상태입니다. 특히 `.env` 설정이나 DB 연결 문제로 인해 서버 프로세스(uvicorn)가 비정상 종료되거나 시작되지 못했을 가능성이 큽니다.

**통신 흐름 (Communication Flow):**
1.  **Client (React)**: `RAGChat.tsx`에서 `fetch`로 `POST http://localhost:8000/rag/query` 요청을 보냄.
2.  **Server (FastAPI)**: 요청을 받아 `rag.py`의 로직(OpenAI 임베딩 -> DB 검색 -> GPT-4o 응답)을 수행.
3.  **Response**: 처리 결과를 `JSON` 형태로 반환.

**해결 방법:**

1.  **백엔드 서버 상태 확인 (가장 중요)**
    *   터미널에서 백엔드 서버가 실행 중인지 확인합니다.
    *   `.env` 파일을 새로 생성했다면, 반드시 **서버를 재시작**해야 환경변수가 로드됩니다.
    ```powershell
    # 로컬 실행 시
    cd backend
    uvicorn app.main:app --reload
    
    # Docker 실행 시
    docker-compose restart backend
    ```

2.  **OpenAI API 키 설정 확인**
    *   `backend/.env` 파일이 존재하는지, 그리고 `OPENAI_API_KEY`가 올바르게 입력되었는지 확인합니다.
    *   API 키가 없거나 잘못되면 `rag.py` 로딩 시 또는 호출 시 에러가 발생하여 서버가 죽을 수 있습니다.

3.  **서버 로그 확인**
    *   서버 실행 터미널(또는 `docker logs backend`)을 확인하여 에러 로그가 있는지 봅니다.
    *   `ModuleNotFoundError`, `AuthenticationError` 등이 있다면 해당 문제를 먼저 해결해야 합니다.

4.  **주소 및 포트 확인**
    *   브라우저에서 `http://localhost:8000`으로 접속해 봅니다. `{ "message": ... }` 응답이 와야 정상입니다.
    *   접속이 안 된다면 서버가 실행되지 않았거나 포트가 닫혀 있는 것입니다.


---

## 6. 시스템 포트 구성 및 네트워크 아키텍처 (System Architecture)

현재 로컬 개발 환경(Docker Compose)에서의 포트 구성은 다음과 같습니다. 통신 에러 발생 시 **누가 누구에게 요청을 보내는지** 파악하는 것이 가장 중요합니다.

### **Port Configuration**

| 서비스 (Service) | 내부 포트 (Internal) | 외부 포트 (External) | 설명 (Description) |
| :--- | :--- | :--- | :--- |
| **Frontend** | 3000 | **3000** | Next.js 웹 서버. `http://localhost:3000`으로 접속합니다. |
| **Backend** | 8000 | **8000** | FastAPI 백엔드 서버. `http://localhost:8000`으로 API 요청을 받습니다. |
| **Database** | 5432 | **5432** | PostgreSQL 데이터베이스. DBeaver 등의 툴로 직접 접속 가능합니다. |

### **통신 흐름 (Communication Flow)**

1.  **User Browser(Chrome)** -> `http://localhost:3000` (Frontend 접속)
2.  **User Browser(Chrome)** -> `http://localhost:8000` (API 요청, 예: 로그인, 포트폴리오 분석)
    *   **중요:** 프론트엔드 코드(`PortfolioDashboard.tsx` 등)가 브라우저에서 실행되므로, 요청 주소는 `backend`가 아니라 **`localhost`**여야 합니다.
3.  **Frontend Server(Next.js Node Process)** -> `http://backend:8000` (SSR 요청 시)
    *   **중요:** 서버 사이드 렌더링(SSR) 중에는 도커 내부망을 타야 하므로 서비스 명인 `backend`를 사용합니다.
4.  **Backend Server** -> `db:5432` (데이터베이스 연결)
    *   백엔드는 도커 내부에서 DB를 찾으므로 서비스 명인 `db`를 호스트로 사용합니다.

---

## 7. 주요 에러 개념 설명 (Error Concepts)

최근 발생한 에러들의 핵심 개념과 원인입니다.

### **A. `TypeError: Failed to fetch`**
*   **의미:** "서버 문조차 두드리지 못했다."
*   **상황:** 브라우저가 `http://localhost:8000`으로 편지를 보내려고 우체통에 넣으려는데, 우체통이 아예 없거나 길이 끊어진 상황입니다.
*   **원인:**
    1.  **서버 다운:** 백엔드 컨테이너(`logmind-backend`)가 꺼져 있거나, 에러로 인해 계속 재시작 중(CrashLoopBackOff)인 경우.
    2.  **주소 오류:** `.env.local` 등이 없어서 요청 주소가 `undefined/portfolio` 처럼 이상하게 변했을 때.
*   **해결:** `docker ps`로 컨테이너 생존 확인, `docker logs backend`로 서버 에러 로그 확인.

### **B. `Module not found: Can't resolve 'recharts'`**
*   **의미:** "내 레시피엔 'recharts' 재료가 있는데, 냉장고(node_modules)에 없다."
*   **상황:** `package.json`에는 라이브러리를 적어놨지만, 도커 컨테이너 안에는 아직 설치되지 않은 상태입니다.
*   **원인:** 도커는 이미지를 빌드할 때 `npm install`을 수행합니다. 이후에 `package.json`을 수정해도, **이미지를 다시 빌드하지 않으면** 추가된 라이브러리는 컨테이너 안에 존재하지 않습니다.
*   **해결:** 반드시 `--build` 옵션을 붙여서 컨테이너를 재생성해야 합니다.
    *   명령어: `docker-compose up -d --build frontend`

### **C. `500 Internal Server Error`**
*   **의미:** "요청은 받았는데, 처리하다가 터졌다."
*   **상황:** 서버가 요청을 받고 로직을 수행하다가 예상치 못한 에러(예: 0으로 나누기, DB 연결 실패, Null 참조)를 만난 경우입니다.
*   **원인:** 주로 코드 버그, 환경 변수 누락(API Key 없음), 데이터 포맷 불일치 등이 원인입니다.
*   **해결:** 브라우저는 에러 내용 모릅니다. 반드시 **백엔드 로그**(`docker-compose logs backend`)를 봐야 정확한 원인을 알 수 있습니다.

