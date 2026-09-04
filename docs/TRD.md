# TRD — Persora 기술 요구사항·설계

> 문서 버전: 1.2 · 갱신일: 2026-09-05 · 상태: P5 완료 — 이미지 요청 지연·정확도 관찰 1회 반영. 기준: [PRD 1.1](./PRD.md) / [PLAN 1.1](./PLAN.md) / [DESIGN 1.1](./DESIGN.md)

## 문서 이력
| 버전 | 날짜 | 변경 |
|---|---|---|
| 0.1 | 2026-09-05 | 초안 |
| 0.2 | 2026-09-05 | P2 착수: `@google/genai` ^2.7.0 고정(§2), 브라우저→Gemini CORS·오류 형태 확인 방법 확정(§10 #3) |
| 0.3 | 2026-09-05 | P2 완료: §10 #3 CORS·오류 형태 확인됨, #1에 소형 프롬프트 지연 실측 1회 추가 |
| 0.4 | 2026-09-05 | P3 착수: §3.7 파싱 실패 시 원문 보존 저장 확정, `splitPersonaRaw` 헬퍼 명시, §10 #6 종결 |
| 0.5 | 2026-09-05 | P3 완료: §10 #1에 페르소나 프롬프트 지연 실측(6.57s) 추가 |
| 0.6 | 2026-09-05 | P4 완료: §10 #1에 분석 프롬프트 지연 실측(3.49s) 추가 |
| 0.7 | 2026-09-05 | 표시명 Persora 확정: §3.2 DB_NAME 주석, §7 package name, §10 #9 종결 |
| 1.0 | 2026-09-05 | M1 기준선: §3 계약을 코드와 대조해 정정(§3.7 `splitPersonaRaw` 가시성, §3.9 `store.ts`의 `hasApiKey`), §4.1 오류 표에 섞여 있던 지연 실측치를 §9·§10으로 이동, §9.5 "M1까지 실제로 수행한 검증" 추가, §10 미확정 정리 |
| 1.1 | 2026-09-05 | P5 착수: 멀티모달 계약 확정 — §3.1 `InlineImage`·`CreatePersonaInput.images?`, §3.2 `IMAGE_REQUEST_TIMEOUT_MS`, §3.4 `generate(prompt, images?)`, §3.4.1 `image.ts`(신규), §3.5 `buildPersonaPrompt` 이미지 분기, §3.7 `createPersona`의 이미지 전달·플레이스홀더 저장, §3.10 `PersonaPage` 입력 토글, §4 멀티모달 `contents` 구성·타임아웃 표, §5 ADR-6, §10 #4 종결 + 미확정 2건 추가 |
| 1.2 | 2026-09-05 | P5 완료: §10 #15 이미지 지연 실측(4.95s), #16 정확도 관찰 1건 |

> 이 문서는 **현재 확정된 설계**를 서술한다. 변경 이력은 [`LOG.md`](./LOG.md)에만 적는다. §3의 시그니처는 모든 구현 작업이 따라야 하는 **계약**이며, 계약을 바꿀 때는 코드보다 이 문서를 먼저 갱신한다(CLAUDE.md 그라운드 룰 2). M1(P4 완료) 시점에 §3의 식별자는 모두 `src/` 아래에 실재하며, 1.0에서 코드와 한 줄씩 대조해 어긋난 서술을 코드 기준으로 정정했다. **1.1에서 추가한 멀티모달 계약(`InlineImage`, `image.ts`, `IMAGE_REQUEST_TIMEOUT_MS`, `generate`의 두 번째 인자)은 P5에서 만들 것이며 아직 코드에 없다** — 해당 자리마다 그 사실을 밝혀 둔다.

---

## 1. 아키텍처 개요

### 1.1 한 장 그림

```
┌─────────────────────────────── 사용자 브라우저 ────────────────────────────────┐
│                                                                                │
│  index.html (#root)                                                            │
│      │                                                                         │
│  src/main.tsx ─▶ src/App.tsx ─── HashRouter · 상단바 · 하단 탭 · 온보딩 게이트 · 토스트 │
│      │                                                                         │
│  ┌── routes/ ─────────────┐        ┌── lib/ 유스케이스 ───────────────┐          │
│  │ PersonaPage            │──────▶ │ persona.ts   createPersona …    │          │
│  │ AnalyzePage            │        │ analysis.ts  analyzeMessage …   │          │
│  │ HistoryPage            │        └───────┬───────────────┬─────────┘          │
│  └──────────┬─────────────┘                │               │                    │
│             │                              ▼               ▼                    │
│  ┌── components/ ─────────┐   ┌── lib/repos/ ──────────┐  ┌── lib/gemini.ts ──┐ │
│  │ OnboardingModal        │   │ personaRepo  (IndexedDB)│  │ @google/genai     │ │
│  │ ApiKeyStatus           │   │ analysisRepo (IndexedDB)│  │ generate()        │ │
│  │ LanguageToggle · Toast │   │ settingsRepo (쿠키)      │  │ extractJson()     │ │
│  └────────────────────────┘   └────────────────────────┘  │ + prompts.ts      │ │
│                                                            └────────┬──────────┘ │
└─────────────────────────────────────────────────────────────────────┼────────────┘
                                                                      │ HTTPS (사용자 소유 키)
                                                                      ▼
                                                 generativelanguage.googleapis.com (Gemini)

   정적 자산(index.html, assets/*) ◀── GitHub Pages(P7 예정) 또는 로컬 Express 미리보기(server/index.js)
```

### 1.2 세 평면

| 평면 | 어디서 | 무엇 | 서버 관여 |
|---|---|---|---|
| **데이터** | 브라우저 | 페르소나·분석 기록 = IndexedDB(`persona-mirror`) / API 키 = 쿠키(`pm_gemini_key`) / UI 언어 = localStorage(`pm_lang`) | 없음 |
| **연산** | 브라우저 → Google | 프롬프트 조립 후 `@google/genai`로 Gemini를 직접 호출 | 없음(프록시 없음) |
| **서버** | GitHub Pages / Express | 빌드 산출물 `dist/`의 정적 서빙만 | API 라우트·DB·세션·CORS 미들웨어 **없음** |

### 1.3 아키텍처 결정 — Client-First

결정·기각 대안(서버 + 로컬 Ollama / 운영자 키 프록시)·3단 사고의 **정본은 [PRD §8](./PRD.md#8-아키텍처-방향-결정-3단-사고)** 이다. 이 문서는 그 결정의 기술적 함의만 적는다.

- **CORS·SDK**: 브라우저가 Google을 직접 호출하므로 우리 서버에 CORS 설정이 없다. `@google/genai` 호출은 `gemini.ts` 한 곳에 캡슐화한다(SDK 파손 시 REST 폴백, §2 각주). Google이 브라우저 origin을 막는 경우는 폴백이 없는 전제 리스크다(PRD R2b) — P2에서 임의(무효) 키 1회 호출로 확인한 결과 현재는 CORS를 통과한다(§10 #3).
- **키의 브라우저 노출(XSS)**: 사용자/LLM 출력은 React 텍스트 렌더링만 사용(HTML 주입 경로 차단), CSP meta는 P7에 적용할 계획, 키·대화·프롬프트는 콘솔에 출력하지 않음(P2에서 grep 확인). 피해 범위 축소로 "키를 Gemini API만 쓰도록 제한, 노출 의심 시 회전"을 안내한다(referrer 제한은 효과가 제한적 — §8).
- **저장소**: 구조화 레코드는 IndexedDB, 키는 쿠키(ADR-3). 데이터 휘발성(브라우저 저장소 삭제·기기 변경 시 복구 불가)은 고지한다(PRD DR-6, 위치·문구는 §10 #8).

---

## 2. 기술 스택

| 구분 | 선택 | 근거 |
|---|---|---|
| 언어 | TypeScript (`strict`) | 모듈 간 계약(§3)을 컴파일러가 강제. `tsc --noEmit`이 빌드 게이트 |
| 빌드 | Vite 5 | 빠른 HMR, 정적 산출물(`dist/`)이 배포 단위와 일치 |
| UI | React 18 + `react-router-dom` 6 (**HashRouter**) | 컴포넌트 상태 모델이 모달·시트·토스트에 맞음. HashRouter는 정적 호스팅 하위 경로에서 서버 리라이트 없이 동작(ADR-4) |
| 전역 상태 | Zustand 4 | 전역으로 필요한 것은 API 키 미러·토스트 큐·탭 간 전달값 정도라 최소 스토어 1개로 충분(ADR-5) |
| 스타일 | Tailwind CSS 3 + 커스텀 토큰 | 모바일 우선, 토큰(`brand-gradient`, `shadow-soft`, `animate-slide-up` 등)은 [DESIGN.md](./DESIGN.md)가 단일 출처 |
| LLM | `@google/genai` ^2.7.0 (Gemini) | 브라우저에서 직접 `generateContent` 호출. P1 `package.json`에 고정 — 2.x의 breaking change는 Interactions API 한정이라 `generateContent` 경로는 영향 없음. M1 번들에서 첫 로드 JS 529.88 kB(gzip 131.68 kB) 중 대부분을 차지한다(§10 #12) |
| 모델 | `gemini-3.1-flash-lite` 단일 + `thinkingBudget=0` | thinking을 끌 수 있는 flash 계열이 단건 지연에 유리하다는 문헌 근거(지연 단축 효과·기본 thinking 사용 여부는 미실측). **멀티모달이라 캡처 이미지도 같은 모델로 처리한다** — 별도 비전 모델을 두지 않으므로 모델 분기·오류 처리가 늘지 않는다(ADR-2·ADR-6). 이미지가 붙은 요청만 타임아웃을 180초로 바꾼다(§4) |
| 저장 | IndexedDB(개인 데이터) + 쿠키(API 키) | ADR-3 |
| i18n | 자체 사전(`ko`/`en`) + `t()` | 문구가 적어 라이브러리 불필요. 프롬프트 JSON 키는 언어와 무관하게 고정 |
| 서버 | 정적 호스팅(GitHub Pages, P7) + Node Express 4.x(`^4.19`) 미리보기 | 로컬에서 같은 Wi-Fi 휴대폰으로 실기기 테스트(A6). Express 5는 와일드카드 라우트 문법이 달라 §6.2 코드가 그대로 돌지 않음 |
| 런타임 | Node 20+ (`engines.node >= 20`) | `@google/genai` 2.x `engines` 요구사항과 일치 |

> SDK 대안: `fetch`로 `v1beta/models/{model}:generateContent?key=…`를 직접 호출하는 경로도 가능하다. 기본은 SDK를 쓰되 호출을 `gemini.ts` 한 곳에 캡슐화해 전환 비용을 낮춘다. 이 폴백은 **SDK 파손·브라우저 번들 미지원**에 대한 것이다 — SDK와 REST는 같은 엔드포인트를 쓰므로 Google이 브라우저 origin을 CORS로 막으면 둘 다 막힌다(PRD R2b).

### 2.1 빌드 설정 요지

| 파일 | 핵심 설정 |
|---|---|
| `tsconfig.json` | `strict: true`, `target: ES2022`, `module: ESNext`, `moduleResolution: bundler`, `jsx: react-jsx`, `paths: { "@/*": ["src/*"] }`, `noEmit` |
| `vite.config.ts` | `plugins: [react()]`, alias `@` → `src/`, `server: { host: '0.0.0.0', port: 4121, strictPort: true }`, `preview: { host: '0.0.0.0', port: 8000 }`, `build.outDir: 'dist'`, `build.target: 'es2020'`, `base: '/'`(GitHub Pages 하위 경로가 필요하면 P7에서 변경) |
| `tailwind.config.js` | `content: ['./index.html', './src/**/*.{ts,tsx}']`, 토큰 확장은 DESIGN.md §토큰 그대로 |
| `index.html` | `#root` 하나, `<script type="module" src="/src/main.tsx">`, viewport(`viewport-fit=cover`), `theme-color #6366f1`. CSP/referrer meta는 P7에서 추가 |

---

## 3. 모듈 설계 · 인터페이스 계약

### 3.0 디렉터리

```
src/
├── main.tsx            # createRoot + HashRouter + <App/>, initI18n()
├── App.tsx             # 상단바(로고·앱명·ApiKeyStatus·LanguageToggle) / <Routes/> / 하단 탭 3개 / 온보딩 게이트 / ToastContainer
├── index.css           # Tailwind base + 공용 유틸
├── components/         # OnboardingModal · ApiKeyStatus · LanguageToggle · Toast
├── routes/             # PersonaPage · AnalyzePage · HistoryPage
└── lib/
    ├── config.ts       # 상수 단일 출처(모델·타임아웃·쿠키·DB)
    ├── types.ts        # 타입 계약 단일 출처
    ├── gemini.ts       # generate / extractJson / 에러 변환
    ├── image.ts        # fileToInlineImage — File → InlineImage (P5에서 생성)
    ├── prompts.ts      # buildPersonaPrompt / buildAnalyzePrompt / PERSONA_FIELDS
    ├── db.ts           # IndexedDB 연결·트랜잭션 공용 레이어
    ├── persona.ts      # 페르소나 유스케이스
    ├── analysis.ts     # 메시지 분석 유스케이스
    ├── i18n.ts / useI18n.ts
    ├── store.ts        # Zustand
    ├── id.ts           # uuid()
    ├── dom.ts          # formatDate / getInitial
    └── repos/          # settingsRepo(쿠키) · personaRepo · analysisRepo (IndexedDB)
```

의존 방향은 한 방향이다: `routes/components → lib/persona·analysis → lib/repos·gemini·prompts → lib/db·config·types`. 화면 코드는 `repos`·`gemini`를 직접 호출하지 않는다(유스케이스를 경유). 단, `ApiKeyStatus`/`OnboardingModal`은 스토어를 통해 `settingsRepo`에 닿는다. `image.ts`는 `dom.ts`와 같은 층의 순수 헬퍼라 화면이 직접 import한다 — 파일 선택은 브라우저 이벤트라 화면에서만 일어나고, 유스케이스는 이미 변환된 `InlineImage[]`만 받는다(§3.4.1).

### 3.1 `src/lib/types.ts`

```ts
/** LLM이 생성하는 페르소나 항목. 추가 키를 줄 수 있어 인덱스 시그니처를 둔다(UI는 관대하게 표시). */
export interface PersonaFields {
  summary?: string;
  communication_style?: string;
  speech_level?: string;
  vocabulary_examples?: string[];
  sentence_style?: string;
  emoji_symbol_usage?: string;
  texting_habits?: string;
  emotional_tendencies?: string;
  what_they_value?: string;
  how_they_seek_response?: string;
  relationship_dynamics?: string;
  [key: string]: unknown;
}

/** IndexedDB `personas` 스토어 레코드. keyPath = id */
export interface PersonaRecord {
  id: string;                 // uuid v4
  name: string;               // 상대 이름
  my_name: string;            // 나의 이름(없으면 "")
  created_at: string;         // ISO 8601
  conversation: string;       // 원본 대화(브라우저에만 저장)
  persona: PersonaFields;     // 상대 페르소나
  my_persona: PersonaFields;  // 나의 페르소나(my_name 없으면 {})
}

/** 목록 화면용 경량 요약 */
export interface PersonaSummary {
  id: string;
  name: string;
  my_name: string;
  created_at: string;
  summary: string;            // persona.summary ?? ''
}

/**
 * 멀티모달 입력용 인라인 이미지(P5에서 추가). Gemini `inlineData` 파트에 그대로 실린다.
 * data는 base64 문자열이며 `data:image/png;base64,` 같은 data URL 접두는 제외한다.
 */
export interface InlineImage {
  mimeType: string;           // 예: 'image/png', 'image/jpeg'
  data: string;               // base64 (data URL 접두 제외)
}

/**
 * 페르소나 생성 입력. 두 모드가 있고 필드로 구분한다(PRD FR-7).
 * - 텍스트 모드: conversation에 대화 텍스트, images는 비움
 * - 이미지 모드: images에 캡처, conversation은 표시용 플레이스홀더(§3.7)
 * images는 선택 필드이므로 기존 텍스트 호출부는 그대로 컴파일된다(가산 원칙).
 */
export interface CreatePersonaInput {
  name: string;
  my_name: string;
  conversation: string;
  images?: InlineImage[];     // P5에서 추가
}

/** 분석 결과의 답변 후보 1개 */
export interface CandidateReply {
  label: string;              // 예: "깊은 공감·수용형"
  reason: string;             // 상대가 이 답변을 원하는 이유
  response: string;           // 나의 말투로 쓴 실제 답장
}

/** IndexedDB `analyses` 스토어 레코드. keyPath = id */
export interface AnalysisRecord {
  id: string;
  persona_id: string;
  persona_name: string;       // 삭제된 페르소나여도 기록에 이름이 남도록 비정규화
  message: string;            // 분석한 받은 메시지 1건
  analysis: string;           // 심리 분석(2~3문장)
  candidates: CandidateReply[]; // 3개 기대
  created_at: string;
}
```

### 3.2 `src/lib/config.ts`

```ts
export const TEXT_MODEL = 'gemini-3.1-flash-lite';   // 단일 모델(텍스트·이미지 공용)
export const TEXT_REQUEST_TIMEOUT_MS = 60_000;       // 텍스트 요청 타임아웃
export const IMAGE_REQUEST_TIMEOUT_MS = 180_000;     // 이미지가 붙은 요청 타임아웃(P5에서 추가)

export const API_KEY_COOKIE_NAME = 'pm_gemini_key';  // API 키 쿠키 이름
export const API_KEY_COOKIE_MAX_AGE_DAYS = 365;      // 1년

export const DB_NAME = 'persona-mirror';
export const DB_VERSION = 1;
export const STORE_PERSONAS = 'personas';
export const STORE_ANALYSES = 'analyses';

export const GEMINI_API_KEY_HELP_URL = 'https://aistudio.google.com/app/apikey';
```

- 모델은 하나뿐이므로 `IMAGE_MODEL` 같은 상수는 두지 않는다. 이미지 입력이 바꾸는 것은 **타임아웃 하나**이며, 그래서 상수도 타임아웃만 늘렸다. 180초는 실측 근거가 없는 여유값이다 — 인라인 base64 페이로드가 크고 판독이 함께 일어나 60초로는 조기 실패할 수 있다는 판단에서 나왔고, P5 검증의 실측으로 재검토한다(§10 #15).
- 모델명·저장소 이름·DB 이름은 **여기서만** 정의한다. 다른 모듈은 리터럴을 쓰지 않는다. 예외 하나: UI 언어 저장 키 `'pm_lang'`(localStorage)은 `i18n.ts` 내부 상수 `LANG_STORAGE_KEY`로 둔다 — `i18n.ts`는 P1에서 `config.ts`(P2)보다 먼저 만들어지고, 다른 모듈이 이 키를 참조하지 않기 때문이다.
- `DB_NAME`은 코드네임(Persona Mirror)을 따른다. 표시명이 Persora로 확정된 뒤에도 이미 만들어진 로컬 DB와의 호환을 위해 **DB 이름은 바꾸지 않는다**(바꾸면 기존 데이터가 보이지 않게 됨).

### 3.3 `src/lib/repos/settingsRepo.ts` — API 키(쿠키)

```ts
export function getApiKey(): string | null;   // document.cookie 파싱 → decodeURIComponent
export function setApiKey(key: string): void; // max-age=365일; path=/; SameSite=Lax; HTTPS면 Secure
export function clearApiKey(): void;          // 같은 이름으로 max-age=0
export function hasApiKey(): boolean;         // getApiKey() !== null
```

- `HttpOnly`는 **불가**: 브라우저 JS가 Gemini 호출에 키를 직접 써야 한다.
- 값은 `encodeURIComponent`로 저장하고 읽을 때 복원한다. 디코딩 실패 시 원문을 그대로 반환한다.
- 저장소 선택 근거는 ADR-3.

### 3.4 `src/lib/gemini.ts` — Gemini 클라이언트

```ts
/**
 * 저장된 키로 프롬프트를 보내고 응답 텍스트를 돌려준다. 키가 없으면 호출 전에 throw(err.keyNotSet).
 * images가 한 장 이상이면 멀티모달 요청으로 구성하고 타임아웃을 IMAGE_REQUEST_TIMEOUT_MS로 바꾼다(§4).
 * 모델은 두 경로가 같다(TEXT_MODEL 하나).
 */
export async function generate(prompt: string, images?: InlineImage[]): Promise<string>;

/** LLM 응답 텍스트에서 JSON 객체를 추출한다. 실패해도 throw하지 않고 { raw } 를 돌려준다. */
export function extractJson(text: string): Record<string, unknown>;
```

`images`는 **선택 인자**다. 기존 호출부(`createPersona`의 텍스트 경로, `analyzeMessage`)는 인자를 하나만 넘기므로 시그니처 확장만으로 회귀가 생기지 않는다. `images`가 `undefined`이거나 빈 배열이면 M1과 완전히 같은 요청(문자열 `contents` + 60초)이 나간다.

`extractJson` 절차(순서 고정):
1. ` ```json ` / ` ``` ` 펜스를 제거하고 `trim`.
2. 첫 `{`부터 중괄호 깊이를 세어 **첫 균형 블록** `{…}`을 찾아 `JSON.parse`.
3. 실패하면 정리된 텍스트 **전체**를 `JSON.parse`.
4. 그것도 실패하면 `{ raw: cleaned }` 반환. 호출자는 `'raw' in result`로 파싱 실패를 판별한다.

호출 상세(멀티모달 `contents` 구성 포함)·에러 변환은 §4. 오류 분류는 두 경로가 같은 규칙을 쓴다(§4.1) — 이미지 전용 오류 코드를 새로 두지 않는다.

#### 3.4.1 `src/lib/image.ts` — File → InlineImage (P5에서 생성)

```ts
/** 선택한 이미지 파일을 Gemini inlineData 파트에 실을 수 있는 형태로 바꾼다. */
export function fileToInlineImage(file: File): Promise<InlineImage>;
```

- `FileReader.readAsDataURL`로 읽어 얻은 data URL에서 **첫 쉼표 뒤**만 잘라 `data`에 담는다(`data:image/png;base64,` 접두 제거). 쉼표가 없으면 읽은 문자열을 그대로 쓴다.
- `mimeType`은 `file.type`을 쓰고, 브라우저가 비워 두면 `'image/png'`로 둔다.
- 읽기 실패(`reader.onerror`)는 reject한다. 화면이 잡아 `toast.imageLoadFail`을 띄운다(§3.10).
- 이 모듈은 DOM API(`FileReader`)에 의존하므로 Node 단위 테스트 대상이 아니다(§9.2).

### 3.5 `src/lib/prompts.ts` — 프롬프트

```ts
import type { Lang } from './i18n';

/** 페르소나 JSON 필드 스펙(문자열). 두 프롬프트가 공유하는 단일 출처 */
export const PERSONA_FIELDS: string;

export function buildPersonaPrompt(input: CreatePersonaInput, lang?: Lang): string;
export function buildAnalyzePrompt(input: { persona: PersonaRecord; message: string }, lang?: Lang): string;
```

**페르소나 프롬프트 계약**
- 요청 필드(= `PERSONA_FIELDS` 키): `summary`, `communication_style`, `speech_level`, `vocabulary_examples[]`, `sentence_style`, `emoji_symbol_usage`, `texting_habits`, `emotional_tendencies`, `what_they_value`, `how_they_seek_response`, `relationship_dynamics`. 각 키에는 "실제 대화에서 인용할 것"을 요구하는 설명을 붙인다(추상적 설명 금지, 어미 패턴·문장 예시·이모지 실물 나열).
- **입력 소스 블록은 `input.images` 유무로 분기한다**(P5에서 추가). 나머지 블록(분석 지시·JSON 형식·언어 지시)은 두 모드가 완전히 같다 — 출력 계약을 하나로 유지하기 위해서다.
  - 텍스트 모드: `대화 기록:` 뒤에 `conversation`을 그대로 붙인다.
  - 이미지 모드: 대화 텍스트 대신 **"대화 기록은 첨부된 채팅 캡처 이미지에 들어 있으니 이미지를 꼼꼼히 읽어 파악하라"** 는 지시를 넣고, 두 가지를 덧붙인다 — ① 말풍선의 좌/우 위치와 이름표를 근거로 각 발화가 누구의 것인지 판별할 것, ② 여러 장이면 위→아래, 앞→뒤 순서로 시간 흐름을 이어서 해석할 것. 이미지 모드에서는 `conversation`이 플레이스홀더 문자열이므로 프롬프트에 넣지 않는다(§3.7).
- `my_name`이 비면 최상위에 `PERSONA_FIELDS` 하나(상대만). `my_name`이 있으면 `{ "other_persona": {…}, "my_persona": {…} }` 이중 구조로 요청하고, **`my_persona`의 `sentence_style`·`vocabulary_examples`·`texting_habits`에는 내가 실제로 보낸 문장을 그대로 인용**하라고 지시한다 — 이것이 뒤에 "내 말투로 답장"을 만드는 재료다.
- 마지막에 "반드시 아래 JSON 형식으로만 응답. 다른 텍스트·설명·마크다운 금지"를 명시한다.

**분석 프롬프트 계약(v1: 받은 메시지 1건)**
- 입력 블록: 상대 페르소나 JSON, 상대 말투 요약(`speech_level`, `vocabulary_examples` 앞 8개, `sentence_style`, `emoji_symbol_usage`, `texting_habits`가 있을 때만), 나의 페르소나 JSON과 말투 지시(있을 때만), 받은 메시지.
- 분석 질문: 지금 느끼는 핵심 감정과 밑의 진짜 욕구 / 이 메시지를 보낸 심리적 이유 / 어떤 답변을 듣고 싶은가 / (있으면) 상대 말투가 기대하는 톤, 나의 말투에서 자연스러운 답변.
- 공감 가이드라인(3후보 공통): 감정→욕구 인식이 먼저, 조언·해결·화제 전환은 그 다음, 감정 축소·훈수·진부한 위로·심문 금지.
- 후보 3축: (1) 깊은 공감·수용형 (2) 공감 + 함께 해결형 (3) 공감 + 분위기 전환형.
- **말투 보존 원칙**: `my_name`이 있으면 `response`는 반드시 나의 실제 말투(반말·무뚝뚝함·장난스러움 등 무엇이든 그 "안에서")로 쓰고, 갑작스러운 존댓말·문어체·상담사 말투를 금지한다.
- 출력 계약: `{ "analysis": string, "candidates": [ { "label", "reason", "response" } × 3 ] }`. JSON만 출력.

**언어**: 프롬프트 본문은 한국어로 고정한다. `lang === 'en'`이면 말미에 "모든 **값**을 영어로 쓰되 JSON **키**는 바꾸지 말라"는 지시문을 덧붙인다. 키를 고정해야 `extractJson` 이후 필드 접근 계약이 언어와 무관하게 유지된다.

### 3.6 `src/lib/db.ts` + `src/lib/repos/*Repo.ts` — IndexedDB

```ts
// db.ts
export function initDB(): Promise<IDBDatabase>;                     // 1회 열고 재사용(모듈 스코프 Promise 캐시)
export function promisifyRequest<T>(req: IDBRequest<T>): Promise<T>;
export function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => Promise<T> | T,
): Promise<T>;                                                      // tx.oncomplete 시점에 resolve → 쓰기 내구성 보장
export function sortByCreatedDesc<T extends { created_at: string }>(rows: T[]): T[];

// repos/personaRepo.ts
export const personaRepo: {
  put(record: PersonaRecord): Promise<void>;
  get(id: string): Promise<PersonaRecord | null>;
  list(): Promise<PersonaRecord[]>;        // created_at desc
  remove(id: string): Promise<void>;
};

// repos/analysisRepo.ts
export const analysisRepo: {
  put(record: AnalysisRecord): Promise<void>;
  list(): Promise<AnalysisRecord[]>;       // created_at desc
  remove(id: string): Promise<void>;
};                                          // get은 사용처가 없어 두지 않는다(필요 시 추가)
```

스키마(`DB_VERSION = 1`, `onupgradeneeded`):

| 스토어 | keyPath | 인덱스 | 레코드 |
|---|---|---|---|
| `personas` | `id` | `created_at` (non-unique) | `PersonaRecord` |
| `analyses` | `id` | `created_at` (non-unique) | `AnalysisRecord` |

- `list()`는 `getAll()` 후 메모리에서 내림차순 정렬한다(개인 사용 규모에서 인덱스 커서보다 단순). 데이터가 커져 문제가 되면 인덱스 커서로 바꾼다(미확정).
- DB 열기 실패(`initDB` reject)는 `App.tsx`가 잡아 `err.dbOpen` 토스트를 띄운다.

### 3.7 `src/lib/persona.ts` — 페르소나 유스케이스

```ts
export async function createPersona(input: CreatePersonaInput): Promise<PersonaRecord>;
export async function listPersonaSummaries(): Promise<PersonaSummary[]>;
export function getPersona(id: string): Promise<PersonaRecord | null>;
export function removePersona(id: string): Promise<void>;
```

`createPersona` 흐름:
1. `buildPersonaPrompt(input, getLang())` — `input.images`가 있으면 프롬프트가 이미지 분기로 조립된다(§3.5)
2. `generate(prompt, input.images)` — `images`가 없으면 M1과 동일한 텍스트 요청. 실패는 §4의 사용자 친화 Error로 그대로 전파(화면이 토스트)
3. `extractJson(text)` → `my_name`이 있으면 `raw.other_persona`/`raw.my_persona`로 분리(없으면 `raw` 전체를 상대 페르소나, `my_persona = {}`). 분리 헬퍼는 `splitPersonaRaw(raw, myName): { personaData, myPersonaData }`이며, 현재 사용처가 `createPersona` 하나뿐이라 **모듈 내부 함수로 두고 export하지 않는다**. 재분석 경로가 생겨 다른 모듈이 쓰게 되면 그때 export한다. **JSON 파싱 실패(`'raw' in result`)는 거부하지 않고 원문을 보존해 저장한다** — 상대 페르소나가 `{ raw: text }`가 되고, `PersonaFields`의 인덱스 시그니처 덕에 상세 화면이 알 수 없는 키를 관대하게 표시하므로 사용자는 원문을 보고 삭제 후 재시도할 수 있다. (3단 사고: 1차 — 거부가 깔끔하다 / 2차 — 거부하면 사용자가 얻는 것이 없고 실패 원인을 볼 수도 없다, 반대로 저장하면 쓰레기 레코드가 남지만 삭제 한 번으로 정리된다 / 종합 — 원문 보존 저장. 실패율은 실호출에서 관찰해 `responseMimeType` 도입 여부(§10 #2)의 근거로 쓴다.)
4. `{ id: uuid(), name, my_name(trim), created_at: now ISO, conversation, persona, my_persona }` 구성
5. `personaRepo.put(record)` → 반환

입력 검증(이름 필수, 텍스트 모드면 대화가 너무 짧을 때 거부, 이미지 모드면 0장일 때 거부)은 화면(`PersonaPage`)이 호출 전에 수행한다.

**이미지 모드의 `conversation`**(P5). `PersonaRecord.conversation`은 상세 모달의 "원본 대화 기록 보기"가 읽는 필드다(DESIGN §5.3). 이미지 모드에는 저장할 대화 텍스트가 없으므로, 화면이 `createPersona`를 부르기 전에 **캡처 장수를 담은 i18n 플레이스홀더**(`persona.create.imagePlaceholder`, 예: "[채팅 캡처 이미지 3장으로 생성된 페르소나]")를 `conversation`에 넣는다. `createPersona`는 받은 문자열을 그대로 저장할 뿐 이 규칙을 알지 못한다.

- **이미지 자체는 레코드에 넣지 않는다.** `PersonaRecord`에 이미지 필드를 두지 않으므로 스키마와 `DB_VERSION`은 그대로다(1). base64 캡처를 IndexedDB에 쌓으면 레코드가 수 MB로 커지는데, 페르소나가 만들어진 뒤 이미지를 다시 쓸 경로가 없다.
- 그 대가로 **이미지 모드로 만든 페르소나는 근거 대화를 되짚어 볼 수 없다.** 상세에는 플레이스홀더 한 줄만 남는다. 텍스트 모드가 기본인 이유 중 하나이며(PRD §8 부속 결정 3), 필요가 확인되면 그때 저장 방식을 다시 논의한다(§10 #16).

### 3.8 `src/lib/analysis.ts` — 메시지 분석 유스케이스

```ts
export async function analyzeMessage(personaId: string, message: string): Promise<AnalysisRecord>;
export function listAnalyses(): Promise<AnalysisRecord[]>;
export function removeAnalysis(id: string): Promise<void>;
```

`analyzeMessage` 흐름:
1. `personaRepo.get(personaId)` — 없으면 throw
2. `buildAnalyzePrompt({ persona, message }, getLang())` → `generate(prompt)` → `extractJson(text)`
3. `'raw' in result`면 파싱 실패 폴백: `analysis = t('parse.failAnalysis')`, `candidates = [{ label: t('parse.failLabel'), reason: t('parse.failReason'), response: raw }]` — 사용자가 원문을 볼 수 있게 한다
4. 정상이면 `analysis`(string 아니면 ''), `candidates`(배열 아니면 [])로 정규화
5. `{ id: uuid(), persona_id, persona_name, message, analysis, candidates, created_at }` → `analysisRepo.put` → 반환

### 3.9 `i18n.ts` / `useI18n.ts` / `store.ts` / `id.ts` / `dom.ts`

```ts
// i18n.ts — ko/en 사전. 키 예: 'nav.personas', 'status.ready', 'toast.keySaved', 'err.invalidKey', 'parse.failLabel'
export type Lang = 'ko' | 'en';
export function t(key: string, params?: Record<string, string | number>): string; // '{name}' 치환. 폴백: 현재 언어 사전 → ko 사전 → 키 문자열
export function getLang(): Lang;
export function setLang(lang: Lang): void;              // document.documentElement.lang + document.title(t('app.title')) 갱신 + 구독자 통지 + localStorage(LANG_STORAGE_KEY='pm_lang') 저장
export function onLangChange(cb: () => void): () => void; // 해제 함수 반환
export function initI18n(): void;                       // 초기 언어 결정(localStorage 'pm_lang' → navigator.language → 'ko')

// useI18n.ts
export function useLocale(): Lang;                      // onLangChange 구독
export function useT(): typeof t;                       // locale 바뀌면 참조 갱신 → 리렌더

// store.ts (Zustand)
export interface ToastEntry { id: number; message: string; tone: 'info' | 'error' | 'success' }
export const useApp: UseBoundStore<StoreApi<{
  apiKey: string;                                   // 쿠키 미러(초기값 getApiKey() ?? ''). 온보딩 게이트가 구독
  selectedPersonaId: string | null;                 // 페르소나 탭 → 분석 탭 전달값
  toasts: ToastEntry[];
  setApiKey(key: string): void;                     // settingsRepo.setApiKey + 상태 갱신
  clearApiKey(): void;
  refreshApiKey(): void;
  setSelectedPersonaId(id: string | null): void;
  pushToast(message: string, tone?: ToastEntry['tone']): void; // 4초 후 자동 dismiss
  dismissToast(id: number): void;
}>>;
/** 스토어 밖(React 트리 밖)에서 키 존재 여부만 볼 때 쓰는 모듈 함수. 쿠키를 다시 읽지 않고 미러 값을 본다. */
export function hasApiKey(): boolean;                   // useApp.getState().apiKey.trim().length > 0

// id.ts
export function uuid(): string;                         // crypto.randomUUID() 직접 호출(폴백 없음)

// dom.ts
export function formatDate(iso: string): string;        // 'YYYY.MM.DD'
export function getInitial(name: string): string;       // 아바타용 첫 글자(대문자), 없으면 '?'
```

- 로케일은 Zustand가 아니라 `i18n.ts`의 모듈 상태 + 구독으로 관리한다. 도메인 모듈(`prompts.ts`, `analysis.ts`)이 React 밖에서 `getLang()`/`t()`를 써야 하기 때문이다.

### 3.10 `components/` · `routes/` · `App.tsx` · `main.tsx` 책임

| 파일 | 책임 | 데이터 경로 |
|---|---|---|
| `main.tsx` | `initI18n()` → `createRoot` → `<React.StrictMode><HashRouter><App/></HashRouter></…>` | — |
| `App.tsx` | 상단바(로고·앱명·`ApiKeyStatus`·`LanguageToggle`), `<Routes>`(`/` → `/personas` redirect, `/personas`, `/analyze`, `/history`), 하단 탭 3개, `initDB()` 1회 호출, **`!apiKey`면 `<OnboardingModal/>` 렌더**(온보딩 게이트), `<ToastContainer/>` | `useApp` |
| `OnboardingModal` | 키 `password` 입력 + 발급 링크(`GEMINI_API_KEY_HELP_URL`) + "이 기기에만 저장" 동의 체크박스(고지 문구 수준은 §10 #8) → 저장. 빈 키/미동의는 토스트로 거부. 키가 있으면 `null` | `useApp.setApiKey` |
| `ApiKeyStatus` | 키 있을 때만 헤더에 "● Gemini 준비됨". 클릭 → 인라인 입력(변경/취소/삭제). 키 없으면 `null`(모달이 점유) | `useApp` |
| `LanguageToggle` | `한`/`EN` 세그먼트 필 | `setLang`, `useLocale` |
| `Toast` | `toasts` 큐 렌더, 클릭 시 dismiss. 위치·톤 색은 DESIGN.md | `useApp` |
| `PersonaPage` | 목록(`listPersonaSummaries`) · 생성 바텀 시트(이름·나의 이름 + **텍스트/이미지 입력 토글** → 제출 전 검증(§3.7) → `createPersona`) · 상세 모달(`PERSONA_FIELDS` 11항목 = summary 블록 + 10 카드, 추가 키는 관대 표시, 나/상대 탭 → `getPersona`) · 삭제(`removePersona`) · "분석하기로" 진입(`setSelectedPersonaId`) | `lib/persona.ts`, `lib/image.ts` |
| `AnalyzePage` | 페르소나 칩 선택(초기값: `useApp.selectedPersonaId`가 목록에 있으면 그것, 없으면 첫 번째) + 받은 메시지 textarea → `analyzeMessage` → 분석문 + 후보 3장(복사 버튼 `navigator.clipboard.writeText`) | `lib/analysis.ts`, `lib/persona.ts`, `useApp` |
| `HistoryPage` | `listAnalyses` 목록 · 카드 펼치기 · 삭제(`removeAnalysis`) | `lib/analysis.ts` |

- `PersonaPage`의 이미지 모드 상태는 시트 안에 갇힌다(P5): 입력 모드(`'text' | 'image'`)와 선택한 `InlineImage[]`는 생성 시트의 로컬 상태이며, 시트를 닫으면 다른 입력값과 함께 버려진다(DESIGN §9 "입력 유지"). 파일 선택 → `fileToInlineImage`(§3.4.1) 변환 → 썸네일 표시 → 제출 시 `createPersona`의 `images`로 전달이라는 한 방향 흐름이고, 전역 스토어에 이미지를 올리지 않는다.
- 모든 사용자/LLM 문자열은 JSX 텍스트 노드로만 렌더한다. `dangerouslySetInnerHTML` 사용 금지(§8). 썸네일은 사용자가 방금 고른 파일을 `data:` URL로 되돌려 `<img>`에 넣는 것이라 이 규칙과 무관하다.
- 비동기 실패는 각 화면이 `catch`해 `pushToast(err.message, 'error')`로 표시한다. 유스케이스는 이미 사용자 언어의 메시지를 담은 `Error`를 던진다(§4).

---

## 4. Gemini 호출 상세

```ts
// gemini.ts 내부(개요)
const ai = new GoogleGenAI({ apiKey });                 // 호출마다 생성(키 변경 즉시 반영, 생성 비용 미미)

const useImages = !!images && images.length > 0;        // P5
const timeoutMs = useImages ? IMAGE_REQUEST_TIMEOUT_MS : TEXT_REQUEST_TIMEOUT_MS;

// 텍스트만이면 문자열 그대로, 이미지가 있으면 parts 배열로 멀티모달 구성
const contents = useImages
  ? [{ role: 'user', parts: [
      { text: prompt },
      ...images.map((img) => ({ inlineData: { mimeType: img.mimeType, data: img.data } })),
    ] }]
  : prompt;

const response = await ai.models.generateContent({
  model: TEXT_MODEL,                                    // 'gemini-3.1-flash-lite' — 두 경로 공통
  contents,
  config: {
    httpOptions: { timeout: timeoutMs },                // 60s / 180s
    thinkingConfig: { thinkingBudget: 0 },              // 추론 토큰 제거 → 지연 단축(실측은 미확정)
  },
});
return response.text ?? '';
```

- **단일 모델**: 모든 호출이 `TEXT_MODEL` 하나를 쓰고 `thinkingConfig`를 항상 함께 보낸다. 이미지가 붙어도 모델은 바뀌지 않는다 — `gemini-3.1-flash-lite`가 멀티모달이라 별도 비전 모델이 필요 없다(ADR-6). 모델명·설정은 `config.ts`에서만 바꾼다.
- **파트 순서**: 텍스트 프롬프트가 첫 파트이고 이미지가 그 뒤에 화면 순서대로 붙는다. 프롬프트가 "여러 장이면 위→아래, 앞→뒤로 이어 해석하라"고 지시하므로(§3.5), 화면이 넘기는 배열 순서 = 사용자가 첨부한 순서 = 대화의 시간 순서라는 전제가 성립해야 한다. 화면은 선택한 파일을 **추가된 순서 그대로** 배열에 쌓고 재정렬하지 않는다.
- **요청 경로별 파라미터**

  | 경로 | `contents` | 타임아웃 | 모델 | 실측 지연 |
  |---|---|---|---|---|
  | 텍스트(페르소나 생성·메시지 분석) | 프롬프트 문자열 | `TEXT_REQUEST_TIMEOUT_MS` 60s | `TEXT_MODEL` | 1.94s / 6.57s / 5.87s / 3.49s (각 1회, §9.5) |
  | 캡처 이미지(페르소나 생성) | `[{ role:'user', parts:[{text}, …{inlineData}] }]` | `IMAGE_REQUEST_TIMEOUT_MS` 180s | `TEXT_MODEL`(동일) | **미실측** — P5 검증에서 실제 캡처로 측정(§10 #15) |
- **thinkingBudget=0**: flash-lite가 기본적으로 내부 추론(thinking) 토큰을 써 단건 응답이 길어질 수 있다는 것은 문헌 근거이며 실측하지 않았다(기본 thinking 사용 여부·지연 단축 효과 모두 **미실측**). 우리 출력은 정형 JSON이라 추론을 꺼도 형식 준수에는 영향이 작을 것으로 본다. 모델명과 `thinkingConfig`가 API에서 수락되는지, 품질·지연 차이는 어떤지는 P3 첫 실호출부터 실사용으로 확인한다(**미확정**, §10 #1·#10).
- **타임아웃**: `httpOptions.timeout`은 텍스트 60초, 이미지가 붙으면 180초. 초과 시 SDK가 던지는 오류(`AbortError`/"timeout")를 `err.timeout`으로 변환한다 — 두 경로가 같은 문구를 쓴다(§4.1). 사용자에게는 어느 타임아웃에 걸렸는지 구분해 알리지 않는다.
- **키 사전 검증 호출 없음**: 온보딩은 키를 저장만 한다. 키 유효성은 첫 실제 호출의 인증 오류로 드러나며, 그때 키 재입력을 유도한다. (별도 검증 호출은 할당량을 소모하고 온보딩을 느리게 하므로 두지 않는다.)
- **JSON 강제**: 프롬프트의 "JSON만 출력" 지시 + `extractJson` 방어 파싱으로 시작한다. `responseMimeType: 'application/json'` 옵션의 필요 여부는 실호출에서 파싱 실패율을 본 뒤 결정한다(**미확정**).
- **응답 비어 있음**: 안전 필터 등으로 `response.text`가 `undefined`면 `''`로 취급 → `extractJson`이 `{ raw: '' }` → 호출자 폴백 경로. 별도 사용자 안내 문구는 미확정.

### 4.1 에러 변환(사용자 친화 Error)

`generate`는 SDK 오류를 잡아 아래 규칙으로 **i18n 메시지를 담은 `Error`**로 바꿔 던진다. 분류는 오류 객체의 `status`와 메시지 문자열을 함께 본다(SDK 오류 객체의 정확한 형태는 P2 임의 키 호출로 확인 — 미확정, §10 #3).

| 순서 | 신호 | 분류 | 메시지 키 | 화면 동작 |
|---|---|---|---|---|
| 0 | 호출 전 `getApiKey()`가 null | 키 없음 | `err.keyNotSet` | 온보딩 게이트가 이미 열려 있어야 정상 |
| 1 | 메시지에 `API key`/`API_KEY_INVALID`/`PERMISSION_DENIED`/`unauthorized`/`forbidden`, 또는 `status === 403`/`403` 포함 | **인증(403 또는 키 관련 메시지)** | `err.invalidKey` | 토스트 문구(`err.invalidKey`)로 헤더에서 키를 바꾸라고 안내 — 편집 상태를 자동으로 열지는 않음(`generate`는 plain `Error`만 던져 화면이 종류를 식별하지 않는다) |
| 2 | `Failed to fetch`/`network` | 네트워크 | `err.network` | 토스트 |
| 3 | `name === 'AbortError'`/`timeout`/`timed out`/`aborted` | 타임아웃(텍스트 60s / 이미지 180s) | `err.timeout` | 토스트 |
| 4 | `429`/`quota`/`rate limit` | 요청 과다(할당량) | `err.rateLimit` | 토스트 |
| 5 | `500`/`503` | 서비스 일시 오류 | `err.serviceTemp` | 토스트 |
| 6 | 그 외 | 일반 | `err.aiGeneric` (`{msg}` 포함) | 토스트 |

- **400은 status만으로 인증 오류로 분류하지 않는다.** 400은 요청 파라미터 오류 등 키와 무관한 원인이 많으므로, 메시지에 키 관련 신호가 있을 때만 `err.invalidKey`로 본다. 403은 status만으로도 인증으로 본다.
- 오류 메시지에 키·프롬프트가 섞여 나가지 않도록 `err.aiGeneric`의 `{msg}`에는 SDK 메시지만 넣는다.

---

## 5. 결정 기록(ADR 요약)

| ID | 결정 | 1차 사고 | 비판적 재사고 | 종합 |
|---|---|---|---|---|
| ADR-1 | **Client-First** (브라우저 저장 + 사용자 키 직접 호출 + 정적 서버) | 요약 — 정본은 [PRD §8.2](./PRD.md#8-아키텍처-방향-결정-3단-사고) | 요약 — 정본은 [PRD §8.3](./PRD.md#8-아키텍처-방향-결정-3단-사고). 기각 대안: (a) 서버+로컬 Ollama, (b) 운영자 키 프록시 | 채택([PRD §8.4](./PRD.md#8-아키텍처-방향-결정-3단-사고)). 기술적 함의는 §1.3 |
| ADR-2 | **Gemini 단일 flash 모델 + thinking off** (`gemini-3.1-flash-lite`, `thinkingBudget=0`) | 모바일 단건 UX는 지연이 핵심. 추론 토큰을 끌 수 있는 flash 계열이 유리하다는 문헌 근거(미실측), 멀티모달이라 P5 캡처 이미지도 같은 모델로 처리 가능 | ① thinking을 끄면 페르소나 추출 품질이 떨어질 수 있다 — 키가 없어 반증 불가(미확정). ② lite vs 비-lite flash: 둘 다 thinking을 끌 수 있다. lite를 택한 근거(비용·할당량·지연)는 실측이 없어 **선택 근거 미확정**. ③ 모델을 여러 개 두면 분기·타임아웃·오류 처리가 늘어 P0 규모에 과함 | 단일 모델 채택, `thinkingConfig` 무조건 적용. 지연·품질은 P3~P4 실사용에서 측정하고 품질 문제가 보이면 비-lite flash가 교체 후보(요약 — 정본은 [PRD §8.4 부속 결정 2](./PRD.md#8-아키텍처-방향-결정-3단-사고)) |
| ADR-3 | **IndexedDB(개인 데이터) + 쿠키(API 키)** | 페르소나·기록은 수 KB~수백 KB의 구조화 레코드 → IndexedDB. 키는 한 줄 문자열이라 쿠키가 구현이 단순하고(만료 내장, 새로고침·재방문 유지) | 키를 localStorage에 둘 수도 있다. 그러나 XSS 노출 관점에서는 **둘이 동등**하다(둘 다 같은 origin JS가 읽는다). `HttpOnly` 쿠키는 브라우저가 키를 직접 써야 하므로 애초에 불가. 페르소나까지 쿠키/localStorage에 넣는 것은 용량(4KB/5MB)과 구조화 조회 면에서 부적합 | IndexedDB + 쿠키 채택(요약 — 정본은 [PRD §8.4 부속 결정 1](./PRD.md#8-아키텍처-방향-결정-3단-사고)) |
| ADR-4 | **HashRouter** | GitHub Pages 프로젝트 사이트는 하위 경로에 배포되고 서버 리라이트를 못 한다. `#/personas` 식 라우팅은 어떤 정적 호스트에서도 새로고침·직접 진입이 깨지지 않는다 | BrowserRouter + 404.html 리다이렉트 트릭도 있지만 호스트 의존적이고 SEO는 이 앱에 무의미. 해시 URL이 덜 예쁜 것은 모바일 웹 앱에서 체감이 작다 | HashRouter 채택. Express 미리보기의 SPA 폴백은 안전망으로만 둔다 |
| ADR-5 | **Zustand 최소 전역 상태** | 화면 상태는 각 페이지의 `useState`로 충분하고, 전역으로 필요한 것은 API 키 미러(온보딩 게이트)·`selectedPersonaId`(탭 간 전달값)·토스트 큐 3개 | Context만으로도 가능하지만 Provider·리듀서 보일러플레이트 대비 이득이 없다. 온보딩 게이트·헤더 인디케이터·각 페이지가 같은 `apiKey` 미러를 구독해야 하고, 스토어 API(`useApp.getState()`)로 React 트리 밖에서도 상태를 읽을 수 있어 단순하다. Redux류는 규모 대비 과함 | Zustand 스토어 1개 채택. 로케일은 i18n 모듈이 자체 관리(도메인 코드가 React 밖에서 `t()` 사용) |
| ADR-6 | **캡처 이미지 입력을 선택 모드로 가산** (`CreatePersonaInput.images?` + `generate(prompt, images?)` + 이미지 타임아웃 180s, 모델은 그대로 하나) | 텍스트로는 아예 넣을 수 없는 대화가 있다 — 타인 기기의 화면, 복사가 막혔거나 이미 지운 대화, 캡처만 떠 둔 대화. 모델이 멀티모달이라 별도 OCR·별도 모델 없이 같은 호출 경로에 이미지를 얹을 수 있다 | ① 스크린샷은 텍스트 프롬프트보다 훨씬 크고 인라인 base64로 실으면 원본 바이트보다 약 4/3로 더 늘어나, 요청이 무겁고 느릴 수 있다(장당 실제 크기 미측정) → 이미지 경로에만 180초 타임아웃(값은 실측 근거 없는 여유값, §10 #15). ② **캡처 한 장은 화면 한 장 분량의 발화만 담아 붙여넣기보다 인용 재료가 적을 수 있다 — 반증하지 못했다.** 정확도 비교 표본이 없다(§10 #16). ③ 캡처에는 프로필 사진·표시 이름 같은 부수 정보가 함께 실려 Google로 나간다 → 고지(PRD DR-4). ④ 텍스트를 대체하는 안은 ②가 미확정인 이상 검증된 경로를 버릴 근거가 없어 기각 | 텍스트를 **기본**, 이미지를 **선택 모드**로 둔다. 계약은 **가산**만 한다(선택 필드·선택 인자·타임아웃 상수 1개) — 텍스트 호출부는 손대지 않고, 실패하면 이미지 코드만 되돌리면 M1 동작이 남는다. 정확도·지연은 관찰 항목(요약 — 정본은 [PRD §8 부속 결정 3](./PRD.md#8-아키텍처-방향-결정-3단-사고)) |

---

## 6. 배포 · 서버

### 6.1 원칙
- 프로덕션은 **정적 호스팅**(GitHub Pages, P7). API 라우트·DB·세션·CORS 미들웨어 없음. Gemini는 브라우저가 직접 호출하므로 서버 측 CORS 설정도 불필요.
- Pages 하위 경로(`base`)와 배포 workflow는 저장소/표시명이 확정되는 P7에서 결정한다(**미확정**).

### 6.2 로컬 미리보기 `server/index.js` (P1)

```js
// 무상태 정적 파일 서버. dist/만 서빙한다.
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';   // 같은 Wi-Fi 휴대폰 접속용(A6)
app.use(compression());
app.use((_req, res, next) => {                 // 경량 보안 헤더
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});
app.use(express.static(DIST_DIR, { index: 'index.html', maxAge: '1h' }));
app.get('*', (_req, res) => res.sendFile(join(DIST_DIR, 'index.html'))); // SPA 폴백(안전망)
```

- 의존성: `express` 4.x(`^4.19`), `compression`(런타임 `dependencies`). ESM(`"type": "module"`). Express 5.x로 올리면 `app.get('*', …)` 와일드카드 문법이 바뀌어(`/{*splat}`) SPA 폴백 코드를 함께 고쳐야 한다.
- 시작 로그에 `http://localhost:8000`과 "같은 네트워크의 휴대폰: http://[이 PC의 IP]:8000"을 출력한다.

### 6.3 포트

| 용도 | 명령 | 호스트:포트 |
|---|---|---|
| 개발(HMR) | `npm run dev` | `0.0.0.0:4121` (`strictPort`) |
| 빌드 미리보기(Vite) | `npm run preview` | `0.0.0.0:8000` |
| 빌드 미리보기(Express) | `npm start` | `0.0.0.0:8000` (`PORT`/`HOST` env로 변경) |

---

## 7. 빌드 · 실행

```jsonc
// package.json — name: "persora"(M1 직전 코드네임 persona-mirror에서 변경), version: "1.0.0"(M1), private, type: module
"engines": { "node": ">=20" },
"scripts": {
  "dev": "vite",
  "build": "tsc --noEmit && vite build",
  "preview": "vite preview",
  "start": "node server/index.js"
}
```

| 명령 | 결과 |
|---|---|
| `npm install` | 의존성 설치(Node 20+) |
| `npm run dev` | 개발 서버 `http://localhost:4121` |
| `npm run build` | 타입 검사 통과 후 `dist/` 생성. **둘 중 하나라도 실패하면 빌드 실패** |
| `npm start` | `dist/`를 8000 포트로 서빙(A5) |
| `npm test` | M1 이후 vitest 도입 시 추가(§9) |

첫 실행 시 온보딩 모달에서 Google AI Studio 키를 등록한다. 키는 쿠키에 저장되고, 이후 모든 분석이 이 키로 동작한다.

---

## 8. 보안

| 항목 | 위협 | 대응 |
|---|---|---|
| **XSS** | 대화 원문·LLM 출력에 스크립트/HTML이 섞여 렌더되면 쿠키의 키가 탈취될 수 있음 | 모든 사용자/LLM 문자열은 React 텍스트 노드로만 렌더(`dangerouslySetInnerHTML` 금지). 마크다운/HTML 렌더링을 도입하려면 sanitizer가 선행 조건. P7에서 `index.html`에 CSP meta(`default-src 'self'; connect-src 'self' https://generativelanguage.googleapis.com …`) 적용 — 정확한 정책은 P7에서 확정(미확정) |
| **키 취급** | 브라우저에 평문 보관, JS에서 읽힘(설계상 불가피) | 쿠키 `SameSite=Lax`, HTTPS면 `Secure`. `HttpOnly` 불가. 피해 범위 축소로 "Google AI Studio에서 키를 Gemini API만 쓰도록 제한하고, 노출 의심 시 즉시 회전"을 안내. HTTP referrer 제한은 AI Studio에서 가능한지 미확인이고(§10 #11), 우리 origin의 XSS는 같은 referrer로 통과하며 탈취 후 비브라우저 클라이언트는 Referer를 임의로 넣을 수 있어 효과가 제한적이다. 헤더에서 언제든 삭제 가능 |
| **로깅** | 콘솔·오류 리포트로 키/대화 유출 | 키·대화·프롬프트·응답 원문을 `console.*`에 출력하지 않는다. 오류 토스트에는 SDK 메시지만 포함 |
| **데이터 전송 고지** | 사용자가 대화가 어디로 가는지 모름 | 고지 내용: 페르소나 생성 시 대화 텍스트 **또는 첨부한 캡처 이미지**, 분석 시 페르소나 JSON + 받은 메시지가 **Google Gemini API로 직접 전송**되며, 우리 서버는 어떤 개인 데이터도 받지 않는다. 캡처는 대화 본문 외의 부수 정보(프로필 사진·표시 이름 등)까지 함께 실려 나간다는 점을 이미지 모드 힌트에 적는다(PRD DR-4). 브라우저 데이터 삭제 시 복구 불가도 함께 고지. 기본안은 온보딩 모달이며, 노출 위치·문구 수준은 §10 #8(미확정) |
| **서버 표면** | 서버 취약점 | 정적 파일만 서빙, 입력 처리 코드 없음. `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer` |
| **의존성** | 공급망 | 런타임 의존성 최소(react, react-dom, react-router-dom, zustand, @google/genai, express, compression). 버전은 `package.json`에 고정 |

---

## 9. 테스트 전략

### 9.1 게이트(모든 코드 커밋 직전)
- `npx tsc --noEmit` 무에러.
- `npx vite build` 성공(`npm run build`가 둘을 순서대로 실행).
- CLAUDE.md 검증 정책에 따라 매 편집이 아니라 **마일스톤 종료·커밋 직전·계약 변경 시**에 돌리고, 결과를 LOG에 사실대로 적는다(미실행이면 "미실행").

### 9.2 단위 테스트(M1 이후 도입 계획)
- 도구: `vitest`(devDependency), `npm test` = `vitest run`.
- 대상은 **DOM·네트워크 없이 순수하게 검증 가능한 모듈**부터: `extractJson`(펜스/균형 블록/전체 파싱/raw 폴백 4경로), 프롬프트 빌더의 분기(`my_name` 유무, `lang`), 유틸(`formatDate`, `getInitial`).
- IndexedDB CRUD는 Node용 IndexedDB shim 없이 브라우저 스모크로 대신한다(shim 도입 여부 미확정). `image.ts`의 `fileToInlineImage`도 `FileReader`(DOM API)에 의존해 같은 이유로 브라우저 스모크가 검증 수단이다.

### 9.3 UI 스모크(마일스톤)
- `npm run dev`(4121) + 브라우저 자동화로: 키 없을 때 온보딩 모달 표시 → 키 입력 + 동의 → 저장 후 모달 닫힘·헤더 "● Gemini 준비됨" → 탭 이동 → 페르소나 생성 시트 열림.
- **Gemini 실호출 품질(JSON 준수율, 지연, 말투 재현)은 키가 필요해 자동화 대상이 아니며 미확정으로 남긴다.** 실사용 관찰을 LOG에 기록한다.

### 9.4 Acceptance 매핑([PRD](./PRD.md) A1~A6)

| ID | 확인 방법 |
|---|---|
| A1 키 미등록 시 온보딩 모달 | 쿠키 삭제 후 진입 → 모달이 화면 점유(스모크) |
| A2 키 등록 후 생성·분석·기록 동작 | 수동 시나리오(실키 필요) |
| A3 네트워크 분리 | DevTools Network: 우리 서버(4121/8000)엔 정적 요청만, LLM은 `generativelanguage.googleapis.com` 직접 |
| A4 새로고침·재방문 유지 | 새로고침 후 IndexedDB 레코드·쿠키 키 유지(Application 탭) |
| A5 빌드·서빙 | `npm run build` 무에러 + `npm start` 후 8000 응답 |
| A6 모바일 동일 동작 | 같은 Wi-Fi 휴대폰에서 `http://[PC IP]:8000` 접속, A1~A4 반복 |

### 9.5 M1까지 실제로 수행한 검증

§9.1~§9.4는 계획이고, 이 절은 M1(P4 완료) 시점에 **실제로 돌린 것**만 적는다. 근거는 [`LOG.md`](./LOG.md)의 P1~P4·표시명 항목이다.

**게이트(§9.1)** — P1·P2·P3·P4와 표시명 통일까지 다섯 번 모두 `npx tsc --noEmit` 0 에러, `npx vite build` 성공. 최종 산출물은 JS 529.88 kB(gzip 131.68 kB). `node server/index.js`로 띄운 정적 서버는 `GET /`·`GET /app-logo.png`에 200을 반환했다(A5).

**UI 스모크(§9.3)** — Vite dev(4121) + Playwright, 뷰포트 390×844(표시명 확인은 360px). 실행 범위는 계획했던 "모달 → 저장 → 탭 이동 → 시트 열림"보다 넓다.

| 단계 | 확인한 것 |
|---|---|
| P1 | `#/` → `#/personas` 리다이렉트, 하단 탭 3개, 탭 전환, 한/EN 토글. 콘솔 에러 0 |
| P2 | 온보딩 모달 점유(A1) → 무효 키 + 동의 저장 → 헤더 `● Gemini 준비됨` → 새로고침 유지(A4) → 인라인 삭제 → 모달 재등장 |
| P3 | 빈 상태 → 생성 시트 → 검증 토스트 3종 → 실키 생성 → 목록 카드 → 상세 모달(나/상대 탭·11필드·원본 대화) → 새로고침 유지(A4) → 삭제 |
| P4 | 페르소나 없음 안내 → 칩 초기 선택 → 빈 메시지 토스트 → 실키 분석 → 후보 3장 → 기록 탭 펼치기·새로고침 유지·삭제. 콘솔 에러 0 |

**실키 호출(§9.3 단서에서 "자동화 대상 아님"으로 남겼던 부분)** — 유효 키가 확보되어 M1 안에서 4회 실행했다. 지연은 브라우저 Resource Timing 기준 각 1회 측정값이다.

| 호출 | 입력 규모 | 지연 | 결과 |
|---|---|---|---|
| 소형 프롬프트(P2) | 한 문장 + JSON-only 지시 | 1.94s | `{"tone": "친근함"}` 15자, `extractJson` 파싱 성공 |
| 페르소나 생성(P3) | 대화 1,331자(38줄), 나/상대 동시 | 6.57s | 11필드 JSON 파싱 성공, `vocabulary_examples`가 원문 인용 |
| 페르소나 생성(P4) | 대화 30줄 | 5.87s | 생성 성공, 분석 탭 초기 선택으로 연결 |
| 메시지 분석(P4) | 페르소나 2종 + 받은 메시지 1건 | 3.49s | 후보 3개 JSON 파싱 성공, 3축 정식 라벨·나의 말투 유지 |

측정은 각 1회뿐이라 **분산·중앙값은 알 수 없다**. thinking off의 지연 단축 효과도 off 상태만 쟀으므로 여전히 미실측이다(§10 #1).

**돌리지 않은 것** — 단위 테스트(§9.2)는 M1까지 도입하지 않았으므로 전 구간 "미실행"이다. A6(같은 Wi-Fi 실기기 접속)도 **미실행**이며, 자동화 뷰포트 390/360px 확인이 그것을 대신하지 못한다.

---

## 10. 미확정 항목

| # | 항목 | 확정 시점/방법 |
|---|---|---|
| 1 | `gemini-3.1-flash-lite` + `thinkingBudget=0`의 지연·JSON 준수율·페르소나 품질 | **부분 확인(M1)**: 실키 4회 모두 정상 응답·JSON 파싱 성공, 지연 1.94s/6.57s/5.87s/3.49s(§9.5). 남은 미확정 — 표본이 각 1회라 분산·준수율을 말할 수 없고, **thinking off의 효과는 off 상태만 재서 미실측**이다. P6 실사용에서 표본을 늘린다 |
| 2 | `responseMimeType: 'application/json'` 필요 여부 | 도입하지 않음 — LOG에 파싱 결과가 적힌 실호출(P2 `extractJson`, P3 11필드, P4 후보 3개)에서 실패가 없었다. 표본이 작으므로 실패가 보이면 재검토 |
| 3 | ~~브라우저 직접 호출(CORS) 통과 여부, 오류 객체 형태~~ **확인됨(P2)**: 브라우저→`generativelanguage.googleapis.com` 직접 호출 CORS 통과. 무효 키는 HTTP 400 + `error.code=400/status=INVALID_ARGUMENT/reason=API_KEY_INVALID`로 도착하고 SDK 오류 메시지에 그 JSON이 포함된다 → §4.1 분류 규칙(메시지 "api key" 포함 → 인증 오류) 유효. 방법·수치는 LOG P2 | P2 완료 |
| 4 | ~~이미지 경로의 타임아웃 값과 `generate` 시그니처 확장 방식~~ **확정(P5 docs)**: `generate(prompt, images?)`로 선택 인자를 가산하고, 이미지가 있을 때만 `IMAGE_REQUEST_TIMEOUT_MS = 180_000`을 쓴다. 모델은 분기하지 않는다(§3.4·§4·ADR-6) | 완료 |
| 5 | GitHub Pages `base` 경로·workflow·CSP 정확한 정책 | P7 |
| 6 | ~~페르소나 생성에서 JSON 파싱 실패(`raw`) 시 처리~~ **확정(P3)**: 원문 보존 저장(§3.7) | P3 docs |
| 7 | IndexedDB `list()`의 메모리 정렬 → 인덱스 커서 전환 기준 | 데이터 규모 문제 발생 시 |
| 8 | 데이터 전송(DR-4)·휘발성(DR-6) 고지의 노출 위치(기본안 온보딩 모달)·문구 수준 | P2 온보딩 문구 작성 시 PRD/DESIGN과 맞춤 |
| 9 | ~~표시명(코드네임 "Persona Mirror" → 정식명)~~ **확정(M1 직전)**: Persora. `DB_NAME`·쿠키명은 유지 | 완료 |
| 10 | ~~`gemini-3.1-flash-lite` 모델명 유효성·`thinkingConfig` 수락 여부~~ **확인(P2~P4)**: 실키 호출 4회가 모두 정상 응답을 돌려줬다. 모델명도 `thinkingConfig`도 거부되지 않았다 | 완료 |
| 11 | AI Studio 키의 API/referrer 제한 UI 존재 여부(§8 안내 문구의 전제) | 미확인 — P2 온보딩 문구는 이 전제 없이 작성했다. P7 보안 점검에서 확인 |
| 12 | 첫 로드 JS 529.88 kB(gzip 131.68 kB)에 코드 스플리팅을 도입할지 | 배포 경로가 정해지는 P7 직전에 판단. 대부분이 `@google/genai` 번들이라 분할 대상은 LLM 호출 경로다 |
| 13 | 상세 모달 백드롭이 화면 최상단 약 20px를 덮지 않는 것으로 보임(P3 스크린샷 관찰) | **원인 미조사.** 닫기·조작에는 영향이 없어 M1에서 추적하지 않았다. P6 안정화에서 열린 오버레이의 `getBoundingClientRect().top`을 실측해 진단한다 |
| 14 | 실기기 확인(A6, 같은 Wi-Fi 휴대폰) | **미실행.** 자동화 뷰포트 390/360px만 확인했다. P6 실사용에서 수행 |
| 15 | 캡처 이미지 요청의 지연·페이로드 크기와 `IMAGE_REQUEST_TIMEOUT_MS = 180_000`의 적정성  — P5 실측: 캡처 1장(162 KB, base64 약 216 KB) 4.95s(표본 1) | **미실측.** 장당 base64 크기도 요청 지연도 잰 적이 없고, 180초는 근거 없는 여유값이다. P5 검증에서 실제 카카오톡 캡처 1장으로 생성해 지연을 재고, 값이 과하거나 모자라면 상수 1곳을 고친다 |
| 16 | 캡처 이미지로 만든 페르소나의 정확도(텍스트 대비)와 캡처 장수 상한·압축 도입 여부  — P5 관찰(표본 1): 캡처 1장의 vocabulary_examples 5개 중 2개가 음식 명사(문체 지표 아님). 결론 보류, 실사용 관찰 지속 | **미확정.** 같은 대화를 두 모드로 만들어 비교한 표본이 없다(ADR-6 반증 실패 항목). 장수 상한과 리사이즈도 두지 않고 시작하며, #15 실측 뒤 필요가 보이면 넣는다. 이미지를 레코드에 저장하지 않는 결정(§3.7)의 재논의도 이 관찰에 달렸다. P5 검증에서 1회 관찰하고 판단은 P6 실사용으로 넘긴다 |
