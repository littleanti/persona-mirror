# 🧠 Persora

> 대화 기록으로 상대의 페르소나와 말투를 분석하고, 상대가 원하는 답변을 **내 말투로** 제안하는 모바일 웹 앱.

**Client-First 아키텍처**: 개인 데이터는 전부 **내 브라우저**에 저장되고, AI 분석은 **내 Google AI Studio(Gemini) API 키**로 브라우저가 직접 수행합니다. 배포 서버는 정적 파일만 서빙하며 대화 내용을 보관하지 않습니다.

현재 버전은 **1.0(M1, MVP)** 입니다.

---

## 주요 기능

| 기능 | 설명 |
|---|---|
| **페르소나 생성** | 카카오톡·문자 대화 기록을 붙여넣으면 상대의 말투·성향을 11개 항목으로 분석해 저장합니다. 나의 이름을 함께 넣으면 **나의 페르소나**도 같이 만듭니다. |
| **메시지 분석 v1** | 저장한 페르소나를 고르고 상대에게 받은 메시지 1건을 넣으면, 심리 분석과 답변 후보 3개(깊은 공감·수용형 / 공감 + 함께 해결형 / 공감 + 분위기 전환형)를 나의 말투로 제안합니다. |
| **기록** | 분석 결과가 자동으로 저장됩니다. 카드를 펼쳐 분석과 후보를 다시 보고 개별 삭제할 수 있습니다. |

앞으로 추가할 기능(캡처 이미지 입력, 안정화, 배포)은 [PLAN](docs/PLAN.md) §3에 있습니다.

---

## 기술 스택

| 구분 | 선택 |
|---|---|
| 언어 | TypeScript (strict) |
| 빌드 | Vite 5 |
| UI | React 18 + react-router-dom 6 (HashRouter) |
| 전역 상태 | Zustand 4 |
| 스타일 | Tailwind CSS 3 + 커스텀 토큰 |
| LLM | `@google/genai` 2.x — 모델 `gemini-3.1-flash-lite`, thinking off |
| 저장 | IndexedDB(페르소나·분석 기록) + 쿠키(API 키) |
| 미리보기 서버 | Node 20+ / Express 4 (정적 서빙 전용) |

---

## 실행 방법

### 사전 조건
- Node.js 20 이상
- Google AI Studio API 키 ([발급 페이지](https://aistudio.google.com/app/apikey))

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 (HMR)
npm run dev
# → http://localhost:4121

# 3. 프로덕션 빌드 (tsc --noEmit && vite build → dist/)
npm run build

# 4. 빌드 결과를 정적 서버로 서빙
npm start
# → http://localhost:8000
```

### 접속 방법

| 기기 | 주소 |
|------|------|
| PC | http://localhost:8000 |
| 휴대폰(같은 Wi-Fi) | http://[PC의 IP주소]:8000 |

> PC IP 확인: `ipconfig` (Windows) / `ifconfig` (Mac/Linux)
> 휴대폰 실기기 접속은 아직 확인하지 못했습니다([PLAN](docs/PLAN.md) §5.3).

---

## 첫 실행

앱을 처음 열면 온보딩 모달이 뜹니다. Google AI Studio에서 발급한 Gemini API 키를 넣고 "이 기기에만 저장" 동의에 체크하면 시작됩니다. 키가 없으면 어떤 기능도 열리지 않습니다.

- 키는 **이 브라우저의 쿠키**(`pm_gemini_key`, 만료 1년, `SameSite=Lax`)에 저장됩니다. 서버로 보내지 않습니다.
- 저장 시 별도 검증 호출을 하지 않습니다. 키가 잘못되었으면 첫 분석 요청에서 인증 오류로 드러납니다.
- 키 변경·삭제는 헤더의 `● Gemini 준비됨`을 눌러서 합니다.

---

## 개인정보

- **페르소나·분석 기록·원본 대화**는 브라우저 IndexedDB(`persona-mirror`)에만 저장됩니다. 서버에는 어떤 개인 데이터도 가지 않습니다.
- **LLM 호출은 브라우저가 `generativelanguage.googleapis.com`으로 직접** 보냅니다. 페르소나 생성 시 대화 텍스트가, 분석 시 페르소나 JSON과 받은 메시지가 Google로 전송됩니다.
- 타인의 대화·민감정보 입력은 주의해 주세요.
- 브라우저 사이트 데이터를 지우면 저장된 페르소나·기록·키가 모두 사라지며 **복구 수단이 없습니다.**
- AI가 만든 페르소나와 답변 후보는 참고용이며, 심리 진단이나 관계 결정을 대신하지 않습니다.

---

## 프로젝트 구조

```
persora/
├── docs/                       # PRD / TRD / DESIGN / PLAN / LOG
├── index.html                  # Vite React 엔트리 (#root)
├── server/index.js             # Express 정적 서버 (dist/ 서빙, 0.0.0.0:8000)
├── public/                     # favicon · 앱 아이콘 · 로고
└── src/
    ├── main.tsx                # React 엔트리 + HashRouter + initI18n
    ├── App.tsx                 # 상단바 · 하단 탭 3개 · 라우트 · 온보딩 게이트 · 토스트
    ├── index.css               # Tailwind base + 공용 유틸
    ├── components/             # OnboardingModal · ApiKeyStatus · LanguageToggle · Toast
    ├── routes/                 # PersonaPage · AnalyzePage · HistoryPage
    └── lib/
        ├── config.ts           # 모델 · 타임아웃 · 쿠키 · DB 상수 단일 출처
        ├── types.ts            # 타입 계약 단일 출처
        ├── gemini.ts           # generate · extractJson · 에러 변환
        ├── prompts.ts          # PERSONA_FIELDS · buildPersonaPrompt · buildAnalyzePrompt
        ├── db.ts               # IndexedDB 연결·트랜잭션 공용 레이어
        ├── persona.ts          # 페르소나 유스케이스
        ├── analysis.ts         # 메시지 분석 유스케이스
        ├── i18n.ts / useI18n.ts # ko/en 사전과 훅
        ├── store.ts            # Zustand (apiKey 미러 · selectedPersonaId · toasts)
        ├── id.ts / dom.ts      # uuid · formatDate · getInitial
        └── repos/              # settingsRepo(쿠키) · personaRepo · analysisRepo
```

---

## 문서

작업 규칙은 [`CLAUDE.md`](CLAUDE.md)에 있습니다. 코드를 고치기 전에 문서를 먼저 갱신하고, 결론은 3단 사고(1차 사고 / 비판적 재사고 / 종합)를 거칩니다.

- [PRD](docs/PRD.md) — 제품 요구사항·Acceptance
- [TRD](docs/TRD.md) — 기술 설계·모듈 계약
- [DESIGN](docs/DESIGN.md) — 화면·인터랙션·디자인 토큰
- [PLAN](docs/PLAN.md) — 단계별 구현 계획
- [LOG](docs/LOG.md) — 변경 이력

## 라이선스

MIT — [LICENSE](LICENSE)
