# 🏗️ Terraform 완벽 가이드 (Basic to Advanced)

이 가이드는 **Infrastructure as Code (IaC)** 의 핵심 도구인 Terraform의 개념부터, **LogMind AI** 프로젝트를 위한 AWS 인프라(EKS, RDS 등)를 실제로 프로비저닝하는 방법까지 다룹니다.

---

## 🌍 1. Terraform 기초 (Basics)

### 1.1 Terraform이란?
테라폼은 클라우드 인프라(AWS, Azure, GCP 등)를 **코드로 정의하고 생성/수정/삭제**하는 도구입니다.
- **기존 방식:** AWS 콘솔 로그인 -> 클릭 -> EC2 생성 -> 클릭 -> VPC 생성 (수동, 실수하기 쉬움)
- **Terraform:** `resource "aws_instance" "web" { ... }` 코드 작성 -> 실행 (자동, 반복 가능)

### 1.2 핵심 개념 (Concepts)
1. **Provider (공급자):** 누구와 대화할 것인가? (예: AWS, Kubernetes, Docker)
2. **Resource (리소스):** 무엇을 만들 것인가? (예: EC2, S3, Security Group)
3. **State (상태 파일):** 현재 인프라의 상태를 저장하는 장부(`.tfstate`). 테라폼은 이 파일을 보며 실제 세상과 코드의 차이를 계산합니다.
4. **HCL (HashiCorp Configuration Language):** 테라폼이 사용하는 언어. 직관적이고 선언적입니다.

---

## 🏗 2. LogMind AI 프로젝트 적용 시나리오

우리의 목표는 로컬(`k8s/` 폴더)에 있는 쿠버네티스 설정들이 돌아갈 **실제 AWS 클라우드 환경**을 구축하는 것입니다.

### 필요 인프라 구조
1. **Network:** VPC, Subnet (Public/Private), Internet Gateway
2. **Compute:** EKS (Elastic Kubernetes Service) 클러스터 - **프론트/백엔드 실행용**
3. **Database:** RDS (PostgreSQL with pgvector) - **DB 실행용** (프로덕션에서는 k8s 내부보다 RDS가 안전함)
4. **Security:** Security Groups (방화벽)

---

## 💻 3. 실전 코드 예시 (main.tf)

프로젝트 루트에 `terraform/` 폴더를 만들고 아래 내용을 작성한다고 가정합니다.

### 3.1 Provider 설정 및 VPC
```hcl
# main.tf

provider "aws" {
  region = "ap-northeast-2" # 서울 리전
}

# 1. VPC (가상 네트워크)
resource "aws_vpc" "logmind_vpc" {
  cidr_block = "10.0.0.0/16"
  tags = { Name = "logmind-vpc" }
}

# 2. Subnet (서브넷)
resource "aws_subnet" "public_subnet" {
  vpc_id            = aws_vpc.logmind_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "ap-northeast-2a"
  tags = { Name = "logmind-public" }
}
```

### 3.2 EKS 클러스터 (쿠버네티스)
```hcl
# AWS EKS 모듈 사용 (복잡한 설정을 쉽게)
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = "logmind-cluster"
  cluster_version = "1.27"
  vpc_id          = aws_vpc.logmind_vpc.id
  subnet_ids      = [aws_subnet.public_subnet.id]

  # 워커 노드 (실제 컨테이너가 뜰 서버들)
  eks_managed_node_groups = {
    default = {
      min_size     = 1
      max_size     = 3
      desired_size = 2
      instance_types = ["t3.medium"] # 비용 절감용
    }
  }
}
```

### 3.3 RDS (PostgreSQL)
```hcl
resource "aws_db_instance" "default" {
  allocated_storage    = 20
  engine               = "postgres"
  engine_version       = "16.1"
  instance_class       = "db.t3.micro"
  db_name              = "logmind"
  username             = "user"
  password             = "password1234!" # 실제론 Secrets Manager 사용 권장!
  skip_final_snapshot  = true
}
```

---

## 🚀 4. 워크플로우 (Workflow)

터미널에서 `terraform/` 폴더로 이동 후 다음 명령어들을 순서대로 실행합니다.

### Step 1: 초기화 (Init)
```bash
terraform init
```
- 필요한 Provider 플러그인(AWS 등)을 다운로드합니다.

### Step 2: 계획 확인 (Plan)
```bash
terraform plan
```
- "내가 코드로 짠 내용대로라면 AWS에 총 15개의 리소스가 생성될 거야"라고 미리 보여줍니다. (Dry Run)
- **가장 중요한 단계**입니다. 실수로 삭제되는 리소스가 없는지 꼼꼼히 확인하세요.

### Step 3: 적용 (Apply)
```bash
terraform apply
```
- 실제로 AWS에 리소스를 생성합니다. 중간에 `yes`를 입력해야 승인됩니다.
- 완료되면 EKS 접속 정보 등을 출력하게 설정할 수 있습니다.

### Step 4: 클러스터 연결 및 배포
인프라가 다 만들어졌다면, 로컬의 `kubectl`을 방금 만든 EKS에 연결합니다.
```bash
# aws cli로 kubeconfig 업데이트
aws eks update-kubeconfig --name logmind-cluster --region ap-northeast-2

# 이제 우리가 만든 k8s 매니페스트 배포
kubectl apply -f ../k8s/
```

### Step 5: 정리 (Destroy)
연습이 끝나면 비용 방지를 위해 삭제합니다.
```bash
terraform destroy
```

---

## 📝 5. 핵심 요약 (Cheat Sheet)

| 명령어 | 설명 | 비유 |
|---|---|---|
| `terraform init` | 준비 단계 | 요리 재료 장보기 |
| `terraform plan` | 변경사항 예측 | 레시피 확인 및 시뮬레이션 |
| `terraform apply` | 인프라 생성/수정 | 요리 시작 (가스불 켜기) |
| `terraform destroy` | 인프라 전체 삭제 | 설거지 및 뒷정리 |
| `terraform state list` | 현재 관리 중인 리소스 목록 | 냉장고 재고 확인 |

> **팁:** 테라폼은 "상태(State)"가 생명입니다. `terraform.tfstate` 파일은 절대 잃어버리면 안 되며, 팀 협업 시에는 S3 같은 원격 저장소(Remote Backend)에 저장하여 공유합니다.
