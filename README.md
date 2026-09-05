# 🧠 Persora

> 대화 기록으로 상대의 페르소나와 말투를 분석하고, 최근 대화에서 상대가 원하는 답변을 **내 말투로** 제안하는 모바일 웹 앱.

**Client-First 아키텍처**: 개인 데이터는 전부 **내 브라우저**에 저장되고, AI 분석은 **내 Google AI Studio(Gemini) API 키**로 브라우저가 직접 수행합니다. 배포 서버는 정적 파일만 서빙하며 대화 내용도 API 키도 받지 않습니다.

---

## 주요 기능

| 기능 | 설명 |
|---|---|
| **페르소나 생성** | 상대 이름(+선택: 나의 이름)과 대화 기록으로 말투·성향을 11개 항목으로 분석해 저장합니다. 대화는 **붙여넣거나** 카카오톡 "대화 내보내기"로 받은 **`.txt` 파일을 첨부**하면 됩니다. 첨부하면 내보내기 머리말을 떼고 **말미 16,000자**만 잘라 입력란을 채우며(줄 경계 보존), 채워진 텍스트는 그대로 편집할 수 있습니다. 상세 화면에서 새 대화를 더해 다시 분석할 수도 있습니다. |
| **메시지 분석** | 저장한 페르소나를 고르고 **최근 대화 스레드**를 붙여넣으면, 앱이 답장할 마지막 상대 메시지를 자동으로 잡아 보여 줍니다(틀리면 목록에서 직접 고를 수 있습니다). **답장 의도** 6종(위로·공감 / 함께 해결 / 가볍게 전환 / 정중한 거절 / 선 긋기 / 설득·제안)과 직접 입력을 지원하고, 비워 두면 공감 3축 후보가 나옵니다. 붙여넣기가 어려우면 **대화 화면 캡처 이미지**를 첨부하는 모드도 있습니다. |
| **기록** | 분석 결과가 자동으로 저장됩니다. 카드를 펼쳐 심리 분석과 답변 후보 3개를 다시 보고 개별 삭제할 수 있습니다. |
| **설정** | 백업 내보내기·가져오기(JSON, **API 키는 제외**), 전체 로컬 데이터 삭제, 개인정보·면책 고지를 한 화면에 모았습니다. |

---

## 기술 스택

| 구분 | 선택 |
|---|---|
| 언어 | TypeScript (strict) |
| 빌드 | Vite 5 |
| UI | React 18 + react-router-dom 6 (HashRouter) |
| 전역 상태 | Zustand 4 |
| 스타일 | Tailwind CSS 3 + 커스텀 토큰 |
| LLM | `@google/genai` 2.x — 모델 `gemini-3.1-flash-lite` 단일, thinking off |
| 저장 | IndexedDB(페르소나·분석 기록) + localStorage(API 키·UI 언어·스레드 드래프트) |
| 테스트 | Vitest (순수 모듈 단위 테스트) |
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
# → http://localhost:4121/persora/

# 3. 프로덕션 빌드 (tsc --noEmit && vite build → dist/)
npm run build

# 4. 빌드 결과를 정적 서버로 서빙
npm start
# → http://localhost:8000/persora/ ('/'는 이 경로로 자동 리다이렉트됩니다)
```

Vite `base`가 `/persora/`라(배포 경로와 맞춤, 아래 [배포](#배포) 참고) 개발 서버·정적 서버 모두 이 하위 경로에서 앱이 뜹니다.

### 접속 방법

| 기기 | 주소 |
|------|------|
| PC | http://localhost:8000/persora/ |
| 휴대폰(같은 Wi-Fi) | http://[PC의 IP주소]:8000/persora/ |

> PC IP 확인: `ipconfig` (Windows) / `ifconfig` (Mac/Linux)
> 휴대폰 실기기 접속은 아직 확인하지 못했습니다([PLAN](docs/PLAN.md) §8).

---

## 첫 실행

앱을 처음 열면 온보딩 모달이 뜹니다. Google AI Studio에서 발급한 Gemini API 키를 넣고 저장 동의에 체크하면 시작됩니다. 키가 없으면 어떤 기능도 열리지 않습니다.

- 키는 **이 브라우저의 localStorage**(`pm_gemini_key`)에 저장됩니다. 쿠키와 달리 요청에 자동으로 실리지 않아 서버로 가지 않습니다.
- 저장 시 별도 검증 호출을 하지 않습니다. 키가 잘못되었으면 첫 생성·분석 요청에서 인증 오류로 드러납니다.
- 키 변경·삭제는 헤더의 `● Gemini 준비됨`을 눌러서 합니다.
- Google Cloud/API Console에서 이 키가 사용할 수 있는 API를 **Gemini API로 제한**하는 것을 권장합니다. HTTP referrer 제한은 키가 유출되면 우회될 수 있어 **효과가 제한적**입니다 — 노출이 의심되면 즉시 키를 회전·삭제하세요.

---

## 개인정보

- **페르소나·분석 기록·원본 대화·스레드 드래프트**는 브라우저 IndexedDB(`persona-mirror`)/localStorage에만 저장됩니다. 서버에는 어떤 개인 데이터도 가지 않습니다.
- **API 키도 이 브라우저의 localStorage**에 저장됩니다(위 [첫 실행](#첫-실행) 참고).
- **LLM 호출은 브라우저가 `generativelanguage.googleapis.com`으로 직접** 보냅니다. 페르소나 생성 시 **입력란의 대화 텍스트**가, 분석 시 페르소나 JSON과 최근 대화 스레드 **또는 첨부한 캡처 이미지**가 Google로 전송됩니다.
- **첨부한 `.txt` 파일 자체는 업로드되지 않습니다.** 브라우저가 읽어 입력란을 채우는 데만 쓰고, 전송되는 것은 화면에 보이는 그 텍스트 하나입니다.
- 캡처 이미지에는 대화 본문 외에 프로필 사진·표시 이름 같은 부수 정보가 함께 담겨 그대로 전송됩니다. 타인의 대화·민감정보 입력은 주의해 주세요.
- 브라우저 사이트 데이터를 지우거나 기기를 바꾸면 저장된 페르소나·기록·드래프트·키가 모두 사라지며 **복구 수단이 없습니다.** 설정 탭에서 백업(JSON, API 키는 포함하지 않음)을 내보내고 가져올 수 있습니다.
- 설정 탭에서 API 키·페르소나·분석 기록·드래프트를 한 번에 삭제할 수 있습니다.
- AI가 만든 페르소나와 답변 후보는 참고용이며, 의료·법률·심리 진단이나 중요한 관계 결정을 대신하지 않습니다.

---

## 프로젝트 구조

```
persora/
├── docs/                       # PRD / TRD / DESIGN / PLAN / LOG
├── index.html                  # Vite 엔트리 (#root, CSP·referrer meta)
├── vite.config.ts              # base '/persora/', dev 4121, vitest include
├── server/index.js             # Express 정적 서버 (dist/를 /persora/에 마운트, 0.0.0.0:8000)
├── public/                     # favicon · 앱 아이콘 · 로고
├── .github/workflows/
│   └── deploy-pages.yml        # main push → npm ci → build → Pages
└── src/
    ├── main.tsx                # React 엔트리 + ErrorBoundary + HashRouter + initI18n
    ├── App.tsx                 # 상단바 · 하단 탭 4개 · 라우트 · 온보딩 게이트 · 토스트
    ├── index.css               # Tailwind base + 공용 유틸
    ├── components/             # OnboardingModal · ApiKeyStatus · LanguageToggle · Toast · ErrorBoundary
    ├── routes/                 # PersonaPage · AnalyzePage · HistoryPage · SettingsPage
    └── lib/
        ├── config.ts           # 모델 · 타임아웃 · 저장소 키 · DB 상수 단일 출처
        ├── types.ts            # 타입 계약 단일 출처 (REPLY_INTENTS 포함)
        ├── gemini.ts           # generate(prompt, images?) · extractJson · 에러 변환
        ├── prompts.ts          # PERSONA_FIELDS · buildPersonaPrompt · buildAnalyzePrompt
        ├── persona.ts          # 페르소나 생성·업데이트·목록·삭제
        ├── analysis.ts         # analyzeReply · 기록 목록·삭제
        ├── thread.ts           # parseThread · detectTarget (최근 대화 파서)
        ├── chatFile.ts         # parseKakaoChatTail (.txt 머리말 제거 + 말미 컷)
        ├── image.ts            # fileToInlineImage (분석 탭 캡처 변환)
        ├── drafts.ts           # 페르소나별 스레드 드래프트(localStorage)
        ├── dataManagement.ts   # 백업 내보내기·가져오기·전체 삭제
        ├── db.ts               # IndexedDB 연결·트랜잭션 공용 레이어
        ├── assets.ts           # BASE_URL 기준 public 자산 경로
        ├── i18n.ts / useI18n.ts # ko/en 사전과 훅
        ├── store.ts            # Zustand (apiKey 미러 · selectedPersonaId · toasts)
        ├── id.ts / dom.ts      # uuid(폴백 포함) · formatDate · getInitial
        ├── *.test.ts           # thread · chatFile · gemini(extractJson) · drafts · id
        └── repos/              # settingsRepo(localStorage) · personaRepo · analysisRepo
```

---

## 테스트

```bash
npm test        # vitest run — 45개 테스트
```

대상은 브라우저 없이 검증할 수 있는 순수 모듈입니다.

| 파일 | 검증 대상 |
|---|---|
| `src/lib/thread.test.ts` | 스레드 파싱 형식·화자 분류·답장 대상 검출 |
| `src/lib/chatFile.test.ts` | 카카오톡 머리말 제거·평문 통과·말미 컷 줄 경계·CRLF |
| `src/lib/gemini.test.ts` | `extractJson` 4경로 |
| `src/lib/drafts.test.ts` | 드래프트 저장·복원·일괄 처리·저장소 예외 폴백 |
| `src/lib/id.test.ts` | uuid 형식과 비보안 컨텍스트 폴백 |

IndexedDB·React 화면·Gemini 실호출은 단위 테스트 대상이 아니며 브라우저 스모크로 확인합니다.

---

## 배포

- 배포 URL: `https://littleanti.github.io/persora/` (GitHub Pages 프로젝트 사이트)
- Vite `base`: `/persora/`
- 배포 workflow: [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) — `main` 브랜치 push(또는 수동 실행) 시 `npm ci` → `npm run build` → `dist/`를 Pages에 올립니다. 빌드가 `tsc --noEmit`을 포함하므로 타입 에러가 있으면 배포되지 않습니다.
- GitHub Pages는 응답 헤더를 바꿀 수 없어, 보안 정책(CSP·referrer)은 `index.html`의 `<meta>`로 넣습니다. 로컬 `server/index.js`가 붙이는 `X-Content-Type-Options`·`Referrer-Policy` 헤더는 배포본에 적용되지 않습니다.

---

## 문서

작업 규칙은 [`CLAUDE.md`](CLAUDE.md)에 있습니다. 코드를 고치기 전에 문서를 먼저 갱신하고, 결론은 3단 사고(1차 사고 / 비판적 재사고 / 종합)를 거칩니다.

- [PRD](docs/PRD.md) — 제품 요구사항·Acceptance·아키텍처 결정
- [TRD](docs/TRD.md) — 기술 설계·모듈 계약·ADR
- [DESIGN](docs/DESIGN.md) — 화면·인터랙션·디자인 토큰
- [PLAN](docs/PLAN.md) — 단계별 구현 계획과 남은 미확정
- [LOG](docs/LOG.md) — 변경 이력

## 라이선스

MIT — [LICENSE](LICENSE)
