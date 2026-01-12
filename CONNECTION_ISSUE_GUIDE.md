# 서버 접속 장애 긴급 해결 가이드 (Connection Issue Guide)

이 문서는 `localhost:8000` (백엔드) 또는 `localhost:3000` (프론트엔드)에 접속할 수 없는 **"서버 접속 불가"** 상황을 해결하기 위한 단계별 가이드입니다.

---

## 1. 현상 진단 (Diagnosis)
브라우저에서 `http://localhost:8000`에 접속했을 때:
*   **"사이트에 연결할 수 없음 (ERR_CONNECTION_REFUSED)"**: 서버가 아예 꺼져 있거나 포트가 닫혀 있습니다.
*   **"응답이 너무 긺 (ERR_CONNECTION_TIMED_OUT)"**: 서버는 켜져 있는데 방화벽이나 네트워크 설정 때문에 막힌 상태입니다.
*   **"404 Not Found"**: 서버는 켜져 있지만 해당 주소(`root`)에 대한 처리가 없는 경우입니다. (FastAPI는 `/` 혹은 `/docs`로 테스트하세요)

---

## 2. 해결 단계 (Step-by-Step Solution)

### Step 1: 포트 점유 확인 (가장 흔한 원인)
이미 다른 프로세스(이전의 도커 컨테이너, 혹은 멈춘 파이썬 프로세스)가 8000번 포트를 잡고 있어서, 새 서버가 정상적으로 포트를 열지 못하는 상항입니다.

**PowerShell 명령어로 확인:**
```powershell
netstat -ano | findstr :8000
```
만약 결과가 나온다면, 마지막 숫자가 **PID(프로세스 ID)**입니다.

**포트 강제 종료 (PID가 1234라고 가정 시):**
```powershell
taskkill /F /PID 1234
```
*포트를 비운 후, 다시 서버를 실행해보세요.*

---

### Step 2: 도커 컨테이너 상태 확인
도커로 실행 중인 경우, 컨테이너가 에러로 인해 죽었는지 확인해야 합니다.

**명령어:**
```powershell
docker ps -a
```
*   `STATUS`가 `Up` 이어야 정상입니다.
*   `Exited (1)` 혹은 `Restarting` 상태라면 서버가 에러로 죽은 것입니다.

**로그 확인:**
```powershell
docker logs backend
```
로그의 맨 마지막 줄을 확인하여 에러(Syntax Error, Config Error 등)를 수정해야 합니다.

---

### Step 3: 호스트 바인딩 (Localhost vs 0.0.0.0)
서버를 로컬 터미널에서 직접 실행(`uvicorn`)하는 경우, 기본적으로 `127.0.0.1`(나 자신)에서만 접속을 허용할 수 있습니다.
도커 컨테이너나 다른 기기에서 접속하려면 반드시 **`0.0.0.0`**으로 열어주어야 합니다.

**잘못된 실행:**
```bash
uvicorn app.main:app  # 127.0.0.1:8000으로 실행됨 (외부 접속 제한될 수 있음)
```

**올바른 실행:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

### Step 4: 도커 완전 재시작 (Reset)
도커 네트워크가 꼬였을 수 있습니다. 싹 지우고 다시 띄우는 것이 가장 확실합니다.

```powershell
# 1. 모든 컨테이너 중지 및 삭제 (볼륨 제외)
docker-compose down

# 2. 캐시 없이 다시 빌드 및 실행
docker-compose up -d --build --force-recreate

# 3. 로그 실시간 확인 (서버가 뜰 때까지 대기)
docker-compose logs -f backend
```
로그에 `Application startup complete.` 혹은 `Uvicorn running on ...`이 뜰 때까지 기다린 후 접속하세요.

---

## 3. 체크리스트 Summary

1.  [ ] **`docker ps`**로 `backend` 컨테이너가 `Up` 상태인가?
2.  [ ] **`netstat`**으로 8000번 포트가 LISTENING 상태인가?
3.  [ ] 브라우저 주소창에 `http://localhost:8000` 대신 `http://127.0.0.1:8000`을 입력해 보았는가? (가끔 hosts 파일 문제로 localhost가 안 될 수 있음)
4.  [ ] 백신이나 방화벽이 포트를 막고 있지 않은가?
