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

5.  **DB 및 pgvector 상태 확인**
    *   RAG 기능은 `pgvector` 확장을 사용하므로 PostgreSQL DB가 정상 실행 중이어야 합니다.
    *   `docker ps`로 DB 컨테이너가 켜져 있는지 확인하세요.
