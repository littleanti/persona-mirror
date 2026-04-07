# 🧠 Persona Mirror

> 대화 기록으로 상대방의 페르소나를 분석하고, 받은 메시지에서 **"상대방이 원하는 답변"** 을 추론해주는 모바일 웹 앱

로컬에서 실행되는 Ollama(gemma4)를 AI 엔진으로 사용해 완전히 프라이빗하게 동작합니다.

---

## 주요 기능

### 1. 페르소나 생성
- 카카오톡, 문자 등 대화 기록을 붙여넣으면 AI가 상대방의 페르소나를 분석
- **나의 이름**도 함께 입력하면 상대방 페르소나 + 나의 페르소나를 동시에 추출
- 소통 방식, 어조, 말버릇, 감정 패턴, 관계 역학 등 8가지 항목 분석
- 분석 결과는 로컬 JSON 파일로 저장

### 2. 메시지 분석
- 저장된 페르소나를 선택하고 받은 메시지를 입력
- AI가 상대방의 심리를 분석하여 "듣고 싶어하는 답변" 후보 3개 제시
- 나의 페르소나가 등록된 경우, 내 말투와 성격에 맞는 답변까지 고려
- 각 후보마다 이유 설명 + 한 번에 복사 기능 제공

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | Vanilla HTML / CSS / JS (모바일 웹, 단일 파일) |
| 백엔드 | Python + FastAPI |
| AI 엔진 | Ollama (로컬 LLM, gemma4) |
| 데이터 저장 | JSON 파일 (로컬) |

---

## 실행 방법

### 사전 조건
- Python 3.10 이상
- [Ollama](https://ollama.com) 설치 및 gemma4 모델 실행 중

```bash
ollama run gemma4
```

### 서버 시작

```bash
# 의존성 설치
pip install -r requirements.txt

# 서버 시작 (Windows: start.bat 더블클릭도 가능)
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

### 접속 방법

| 기기 | 주소 |
|------|------|
| PC | http://localhost:8000 |
| 휴대폰 | http://[PC의 IP주소]:8000 |

> PC IP 확인: `ipconfig` (Windows) / `ifconfig` (Mac/Linux)

### 모델 변경 (선택 사항)

```bash
# Windows
set OLLAMA_MODEL=gemma3:27b

# Mac / Linux
export OLLAMA_MODEL=gemma3:27b
```

---

## 프로젝트 구조

```
persona-mirror/
├── server.py          # FastAPI 백엔드
├── requirements.txt   # Python 의존성
├── start.bat          # Windows 원클릭 실행 스크립트
├── static/
│   └── index.html     # 모바일 웹 앱 (SPA)
└── data/
    └── personas/      # 페르소나 JSON 저장소 (gitignore 처리)
```

---

## 사용 흐름

1. **페르소나 탭** → `+` 버튼 → 상대방 이름 + (나의 이름) + 대화 기록 입력 → 생성
2. **분석하기 탭** → 페르소나 선택 → 받은 메시지 입력 → 분석하기 클릭
3. 결과에서 원하는 답변 후보를 복사해서 사용

---

## 개인정보 보호

- 모든 AI 처리는 **로컬 Ollama** 에서 수행 (외부 API 미사용)
- 페르소나 데이터는 로컬 `data/personas/` 폴더에만 저장
- 외부 서버로 데이터가 전송되지 않음
