# ☸️ Kubernetes (K8s) 완벽 가이드 (Basic to Advanced)

이 가이드는 쿠버네티스의 핵심 아키텍처부터 배포 전략까지, **LogMind AI** 프로젝트를 실제 클라우드 환경(AWS EKS 등)에 배포한다고 가정하고 설명합니다.

---

## 🏛 1. Kubernetes 기초 (Basics)

### 1.1 Kubernetes란?
컨테이너화된 애플리케이션을 **자동 배포, 스케일링, 관리**하는 도구입니다. "도커가 선원이라면, 쿠버네티스는 선장"입니다.

### 1.2 핵심 오브젝트 (Objects)

1. **Pod (파드):** 
   - 쿠버네티스의 가장 작은 배포 단위.
   - 하나 이상의 컨테이너(보통 1개)를 감싸고 있습니다.
   - ⚠️ 포드는 불안정합니다(Ephemera). 죽으면 다시 살아나지 *않습니다* (Controller가 관리해야 함).

2. **Deployment (디플로이먼트):** 
   - 포드의 **상태**를 관리하는 감독관입니다.
   - "항상 3개의 복제본(Replicas)을 유지해라"라고 명령하면, 포드 하나가 죽어도 자동으로 새것을 띄웁니다.
   - 롤링 업데이트(무중단 배포)를 지원합니다.

3. **Service (서비스):**
   - 동적으로 바뀌는 포드들의 IP를 하나의 고정된 주소(Endpoint)로 묶어줍니다.
   - **ClusterIP:** 내부 통신용 (기본값)
   - **LoadBalancer:** 외부 접속용 (AWS LB와 연결됨)

---

## 🏗 2. 프로젝트 매니페스트 분석

이 프로젝트의 `k8s/` 폴더 내 파일들을 분석해봅니다.

### frontend.yaml (Deployment + Service)

```yaml
# 1. Deployment: 어떤 앱을 어떻게 실행할 것인가?
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 2  # 인스턴스 2개 띄우기 (고가용성)
  selector:
    matchLabels:
      app: frontend
  template:    # 포드 템플릿
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          image: logmind-frontend:latest # 사용할 이미지
          env:
            - name: NEXT_PUBLIC_API_URL
              value: "http://backend:8000" # K8s DNS (서비스 이름으로 통신)

---
# 2. Service: 어떻게 접속할 것인가?
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  type: LoadBalancer # 외부 IP 할당 (Public Access)
  selector:
    app: frontend    # 라벨이 'frontend'인 포드들로 트래픽 전달
  ports:
    - port: 80 # 들어오는 포트
      targetPort: 3000 # 컨테이너 포트
```

---

## 🚀 3. 심화 주제 (Advanced)

### 3.1 아키텍처 이해 (Control Plane vs Node)
쿠버네티스 클러스터는 **두뇌**와 **일꾼**으로 나뉩니다.
- **Control Plane (Master Node):** 클러스터 전체를 제어. (API Server, Scheduler, etcd 등)
- **Worker Node:** 실제 컨테이너(Pod)가 실행되는 서버 (EC2 인스턴스 등).

### 3.2 ConfigMap & Secret (설정 분리)
DB 비밀번호나 API 키를 코드에 직접 넣는 것은 보안상 위험합니다.
- **ConfigMap:** 일반 설정 파일 (환경변수 등)
- **Secret:** 암호화(Base64)가 필요한 민감 정보 (DB 비번, OpenAI Key)

```yaml
# 사용 예시 (Pod Spec 내)
env:
  - name: OPENAI_API_KEY
    valueFrom:
      secretKeyRef:
        name: my-secrets
        key: openai-key
```

### 3.3 Ingress (L7 Load Balancer)
`Service(LoadBalancer)`를 여러 개 쓰면 비용이 많이 듭니다. **Ingress**를 사용하면 하나의 로드밸런서로 여러 경로를 라우팅할 수 있습니다.
- `example.com/api` -> Backend Service
- `example.com/` -> Frontend Service

### 3.4 HPA (Horizontal Pod Autoscaler)
사용자가 몰릴 때 자동으로 포드 개수를 늘려주는 기능입니다.
- *"CPU 사용량이 50%를 넘으면 포드를 최대 10개까지 늘려라"* 와 같은 설정이 가능합니다.

---

## 🎓 4. 실전 연습: 배포 순서

1. **이미지 빌드 및 푸시:** (AWS ECR 또는 DockerHub)
   ```bash
   docker build -t my-repo/backend:v1 ./backend
   docker push my-repo/backend:v1
   ```

2. **비밀 적용 (Secret):**
   ```bash
   kubectl create secret generic logmind-secrets --from-literal=openai-key=sk-1234...
   ```

3. **DB 배포:**
   ```bash
   kubectl apply -f k8s/database.yaml
   ```

4. **백엔드/프론트엔드 배포:**
   ```bash
   kubectl apply -f k8s/backend.yaml
   kubectl apply -f k8s/frontend.yaml
   ```

5. **상태 확인:**
   ```bash
   kubectl get pods
   kubectl get svc
   ```

---

## 🛠 5. 필수 명령어 치트시트

| 작업 | 명령어 | 설명 |
|---|---|---|
| **상태 확인** | `kubectl get pods` | 실행 중인 포드 목록 확인 |
|  | `kubectl get all` | 모든 리소스 확인 |
| **디버깅** | `kubectl describe pod [이름]` | 포드 상세 정보/에러 확인 |
|  | `kubectl logs [이름]` | 포드 로그 확인 |
| **실행** | `kubectl apply -f [파일]` | YAML 파일로 리소스 생성/업데이트 |
| **삭제** | `kubectl delete -f [파일]` | 리소스 삭제 |
| **접속** | `kubectl exec -it [이름] -- sh` | 실행 중인 포드 내부 접속 |
