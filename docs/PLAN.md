# PLAN — Persora 구현 계획

> 문서 버전: 1.7 · 갱신일: 2026-09-05 · 상태: P7 완료 — 다음은 P8 보안 점검·배포(§3 표·§4 체크리스트가 단일 출처)

## 문서 이력
| 버전 | 날짜 | 변경 |
|---|---|---|
| 0.1 | 2026-09-05 | 초안 |
| 0.2 | 2026-09-05 | P1~P3 완료 반영(§3 상태·§4 체크), 상태 문구 갱신 |
| 0.3 | 2026-09-05 | 표시명 Persora 확정 반영(§2 트리, §5, §8) |
| 1.0 | 2026-09-05 | M1 기준선: §2 트리를 실제 `src/`와 대조, §3 P4 완료·P5 다음 단계, §4 P4 검증 범위 정정(A6 미실행), §5에 M1 결과 표·남은 미확정, §8 갱신 |
| 1.1 | 2026-09-05 | P5 착수: §2 트리에 `image.ts`(P5), §3 P5 상태 진행중·산출물을 확정 계약으로 교체, §4 P5 체크리스트 상세화(docs 완료·구현 대기), §8 이미지 입력 UX 항목 정리 + 지연·정확도 미확정 추가 |
| 1.2 | 2026-09-05 | P5 완료 반영(§3 상태·§4 체크) |
| 1.3 | 2026-09-05 | P6 착수(분석 재설계). **단계 번호 재편** — 새 P6 = 분석 재설계, 기존 안정화 P6 → **P7**, 기존 보안·배포 P7 → **P8**(§3·§4·§6·§8과 다른 문서의 단계 참조를 모두 옮겼다). §1.3 검증 정책에 `npm test` 게이트 추가(vitest 도입 트리거 충족), §2 트리에 `thread.ts`·`drafts.ts`·`*.test.ts`, §3 표에 P6-1·P6-2 하위 단계, §4 P6-1·P6-2 체크리스트, §6 의존성 갱신, §8 미확정 갱신 |
| 1.4 | 2026-09-05 | P6-1 완료 반영(§4 체크) |
| 1.5 | 2026-09-05 | P6-2 완료 반영(§3 상태·§4 체크) |
| 1.6 | 2026-09-05 | P7 착수: 버그 3건 재현·LOG 등록 |
| 1.7 | 2026-09-05 | P7 완료 반영(fix 3건) |

> 기준 문서: [`./PRD.md`](./PRD.md) 1.2(요구사항·Acceptance), [`./TRD.md`](./TRD.md) 1.3(아키텍처·모듈 계약), [`./DESIGN.md`](./DESIGN.md) 1.2(화면·토큰). 변경 이력은 [`./LOG.md`](./LOG.md)에만 적고, 이 문서는 **현재 계획**만 서술한다. 단계가 끝날 때마다 §3 상태와 §4 체크리스트를 갱신하고 문서 버전을 0.1 올린다(M1에서 1.0에 도달했고, 이후 P5부터 1.1·1.2로 이어간다).

## 1. 원칙

### 1.1 작업 단위 — "문서 → 구현 → 검증 → LOG 완료 → 커밋"

[`CLAUDE.md`](../CLAUDE.md) 그라운드 룰 2를 단계(P-n)마다 그대로 적용한다. 코드를 먼저 쓰고 문서를 맞추는 일은 없다.

| 순서 | 할 일 | 산출물 |
|---|---|---|
| ① 문서 | 그 단계에서 확정할 설계(TRD 계약·DESIGN 화면·PRD FR)를 먼저 쓰고, LOG 맨 위에 `진행중` 항목을 추가한다 | `docs/*` 갱신 → **docs 커밋** |
| ② 구현 | 계약대로 코드를 쓴다. 계약과 다르게 만들고 싶으면 코드가 아니라 ①로 돌아가 문서를 먼저 고친다 | `src/**` |
| ③ 검증 | §1.3 정책에 해당할 때만 실행한다 | 명령과 결과 |
| ④ LOG | 항목을 `완료`로 바꾸고 실제 변경 파일·검증 결과로 정정한다. 통과 못 한 검증이 있으면 `진행중`을 유지한다 | `docs/LOG.md` |
| ⑤ 커밋 | ①~④가 끝난 뒤 **feat/fix 커밋** | git |

- 한 단계는 최소 2커밋이다: `docs(p-n)` 커밋 → `feat` 커밋. 설계가 코드보다 먼저 이력에 남아야 나중에 "왜 이렇게 만들었나"를 추적할 수 있다.
- 소규모 `fix`는 1커밋에 LOG `진행중→완료`를 함께 담되, 커밋 본문에 3단 사고(원인 가설 / 반증 / 종합)를 적는다.
- 커밋 메시지는 한국어 Conventional Commits(`feat`/`fix`/`docs`/`chore`/`refactor`/`test`/`style` + 선택 scope), 본문은 `-` 불릿으로 무엇/왜.
- 설계 선택·원인 진단·수치 판단은 그라운드 룰 1의 3단(1차 사고 / 비판적 재사고 / 종합)으로 문서·LOG·커밋 본문에 남긴다. 반증을 실측하지 못한 결론은 숨기지 않고 "미확정"으로 표기한다.

### 1.2 문서 갱신 규칙

- PRD/TRD/DESIGN/PLAN은 **현재 상태**만 적는다. "무엇이 바뀌었나"는 LOG가 맡는다.
- 코드 식별자(파일명·함수·상수)는 이미 있는 것 또는 그 단계에서 만들 것만 인용한다.
- 스펙·계약·동작이 바뀌면 관련 상위 문서의 서술을 같은 커밋에서 정정한다. 옛 서술과 새 동작이 공존하는 상태로 커밋하지 않는다.

### 1.3 검증 정책

CLAUDE.md 검증 정책을 이 프로젝트 명령으로 옮긴 것이다. **매 편집마다 돌리지 않고**, 아래 시점에만 실행한다.

| 검증 | 명령 | 실행 시점 | 비고 |
|---|---|---|---|
| 타입 게이트 | `npx tsc --noEmit` | P1부터 모든 feat/fix 커밋 직전 | strict, 0 에러 |
| 빌드 게이트 | `npx vite build` (또는 `npm run build` = tsc && vite build) | 위와 동일 | `dist/` 생성 |
| 단위 테스트 | `npm test`(= `npx vitest run`) | **P6부터 모든 feat/fix 커밋 직전** — 아래 트리거가 충족돼 P6에서 도입한다. 대상은 순수 모듈(`thread.ts`, `extractJson`, `drafts.ts`; TRD §9.2) | 0 실패. P5까지는 전 구간 "미실행"이었다 |
| UI 스모크 | `npm run dev` + 브라우저 자동화(Playwright) | 마일스톤(M1) 및 화면 흐름이 바뀌는 단계(P2·P3·P4·P5) | 온보딩 모달 표시 → 키 저장 → 탭 이동 → 생성 시트 열림. P5는 입력 모드 토글·썸네일 추가/제거·모드별 검증 토스트를 더한다 |
| 정적 서빙 | `npm run build && npm start` → PC·같은 Wi-Fi 휴대폰 접속 | P1, M1, P8 | A5·A6 |
| Gemini 실호출 | 실제 키로 페르소나 생성·분석 | 키가 있을 때 수동 | 키 부재 시 **미확정**으로 기록 |

**vitest를 M1 이후로 미룬 근거(3단 사고)**
- 1차 사고: 처음부터 단위 테스트를 두면 회귀를 가장 싸게 잡는다. P1부터 도입하자.
- 비판적 재사고: P1~P4에서 브라우저 없이 테스트 가능한 순수 모듈을 실제로 세면 `extractJson`, 프롬프트 빌더(`my_name`·`lang` 분기), `formatDate`/`getInitial`, `sortByCreatedDesc`, `analyzeMessage`의 결과 정규화다(TRD §9.2). 이 중 분기가 비자명한 것은 `extractJson`(4경로) 하나이고, 나머지는 문자열 템플릿이나 한 줄 유틸이라 `tsc`가 대부분의 회귀(시그니처 불일치·임포트 누락)를 잡는다. 나머지(IndexedDB, React 화면, Gemini 호출)는 shim이나 실키 없이는 테스트가 성립하지 않는다. 즉 vitest 설정 비용 대비 M1 전 이득은 `extractJson` 1개 파일 수준이다.
- 종합: M1까지는 `tsc` + `vite build` + UI 스모크로 게이트한다. 도입 트리거는 "`extractJson` 외에 분기가 비자명한 순수 모듈이 하나 더 생기는 단계"로 두고, 그때 `extractJson` 테스트도 함께 추가한다. 도입 전 단위 테스트 항목은 LOG에 "미실행"으로 적는다(§8).

**트리거 충족 — P6에서 도입한다.** P6의 `thread.ts`(TRD §3.11)가 정확히 그 조건에 해당한다. 카카오톡 `[이름] [시간] 내용`과 `이름: 내용` 두 형식, 콜론 앞 길이 제한, 라벨 없는 줄의 이어붙이기, `me`/`other`/`unknown` 분류, 타겟 검출의 1순위와 폴백까지 — `tsc`가 잡아 주지 않고 눈으로 훑어서 맞다고 말할 수도 없는 분기다. 같은 커밋에서 `extractJson` 테스트를 함께 넣고(트리거의 약속), P6-2에서 `drafts.ts` 테스트를 더한다. 프롬프트 빌더는 아직 넣지 않는다 — 긴 문자열 템플릿이라 문구를 다듬을 때마다 깨져 신호보다 잡음이 크다(TRD §9.2).

## 2. 목표 디렉터리 구조 (M1 시점)

M1(P4 완료) 시점의 파일 + P5의 `lib/image.ts` + **P6에서 만들 5개**(`lib/thread.ts`, `lib/drafts.ts`, 테스트 3개)다. 괄호는 생성 단계이며 `(P6-1)`·`(P6-2)`는 아직 없는 파일이라는 뜻이다. P7 이후 추가분은 §3의 해당 단계 산출물에만 적고 이 트리에는 넣지 않는다(확정 시 갱신).

```
(repo root)/
├── CLAUDE.md · LICENSE · .gitignore                 (P0, 있음)
├── README.md                                        (P1)
├── docs/  PRD.md · TRD.md · DESIGN.md · PLAN.md · LOG.md   (P0)
├── index.html                # Vite 엔트리, #root 하나          (P1)
├── package.json              # name persora(M1 직전 개명), version 1.0.0(M1), engines.node >= 20   (P1, vitest devDep + `npm test`는 P6-1)
├── tsconfig.json · vite.config.ts · tailwind.config.js · postcss.config.js   (P1)
├── public/                   # favicon · 앱 아이콘 · 로고 이미지   (P1)
├── server/
│   └── index.js              # Express 정적 미리보기: dist/ 서빙, LAN 접속(같은 Wi-Fi 휴대폰)   (P1)
└── src/
    ├── main.tsx              # CSS import + HashRouter + <App/> 마운트          (P1)
    ├── App.tsx               # 상단바 · 하단 탭 3개 · 라우트 · 온보딩 게이트 · 토스트 컨테이너   (P1, 게이트는 P2)
    ├── index.css             # Tailwind base + 공용 유틸                        (P1)
    ├── vite-env.d.ts                                                          (P1)
    ├── components/
    │   ├── LanguageToggle.tsx    # 한/EN 세그먼트 토글                          (P1)
    │   ├── Toast.tsx             # Zustand 토스트 큐 렌더(하단)                 (P1)
    │   ├── OnboardingModal.tsx   # 키 + 로컬 저장 동의 → 저장, 중앙 카드 모달   (P2)
    │   └── ApiKeyStatus.tsx      # 헤더 "● Gemini 준비됨", 클릭 시 변경/삭제   (P2)
    ├── routes/
    │   ├── PersonaPage.tsx       # 목록 · 생성 바텀 시트 · 상세 모달 · 삭제    (P1 빈 페이지 → P3)
    │   ├── AnalyzePage.tsx       # 페르소나 선택 · 받은 메시지 · 분석 · 후보 복사   (P1 빈 페이지 → P4)
    │   └── HistoryPage.tsx       # 기록 목록 · 펼치기 · 삭제                   (P1 빈 페이지 → P4)
    └── lib/
        ├── i18n.ts / useI18n.ts  # ko/en 사전, t(), 로케일(모듈 상태 + onLangChange 구독, localStorage 'pm_lang'), 훅   (P1)
        ├── store.ts              # Zustand: toasts · apiKey 미러 · selectedPersonaId (locale은 i18n.ts)   (P1, apiKey는 P2, selectedPersonaId는 P3)
        ├── config.ts             # TEXT_MODEL · TEXT_REQUEST_TIMEOUT_MS · API_KEY_COOKIE_NAME · DB_*   (P2, IMAGE_REQUEST_TIMEOUT_MS는 P5)
        ├── gemini.ts             # generate(prompt, images?) · extractJson(text) · 에러 변환   (P2, images 인자는 P5)
        ├── image.ts              # fileToInlineImage — File → InlineImage(base64, data URL 접두 제거)   (P5)
        ├── types.ts              # PersonaFields · PersonaRecord · PersonaSummary · CreatePersonaInput · CandidateReply · AnalysisRecord   (P3, Analysis 타입은 P4, InlineImage·images?는 P5, ReplyIntentKey·REPLY_INTENTS·AnalyzeReplyInput·선택 필드 가산은 P6)
        ├── prompts.ts            # PERSONA_FIELDS · buildPersonaPrompt · buildAnalyzePrompt   (P3 → P4, v2는 P6)
        ├── thread.ts             # parseThread · detectTarget — 최근 대화 스레드 파서(순수 함수)   (P6-1)
        ├── drafts.ts             # getThreadDraft · setThreadDraft · clearThreadDraft — localStorage `pm_thread_draft:<id>`   (P6-2)
        ├── thread.test.ts        # vitest — 파서 형식·화자 분류·타겟 검출   (P6-1)
        ├── gemini.test.ts        # vitest — extractJson 4경로   (P6-1)
        ├── drafts.test.ts        # vitest — localStorage 스텁으로 저장·복원·폴백   (P6-2)
        ├── db.ts                 # initDB · withStore (IndexedDB 'persona-mirror' v1)   (P3)
        ├── id.ts                 # uuid 생성 헬퍼                              (P3)
        ├── dom.ts                # formatDate · getInitial                     (P3)
        ├── persona.ts            # createPersona · listPersonaSummaries · getPersona · removePersona   (P3, updatePersona는 P6-2)
        ├── analysis.ts           # analyzeReply · listAnalyses · removeAnalysis   (P4 analyzeMessage → P6-1 analyzeReply, 래퍼 유지)
        └── repos/
            ├── settingsRepo.ts   # getApiKey · setApiKey · clearApiKey · hasApiKey — 쿠키 'pm_gemini_key'   (P2)
            ├── personaRepo.ts    # put · get · list · remove — store 'personas'   (P3)
            └── analysisRepo.ts   # put · list · remove — store 'analyses'        (P4)
```

- 서버 코드는 `server/index.js` 하나다. API 라우트·DB·세션이 없다는 것이 Client-First의 검증 조건(A3)이다.
- 시그니처의 단일 진실은 [`./TRD.md`](./TRD.md) §3이다. 이 트리는 "어디에 무엇이 놓이나"만 말한다.

## 3. 단계 계획

각 단계는 §1.1의 "docs 커밋 → feat 커밋" 2단으로 진행한다. 상태는 `진행중` / `대기` / `완료`.

| 단계 | 목표 | 산출물(파일) | 출구 조건 | 검증 방법 | 상태 |
|---|---|---|---|---|---|
| **P0** 초기화·문서 초안 | 코드 0줄에서 제품·기술·화면·계획을 먼저 고정 | `LICENSE`, `CLAUDE.md`, `.gitignore`, `docs/LOG.md`(완료), `docs/PRD.md`·`TRD.md`·`DESIGN.md`·`PLAN.md` 0.1 | 4문서가 서로 모순 없이 P1~P4 계약을 제공. Client-First 결정과 기각 대안이 3단 사고로 기록됨 | 비대상(문서만) | **완료** |
| **P1** 스캐폴드·앱 셸 | 빈 페이지라도 배포 가능한 골격 | `package.json`(persona-mirror 0.1.0, engines.node >= 20), Vite+React 18+TS strict+Tailwind 설정, `index.html`, `main.tsx`, `App.tsx`(상단바: 로고+앱명+언어 토글 / 하단 탭 3개), `index.css`, `i18n.ts`·`useI18n.ts`, `store.ts`, `Toast.tsx`, `LanguageToggle.tsx`, 라우트 3개 placeholder, `server/index.js` + `npm start`, `README.md` 초안 | `npm run dev`로 셸이 뜨고 탭 전환·언어 토글이 동작. `npm run build` 무에러, `npm start`로 dist 서빙 | `tsc --noEmit`, `vite build`, 브라우저 육안(PC) | **완료** |
| **P2** API 키 온보딩·Gemini 클라이언트 | 키 없으면 앱을 잠그고, 있으면 Gemini를 부를 준비 | `config.ts`, `repos/settingsRepo.ts`(쿠키 1년, SameSite=Lax), `gemini.ts`(generate/extractJson/에러 변환), `OnboardingModal.tsx`, `ApiKeyStatus.tsx`, `App.tsx` 온보딩 게이트, `store.ts` apiKey 상태 | 키 미등록 시 모달이 화면 점유(A1). 키+동의 저장 → 모달 닫힘 → 헤더 "● Gemini 준비됨". 새로고침 후 유지. 인디케이터로 변경/삭제, 삭제 시 모달 재등장 | `tsc`/`build`, UI 스모크(모달 → 저장 → 인디케이터 → 새로고침). **임의(무효) 키로 `generate` 1회 호출** → CORS 통과 여부·SDK 오류 객체 형태 확인(기대: 인증 오류가 SDK 오류로 도착; 결과를 LOG에, 미실행이면 미실행으로). **실키 실호출(품질·지연)은 키 부재 시 미확정** | **완료** |
| **P3** 페르소나 생성·목록·상세·삭제 | 대화 텍스트 → 상대/나 페르소나 JSON → IndexedDB | `types.ts`, `db.ts`, `repos/personaRepo.ts`, `persona.ts`, `prompts.ts`(PERSONA_FIELDS, buildPersonaPrompt), `id.ts`, `dom.ts`, `store.ts`(`selectedPersonaId` 추가), `PersonaPage.tsx`(목록·생성 바텀 시트·상세 모달) | **키 불필요(필수)**: 생성 시트 열림·닫힘, 빈 이름·키 없음·짧은 대화(trim < 20)가 순서대로 토스트로 거부됨, 빈 목록 상태, `tsc`/`build` 통과. **키 필요(미확정 허용)**: 생성 → 목록 카드 → 상세(나/상대 탭, PERSONA_FIELDS 11항목) → 삭제, 재방문 시 목록 유지(A4) — 실키가 없으면 "미확정"으로 LOG에 기재하고 단계를 닫는다 | `tsc`/`build`, UI 스모크(시트 열림·닫힘, 빈 목록 상태, 유효성 토스트). **생성 품질·지연은 키 필요, 미확정** | **완료** |
| **P4** 메시지 분석 v1·기록 → **M1** | 페르소나 선택 + 받은 메시지 1건 → 심리 분석 + 답변 후보 3개, 기록 저장 | `analysis.ts`, `repos/analysisRepo.ts`, `prompts.ts`(buildAnalyzePrompt), `types.ts`(CandidateReply·AnalysisRecord), `AnalyzePage.tsx`(페르소나 칩 + textarea + 결과·후보 복사), `HistoryPage.tsx`(목록·펼치기·삭제) | **키 불필요(필수)**: `buildAnalyzePrompt`가 3축 정식 라벨("깊은 공감·수용형" / "공감 + 함께 해결형" / "공감 + 분위기 전환형", PRD FR-13)·말투 보존 지시·JSON-only 지시를 포함(코드 리뷰), `analyzeMessage`가 `{ raw }` 폴백 시 후보 1개로 정규화(코드 리뷰), AnalyzePage 검증 토스트 3종·복사 토스트 동작, 기록 탭 빈 상태·펼치기 UI(UI 스모크). **키 필요(미확정 허용)**: 실제 분석 → 기록 저장·펼치기·삭제, 라벨·말투 준수율 관찰. **M1 출구(§5)**: 문서 1.0, 표시명 확정, package 1.0.0 | `tsc`/`build`, UI 스모크(전 탭), DevTools Network(A3), 실키 실호출 3회. LAN 휴대폰 실기기 접속(A6)은 **미실행** — 자동화 뷰포트 390/360px만 확인. **분석 품질·라벨·말투 준수율은 표본 1회라 미확정** | **완료** |
| **P5** 캡처 이미지로 페르소나 생성(멀티모달) | 대화 캡처 이미지 n장으로도 페르소나 생성. 텍스트 붙여넣기는 기본 모드로 남기고 이미지를 **선택 모드로 가산**(PRD §8 부속 결정 3 / TRD ADR-6) | `lib/image.ts`(`fileToInlineImage`), `types.ts`(`InlineImage`, `CreatePersonaInput.images?`), `config.ts`(`IMAGE_REQUEST_TIMEOUT_MS = 180_000`), `gemini.ts`(`generate(prompt, images?)` — 멀티모달 `contents` + 이미지 타임아웃, 모델은 그대로 하나), `prompts.ts`(`buildPersonaPrompt` 이미지 분기), `persona.ts`(`generate(prompt, input.images)`), `routes/PersonaPage.tsx`(입력 모드 세그먼트·드롭존·썸네일 그리드), `lib/i18n.ts`(`persona.create.tab*`·`image*`·`imagePlaceholder`, `toast.addImage`·`toast.imageLoadFail`) | 캡처만으로 페르소나 생성 가능. **텍스트 경로 회귀 없음**(`images` 미전달 시 M1과 동일한 요청). 이미지 모드로 만든 레코드의 `conversation`이 캡처 장수 플레이스홀더 | `tsc`/`build`, UI 스모크(토글·드롭존·썸네일 추가/제거·검증 토스트), 실제 카카오톡 캡처 1장으로 생성해 **지연 실측**·필드 채움 확인. **텍스트 대비 정확도는 정성 관찰(미확정)** | **완료** |
| **P6** 분석 단계 재설계 | 분석 입력을 "받은 메시지 1건"에서 **페르소나 + 최근 대화 스레드 + 답장 의도**로 바꿔 제품 의도의 세 레이어를 모두 계약에 담는다([PRD §8 부속 결정 4](./PRD.md) / TRD ADR-7) | 아래 P6-1·P6-2 | 스레드를 붙여넣으면 답장 대상이 화면에 보이고 틀리면 고칠 수 있다. 의도를 지정하면 후보 방향이 그 목표를 따른다. **의도를 비우면 v1과 같은 공감 3축이 나온다(무회귀)**. 기존 기록·페르소나가 그대로 읽힌다(`DB_VERSION` 1 유지) | `npm test`, `tsc`/`build`, UI 스모크, 실키 의도 스티어링 비교 | **완료** |
| ┗ **P6-1** 스레드·타겟·의도 + vitest | v2의 뼈대. 파서·프롬프트·유스케이스·화면을 한 번에 갈아 끼운다 | `lib/thread.ts`(신규), `lib/types.ts`(`AnalysisRecord.thread?`/`target_message?`/`intent?`, `ReplyIntentKey`, `REPLY_INTENTS`, `AnalyzeReplyInput`), `lib/prompts.ts`(`buildAnalyzePrompt` v2 + `intentDirective`), `lib/analysis.ts`(`analyzeReply` + `analyzeMessage` 래퍼), `routes/AnalyzePage.tsx`(스레드 textarea·타겟 칩·의도 칩), `lib/i18n.ts`(`analyze.thread*`·`analyze.target`·`analyze.intentLabel`·`intent.*`), `package.json`(vitest + `npm test`), `lib/thread.test.ts`, `lib/gemini.test.ts` | 스레드 입력으로 분석이 끝까지 동작하고 타겟 칩이 상대의 마지막 발화를 가리킨다. 의도 빈 값에서 v1과 같은 3축 라벨 | `npm test` 0 실패, `tsc`/`build`, UI 스모크, 실키 1회 이상 | **완료** |
| ┗ **P6-2** 드래프트·타겟 교정·페르소나 업데이트 | v2를 실제로 반복해 쓸 수 있게 만드는 보완 | `lib/drafts.ts`(신규) + `lib/drafts.test.ts`, `routes/AnalyzePage.tsx`(드래프트 복원·자동 저장, 타겟 피커), `lib/analysis.ts`(`targetOverride` 반영), `lib/persona.ts`(`updatePersona`), `lib/types.ts`(`PersonaRecord.updated_at?`), `routes/PersonaPage.tsx`(상세 모달 "추가 대화로 업데이트"), `lib/i18n.ts`(`analyze.pickTarget`, `persona.detail.update*`, `toast.persona*`) | 페르소나를 바꿔도 붙여넣던 대화가 남아 있고, 자동 타겟이 틀리면 목록에서 고를 수 있고, 상세에서 대화를 더해 페르소나를 갱신할 수 있다 | `npm test` 0 실패, `tsc`/`build`, UI 스모크 | **완료** |
| **P7** 안정화 | 실사용(PC·LAN 휴대폰)에서 드러난 버그 수정 | 재현된 버그별 `fix` 커밋(파일은 버그마다), 필요 시 `*.test.ts` | 알려진 재현 버그 0. 각 fix에 원인 가설·반증·종합이 LOG와 커밋 본문에 있음 | `npm test`, `tsc`/`build`, 버그별 재현 스모크 | **완료** |
| **P8** 보안 점검·GitHub Pages 배포 | 정적 호스팅에 올리고 키·XSS 완화책을 점검 | 보안 점검 결과(키 취급·XSS 완화·CSP meta·referrer 정책·의존성)(문서), `vite.config.ts` base(하위 경로 필요 시), `.github/workflows/*.yml`(build → Pages), `README.md` 배포·키 제한 안내 | Pages URL에서 A1~A4 재확인. 우리 호스트로 가는 요청은 정적 자산만(A3) | `npm run build`, 배포 후 브라우저 확인(DevTools Network·Application) | 대기 |

**단계 번호 재편.** 1.2까지 P6은 안정화, P7은 보안·배포였다. 분석 재설계를 그 앞에 넣으면서 두 단계를 P7·P8로 한 칸씩 밀었다. 순서를 이렇게 둔 이유는 §6에 적는다. 다른 문서(PRD §10·§11, TRD §10, DESIGN §12)의 단계 참조도 같은 규칙으로 옮겼다.

**P6을 둘로 나눈 이유.** 한 커밋에 다 넣으면 실패했을 때 원인이 파서인지, 프롬프트인지, 드래프트인지 가려내기 어렵다. P6-1은 "입력 계약을 바꾸는" 최소 묶음이고 그것만으로 분석이 끝까지 동작한다. P6-2는 그 위에 얹는 편의 기능이라, 문제가 생기면 P6-2만 되돌려도 v2가 남는다.

## 4. 단계별 체크리스트

### P0 — 초기화·문서 초안
- [x] `LICENSE`(MIT), `CLAUDE.md`(3단 사고·문서 우선 워크플로), `.gitignore`, `docs/LOG.md`(규칙 + P0 진행중) — `chore: 프로젝트 시작`
- [x] `docs/PRD.md` 0.1 — 제품 정의, Goals/Non-Goals, FR, DR/NFR, Acceptance A1~A6, Client-First 결정(3단 사고)
- [x] `docs/TRD.md` 0.1 — 아키텍처, 스택, §3 모듈 계약(P0 시점 시그니처), Gemini 호출 상세, 저장 설계
- [x] `docs/DESIGN.md` 0.1 — 셸·탭·온보딩 모달·바텀 시트·상세 모달·토스트, Tailwind 토큰
- [x] `docs/PLAN.md` 0.1 — 이 문서
- [x] LOG: P0 `완료`, P1 `진행중` 추가 → `docs: PRD/TRD/DESIGN/PLAN 0.1 초안` 커밋

### P1 — 스캐폴드·앱 셸
- [x] docs: TRD 스택·빌드 절, DESIGN 셸 확정, LOG `진행중`
- [x] `package.json`(name `persona-mirror`, version 0.1.0, `engines.node >= 20`, scripts `dev`/`build`/`preview`/`start`)
- [x] `tsconfig.json`(strict), `vite.config.ts`(`@` → `src`, dev host 0.0.0.0), `tailwind.config.js`(brand-gradient · brand-gradient-subtle · avatar-gradient · soft/glow shadow · slide-up/fade-in · Pretendard 스택), `postcss.config.js`
- [x] `index.html`(`#root`, 앱 아이콘·theme-color), `public/` 아이콘·로고
- [x] `src/main.tsx`(HashRouter), `src/App.tsx`(상단바 + 하단 탭 3개 + `<Routes>`), `src/index.css`
- [x] `lib/i18n.ts`(ko/en 사전, `t()`, 로케일 모듈 상태 + `onLangChange` 구독, localStorage `pm_lang`), `lib/useI18n.ts`, `lib/store.ts`(toasts; apiKey·selectedPersonaId는 P2/P3에서 추가), `components/Toast.tsx`, `components/LanguageToggle.tsx`
- [x] `routes/PersonaPage.tsx`·`AnalyzePage.tsx`·`HistoryPage.tsx` — 제목만 있는 placeholder
- [x] `server/index.js`(Express, `dist/` 정적 서빙, SPA fallback, `PORT` 기본 8000, host 0.0.0.0) + `npm start`
- [x] `README.md` 초안(실행 방법·접속 방법)
- [x] 검증: `npx tsc --noEmit` 0 에러, `npx vite build` 성공, `npm start` 후 PC 접속
- [x] LOG `완료` → `feat: 앱 스캐폴드와 셸` 커밋

### P2 — API 키 온보딩·Gemini 클라이언트
- [x] docs: TRD §3 계약(`config.ts` / `settingsRepo.ts` / `gemini.ts` / `OnboardingModal` / `ApiKeyStatus`), DESIGN 온보딩 모달·헤더 인디케이터, LOG `진행중` → `docs(p2)` 커밋
- [x] `lib/config.ts` — `TEXT_MODEL='gemini-3.1-flash-lite'`, `TEXT_REQUEST_TIMEOUT_MS=60_000`, `API_KEY_COOKIE_NAME='pm_gemini_key'`, `DB_NAME='persona-mirror'`, `DB_VERSION=1`, `STORE_PERSONAS`, `STORE_ANALYSES`, 키 발급 안내 URL
- [x] `lib/repos/settingsRepo.ts` — `document.cookie` 기반 `getApiKey/setApiKey/clearApiKey/hasApiKey`(만료 1년, `SameSite=Lax`)
- [x] `lib/gemini.ts` — `generate(prompt)`: `@google/genai` `generateContent`, `thinkingConfig.thinkingBudget=0`, `httpOptions.timeout=TEXT_REQUEST_TIMEOUT_MS`; 인증 오류 → 키 재입력 유도 메시지, 네트워크/타임아웃/429/5xx → 사용자 문구. `extractJson(text)`: 펜스 제거 → 첫 균형 `{…}` → 전체 파싱 → `{ raw }` 폴백. 키·프롬프트 콘솔 미출력
- [x] `components/OnboardingModal.tsx` — 로고 · 안내 · 키 입력 · 발급 링크 · 로컬 저장 동의 체크 · 시작하기. 비어 있거나 미동의면 토스트
- [x] `components/ApiKeyStatus.tsx` — 키 있을 때만 렌더, 클릭 시 인라인 변경/삭제
- [x] `App.tsx` 온보딩 게이트(키 없으면 모달이 화면 점유), `store.ts` apiKey 상태
- [x] 검증: `tsc`/`build`, UI 스모크(모달 표시 → 저장 → 인디케이터 → 새로고침 유지 → 삭제 → 모달 재등장). 임의(무효) 키로 `generate` 1회 호출 → CORS 통과 여부·오류 객체 형태를 LOG에 기록(미실행이면 미실행으로). 실키 실호출: 키 있으면 수동, 없으면 "미확정" 기록
- [x] LOG `완료` → `feat: Gemini API 키 온보딩(쿠키)과 클라이언트` 커밋

### P3 — 페르소나 생성·목록·상세·삭제
- [x] docs: TRD 타입 계약(`PersonaFields`/`PersonaRecord`/`PersonaSummary`/`CreatePersonaInput`), `db.ts`/`personaRepo.ts`/`persona.ts`/`prompts.ts` 계약, DESIGN 페르소나 화면·생성 바텀 시트·상세 모달, LOG `진행중` → `docs(p3)` 커밋
- [x] `lib/types.ts`, `lib/db.ts`(`initDB` — `onupgradeneeded`에서 `personas`/`analyses` store + `created_at` 인덱스, `withStore`), `lib/repos/personaRepo.ts`(`put/get/list/remove`, list는 `created_at` 내림차순)
- [x] `lib/prompts.ts` — `PERSONA_FIELDS`(summary, communication_style, speech_level, vocabulary_examples[], sentence_style, emoji_symbol_usage, texting_habits, emotional_tendencies, what_they_value, how_they_seek_response, relationship_dynamics), `buildPersonaPrompt(input, lang)`(JSON-only 지시, 나의 이름이 있으면 나/상대 분리)
- [x] `lib/persona.ts` — `createPersona`(프롬프트 → `generate` → `extractJson` → 상대/나 분리 정규화 → `personaRepo.put`), `listPersonaSummaries`, `getPersona`, `removePersona`
- [x] `lib/id.ts`(uuid), `lib/dom.ts`(`formatDate`, `getInitial`), `lib/store.ts`에 `selectedPersonaId`/`setSelectedPersonaId` 추가(TRD §3.9)
- [x] `routes/PersonaPage.tsx` — 목록 카드(아바타 이니셜·이름·날짜·요약) · 빈 상태 CTA · 생성 바텀 시트(slide-up; 제출 전 검증: 이름 공백 → 키 없음 → 대화 trim < 20, 순서대로 토스트 — TRD §3.7, DESIGN §5.2) · 상세 모달(나/상대 탭, "이 페르소나로 분석" → `setSelectedPersonaId` + `#/analyze`) · 삭제 확인
- [x] 검증: `tsc`/`build`, UI 스모크(시트 열림·닫힘, 유효성 토스트, 빈 목록). 생성 실호출은 키 있을 때 수동
- [x] LOG `완료` → `feat: 페르소나 생성·목록·상세·삭제` 커밋

### P4 — 메시지 분석 v1·기록 → M1
- [x] docs: TRD 계약(`analyzeMessage(personaId, message)`, `AnalysisRecord{id, persona_id, persona_name, message, analysis, candidates, created_at}`, `CandidateReply{label, reason, response}`, `buildAnalyzePrompt({persona, message}, lang)`), DESIGN 분석·기록 화면, LOG `진행중` → `docs(p4)` 커밋
- [x] `lib/repos/analysisRepo.ts`(`put/list/remove`), `lib/analysis.ts`(`analyzeMessage` — 페르소나 조회 → 프롬프트 → `generate` → `extractJson` → 후보 3개 정규화 → 저장, `listAnalyses`, `removeAnalysis`)
- [x] `lib/prompts.ts` `buildAnalyzePrompt` — 출력 `{ analysis, candidates[3] }`, 후보 축 정식 라벨 "깊은 공감·수용형" / "공감 + 함께 해결형" / "공감 + 분위기 전환형"(PRD FR-13), 나의 페르소나가 있으면 그 말투로
- [x] `routes/AnalyzePage.tsx` — 페르소나 칩 선택 · 받은 메시지 textarea · 분석 버튼(로딩) · 심리 분석 카드 · 후보 3카드(라벨·이유·답변·복사)
- [x] `routes/HistoryPage.tsx` — 기록 목록(페르소나명·날짜·메시지 요약) · 펼치기(분석·후보) · 삭제
- [x] 검증: `tsc`/`build`, UI 스모크(전 탭 이동·칩 선택·빈 입력 토스트·실키 분석·기록 펼치기·삭제), DevTools Network(A3)
- [ ] 검증(남음): `npm start` 후 같은 Wi-Fi 휴대폰 실기기 접속(A6) — **미실행**. 자동화 뷰포트 390/360px 확인은 이를 대신하지 못한다. P7로 넘긴다
- [x] LOG `완료` → `feat: 메시지 분석 v1과 기록` 커밋
- [x] **M1 마무리**(§5): 표시명 Persora 확정 → i18n `app.title`·`onboarding.welcomeTitle`·`index.html` title·`server/index.js`·README·`package.json` name 반영 (`refactor: 앱 표시명 Persora로 통일` 커밋)
- [x] **M1 마무리**(§5): `package.json`·`package-lock.json` 1.0.0, PRD/TRD/DESIGN/PLAN 1.0, README를 M1 기준으로 재작성, LOG에 M1 항목(검증 기록·남은 미확정) 추가

### P5 — 캡처 이미지로 페르소나 생성(멀티모달)
- [x] docs: PRD 1.1(FR-7 두 모드·FR-9 플레이스홀더 저장·DR-4 캡처 전송 고지·NFR-3 이미지 타임아웃·§8 부속 결정 3), TRD 1.1(§3.1 `InlineImage`·`images?`, §3.2 `IMAGE_REQUEST_TIMEOUT_MS`, §3.4 `generate(prompt, images?)`, §3.4.1 `image.ts`, §3.5 프롬프트 분기, §3.7 플레이스홀더, §3.10, §4 멀티모달 `contents`·타임아웃 표, ADR-6, §10 #4 종결), DESIGN 1.1(§5.2 세그먼트·드롭존·썸네일·검증 순서, §10.1 신규 키, §12 U18~U20), PLAN 1.1, LOG `진행중` → `docs(p5)` 커밋
- [x] `lib/image.ts` — `fileToInlineImage(file)`: `FileReader.readAsDataURL` → 첫 쉼표 뒤만 `data`로, `mimeType`은 `file.type`(없으면 `'image/png'`), 읽기 실패는 reject(TRD §3.4.1)
- [x] `lib/types.ts` — `InlineImage { mimeType, data }` 추가, `CreatePersonaInput.images?: InlineImage[]` **선택 필드로 가산**(기존 호출부 무영향) / `lib/config.ts` — `IMAGE_REQUEST_TIMEOUT_MS = 180_000`
- [x] `lib/gemini.ts` — `generate(prompt, images?)`: 이미지가 있으면 `contents = [{ role:'user', parts:[{text}, ...{inlineData:{mimeType,data}}] }]` + 타임아웃 180초, 없으면 M1과 동일(문자열 `contents` + 60초). **모델은 분기하지 않는다**(TRD §4)
- [x] `lib/prompts.ts` — `buildPersonaPrompt`가 `input.images` 유무로 입력 소스 블록만 분기: 이미지면 "첨부 캡처에서 대화를 직접 읽어라 + 말풍선 좌/우·이름표로 화자 구분 + 여러 장은 위→아래·앞→뒤 순서" 지시. 나머지 블록·출력 JSON 계약은 두 모드 동일(TRD §3.5)
- [x] `lib/persona.ts` — `createPersona`가 `generate(prompt, input.images)` 호출. `conversation`은 화면이 넘긴 값을 그대로 저장(플레이스홀더 규칙은 화면 책임, TRD §3.7)
- [x] `routes/PersonaPage.tsx` — 입력 모드 세그먼트(기본 텍스트, 두 모드 입력값 각각 보존)·드롭존(`<label>` + hidden `input[type=file][accept=image/*][multiple]`)·썸네일 그리드(64×64, 개별 제거)·이미지 모드 검증(이름 → 키 → 0장 `toast.addImage`)·성공 시 모드까지 초기화. 이미지 모드 제출 시 `conversation`에 `persona.create.imagePlaceholder {n}` (DESIGN §5.2)
- [x] `lib/i18n.ts` — ko/en에 `persona.create.tabText`·`tabImage`·`imageDropzone`·`imageHint`·`imagePlaceholder`, `toast.addImage`·`toast.imageLoadFail`. `imageHint`에 캡처가 Google로 전송된다는 한 줄 포함(PRD DR-4)
- [x] 검증: `npx tsc --noEmit` 0 에러, `npx vite build` 성공. UI 스모크(모드 토글, 캡처 첨부→썸네일, 개별 제거, 0장 제출 거부, 텍스트 모드 20자 거부가 그대로인지 = 회귀 확인). **실키 1회**: 실제 카카오톡 캡처 1장으로 생성 → 지연 실측(Resource Timing)·11필드 채움 여부 확인, 텍스트 대비 정확도는 정성 관찰로 "미확정" 기재
- [x] LOG `완료` → `feat: 캡처 이미지로 페르소나 생성(멀티모달)` 커밋

### P6-1 — 스레드·타겟·의도 + vitest 도입
- [x] docs: PRD 1.2(§1·§2.3 3레이어, N6·N7, FR-12·FR-13 개정 + FR-28~FR-33, DR-1·DR-6, §8 부속 결정 4, §10 로드맵 재편, §11), TRD 1.3(§3.1 타입 가산, §3.5 프롬프트 v2, §3.7 `updatePersona`, §3.8 `analyzeReply`, §3.10, 신규 §3.11·§3.12, ADR-7, §9.2 vitest 확정, §9.6, §10), DESIGN 1.2(§5.3 업데이트 블록, §6 v2 재작성, §7·§9 정정, §10.1 신규 키, §12 U21~U24), PLAN 1.3, LOG `진행중` → `docs(p6)` 커밋
- [x] `lib/thread.ts` — `parseThread(thread, { name, myName })`(카카오톡 `[이름] [시간] 내용` → `이름: 내용` 폴백 → 라벨 없는 줄 이어붙이기, 화자 `me`/`other`/`unknown`), `detectTarget(parsed)`(마지막 상대 발화 → 마지막 비어 있지 않은 줄 폴백). 순수 함수(TRD §3.11)
- [x] `lib/types.ts` — `AnalysisRecord`에 `thread?`·`target_message?`·`intent?` **선택 필드 가산**, `ReplyIntentKey`(6종), `REPLY_INTENTS`(키 + `intent.*` 라벨 키), `AnalyzeReplyInput`. `DB_VERSION`은 1 그대로
- [x] `lib/prompts.ts` — `buildAnalyzePrompt({ persona, thread, targetMessage, intent }, lang)`: 최근 대화 흐름 블록(원문 그대로) + 답장 대상 명시 + `intentDirective`(프리셋 6종 매핑 / 자유 텍스트 그대로 / 빈 값이면 `null`). **빈 값이면 v1의 공감 3축·정식 라벨을 그대로 유지**. 출력 JSON 계약은 두 경로 동일(TRD §3.5)
- [x] `lib/analysis.ts` — `analyzeReply(personaId, { thread, intent, targetOverride? })`: 파싱 → 타겟 결정(override 우선) → 프롬프트 → `generate` → `extractJson` → 폴백·정규화 → 저장. **`message`에 타겟 메시지를 넣어 구 스키마 호환**. `analyzeMessage`는 `analyzeReply` 한 줄 래퍼로 유지(TRD §3.8)
- [x] `routes/AnalyzePage.tsx` — 스레드 textarea(rows=7, 카카오톡식 placeholder), 타겟 칩("이 메시지에 답장" + 60자 컷), 의도 칩(기본 + 프리셋 6 + 직접 입력), 실행 줄을 카드 밖으로. 검증 순서는 ① 페르소나 ② 스레드 공백 ③ 키(DESIGN §6.2)
- [x] `lib/i18n.ts` — ko/en에 `analyze.threadLabel`·`threadHint`·`threadPlaceholder`·`target`·`targetEmpty`·`intentLabel`, `intent.none`~`intent.persuade`·`intent.custom`·`intent.customPlaceholder`. 미사용이 된 `analyze.messagePlaceholder` 정리
- [x] `package.json` — `vitest` devDependency + `"test": "vitest run"`
- [x] `lib/thread.test.ts`(파서 형식·화자 분류·멀티라인·타겟 검출 1순위/폴백), `lib/gemini.test.ts`(`extractJson` 4경로)
- [x] 검증: `npm test` 0 실패, `npx tsc --noEmit` 0 에러, `npx vite build` 성공, UI 스모크(스레드 → 타겟 칩 → 의도 칩), **실키**: 같은 스레드로 의도 빈 값 / `decline` 두 번 돌려 후보 방향 비교(TRD §9.6·§10 #20)
- [x] LOG `완료` → `feat: 최근 대화 스레드·답장 의도 기반 분석` 커밋

### P6-2 — 드래프트·타겟 수동 교정·페르소나 추가 대화 업데이트
- [x] docs: 위 P6-1 docs 커밋에 함께 확정(TRD §3.7 `updatePersona`·§3.12 `drafts.ts`, DESIGN §5.3·§6.1 피커·§6.3 드래프트)
- [x] `lib/drafts.ts` — `getThreadDraft`/`setThreadDraft`/`clearThreadDraft`, 키 `pm_thread_draft:<personaId>`, 공백이면 키 삭제, 저장소 접근 실패 시 **throw 없이 폴백**(TRD §3.12)
- [x] `lib/drafts.test.ts` — `localStorage` 스텁으로 저장·복원·페르소나별 분리·공백 삭제·예외 폴백
- [x] `routes/AnalyzePage.tsx` — 페르소나 전환 시 드래프트 복원 + 수동 타겟·피커 초기화, textarea 변경마다 저장, 타겟 피커(파싱 라인 목록, 화자 라벨 + 50자 컷, 현재 타겟 강조)
- [x] `lib/analysis.ts` — `targetOverride`가 자동 검출을 이기도록 반영(P6-1에서 시그니처는 이미 있음)
- [x] `lib/persona.ts` — `updatePersona(id, { conversation })`: 기존 + 신규 대화를 이어 붙여 전체 재분석, `id`·`created_at` 유지, `updated_at` 기록 / `lib/types.ts` — `PersonaRecord.updated_at?`
- [x] `routes/PersonaPage.tsx` — 상세 모달에 "추가 대화로 업데이트" 카드(textarea rows=3 + 전체폭 버튼), 검증 순서 ① 키 ② 대화 공백, 성공 시 모달 유지·내용 갱신(DESIGN §5.3)
- [x] `lib/i18n.ts` — `analyze.pickTarget`, `persona.detail.updateTitle`·`updatePlaceholder`·`updateCta`·`updateLoading`, `toast.enterConversation`·`toast.personaUpdated`·`toast.personaUpdateFail`
- [x] 검증: `npm test` 0 실패, `tsc`/`build`, UI 스모크(드래프트 복원, 타겟 피커 선택, 페르소나 업데이트 실키 1회)
- [x] LOG `완료` → `feat: 스레드 드래프트·타겟 수동 교정·페르소나 추가 대화 업데이트` 커밋

### P7 — 안정화
- [x] PC·LAN 휴대폰에서 전 흐름 실사용, 버그를 LOG `진행중`으로 먼저 등록 — 3건 재현·등록: P7-1 드래그-닫힘, P7-2 LAN randomUUID, P7-3 오버레이 20px(재현 수치는 LOG)
- [x] 버그마다: 원인 가설 → 반증(가능하면 재현·실측) → 종합 → `fix` 커밋(본문에 3단 사고)
- [x] 순수 모듈이 바뀌면 해당 `*.test.ts`도 함께 갱신(vitest는 P6에서 도입 완료)
- [x] 검증: `npm test`, `tsc`/`build`, 버그별 재현 스모크

### P8 — 보안 점검·GitHub Pages 배포
- [ ] docs: 키 취급·XSS 완화(React 텍스트 렌더링, CSP meta, referrer 정책)·의존성 점검 결과를 TRD 보안 절에 기록, PRD DR 정정, LOG `진행중`
- [ ] `index.html` CSP·referrer meta, `vite.config.ts` base(프로젝트 사이트면 하위 경로), `.github/workflows/*.yml`(push → `npm ci` → `npm run build` → Pages)
- [ ] `README.md` 배포 URL·키 제한(Gemini API만 허용; referrer 제한은 효과가 제한적임을 함께 적음) 안내
- [ ] 검증: 배포 URL에서 A1~A4 재확인, DevTools Network에 우리 호스트 요청은 정적 자산만
- [ ] LOG `완료` → 커밋

## 5. 마일스톤 M1 (= P4 완료, MVP)

M1은 "키를 등록한 사용자가 페르소나를 만들고, 받은 메시지 1건으로 답변 후보 3개를 받고, 기록을 다시 볼 수 있다"는 상태다. **달성했다.** 출구 조건은 **키 불필요 묶음(실측 통과 필수)** 과 **키 필요 묶음(UI 스모크 통과 + 실호출은 미확정 허용)** 으로 나눠 두었는데, 유효 키가 확보되어 키 필요 묶음도 실호출로 확인했다. 대신 계획에서 "키 불필요"로 분류했던 A6가 미실행으로 남았다 — 실기기 접속은 키가 아니라 기기가 필요한 항목이었고, 그 점을 M1에서야 분리해 인식했다.

### 5.1 M1 결과

근거는 모두 [`./LOG.md`](./LOG.md)의 해당 항목이며, 여기 없는 수치는 쓰지 않는다.

| Acceptance ([`./PRD.md`](./PRD.md)) | 묶음 | 구현 단계 | M1 상태 | 근거 LOG 항목 |
|---|---|---|---|---|
| A1 키 미등록 신규 방문자는 온보딩 모달을 본다 | 키 불필요 | P2 | **통과** — 모달이 화면 점유, 키 삭제 시 재등장 | P2 Gemini API 키 온보딩(쿠키)과 클라이언트 |
| A2 키 등록 후 페르소나 생성·메시지 분석·기록 조회가 동작한다 | 키 필요 | P3·P4 | **통과(실키)** — 생성 6.57s·5.87s, 분석 3.49s, 후보 3개가 3축 정식 라벨·나의 말투로 렌더, 기록 펼치기·삭제 확인 | P3 페르소나 생성·목록·상세·삭제 / P4 메시지 분석 v1과 기록 |
| A3 우리 서버로의 요청은 정적 자산뿐, LLM은 `generativelanguage.googleapis.com` 직접 | 키 불필요 | P1·P2 | **통과** — 스모크 중 우리 서버로 간 것은 정적 자산 요청뿐. Google 도메인 직접 호출이 CORS를 통과함을 P2에서 실측 | P2 / P3 / P4 |
| A4 새로고침·재방문 시 IndexedDB 데이터와 키가 유지된다 | 키 유지 = 키 불필요 / 생성 데이터 유지 = 키 필요 | P2·P3·P4 | **통과** — 키 인디케이터·페르소나 목록·분석 기록이 각각 전체 새로고침 후 유지 | P2 / P3 / P4 |
| A5 `npm run build` 무에러, `npm start`로 정적 서버가 앱을 서빙한다 | 키 불필요 | P1 | **통과** — `tsc --noEmit` 0 에러, `vite build` 성공, Express가 `GET /`·`GET /app-logo.png`에 200 | P1 앱 스캐폴드와 셸 / 표시명 통일 |
| A6 같은 Wi-Fi의 휴대폰에서 동일하게 동작한다 | 키 불필요(UI 범위) | P1·P4 | **미확정** — 자동화 뷰포트 390/360px만 확인, 실기기 접속 미실행 | P4 M1 판단 자료 |

M1은 A1~A5 통과로 인정하고, A6는 미확정 상태로 P7에 넘긴다. CLAUDE.md 검증 정책상 통과하지 못한 항목을 통과로 적을 수 없으므로 A6를 "완료"로 표시하지 않는다.

### 5.2 M1에서 함께 끝낸 것
- **표시명 확정** — 코드네임 "Persona Mirror" → **Persora**(근거·3단 사고는 LOG). i18n `app.title`·`onboarding.welcomeTitle`, `index.html` title, `server/index.js` 시작 로그, README, `package.json` name에 반영. `DB_NAME`·쿠키명은 호환을 위해 유지.
- **문서 1.0** — PRD/TRD/DESIGN/PLAN을 실제 구현 상태로 정정해 1.0으로 올렸다. TRD §3 계약과 DESIGN 화면 서술은 코드와 대조해 어긋난 부분을 코드 기준으로 고쳤다.
- **`package.json`·`package-lock.json` 1.0.0**, README를 M1 기준으로 재작성.
- LOG에 M1 항목을 추가하고, 남은 미확정을 항목별로 명시했다.

### 5.3 M1에 남은 미확정
- **A6 실기기 확인** — 같은 Wi-Fi 휴대폰 접속 미실행. 소프트 키보드 겹침(DESIGN U4)·safe-area 패딩(U5)·비보안 컨텍스트 클립보드(U7)가 함께 걸려 있다.
- **모델 선택 근거** — `gemini-3.1-flash-lite`를 비-lite flash와 비교한 적이 없다. thinking off의 지연 단축 효과도 off 상태만 재서 미실측이다.
- **품질 표본** — 실키 호출이 4회뿐이라 JSON 준수율·말투 준수율을 수치로 말할 수 없다.
- **대화 최소 길이 20자**(PRD FR-7) — 임시값이고 근거 실측이 없다. 조정 여부는 P7.
- **복사 성공 토스트** — 자동화 브라우저의 클립보드 권한 대기로 문구를 확인하지 못했다.
- **첫 로드 JS 529.88 kB(gzip 131.68 kB)** — 코드 스플리팅 도입 여부는 P8 배포 전에 판단한다.
- **상세 모달 백드롭 상단 미커버**(약 20px) — P3 스크린샷 관찰, 원인 미조사. P7 안정화에서 진단한다.

## 6. 의존성·순서 근거

```
P0 문서 ─▶ P1 셸 ─▶ P2 온보딩·Gemini ─▶ P3 페르소나 ─▶ P4 분석·기록 ═▶ M1 ─▶ P5 이미지 ─▶ P6 분석 재설계 ─▶ P7 안정화 ─▶ P8 보안·배포
                                                                                        (P6-1 스레드·타겟·의도 ─▶ P6-2 드래프트·교정·업데이트)
```

| 의존 | 이유 |
|---|---|
| P1 → 모든 후속 단계 | 라우트·토스트·i18n·Zustand가 없으면 어떤 화면도 올릴 곳이 없다. 빈 페이지라도 골격이 있으면 P1부터 A5 게이트(`build`/`start`)를 매 커밋 돌릴 수 있다 |
| P2 → P3·P4 | `createPersona`와 분석 유스케이스는 둘 다 `gemini.generate`를 부르고, `generate`는 `settingsRepo.getApiKey()`에 의존한다. 키 저장·에러 변환 계약이 먼저 있어야 도메인 계층의 실패 경로를 설계할 수 있다 |
| P3 → P4 | 분석 유스케이스의 첫 인자는 저장된 페르소나다. 기록 탭은 분석 결과가 있어야 렌더할 것이 있다 |
| P4 → M1 → P5 | 텍스트 입력 MVP가 검증된 뒤에 이미지 경로를 얹는다(아래 3단 사고) |
| P6-1 → P6-2 | 드래프트는 스레드 textarea가 있어야 저장할 것이 생기고, 타겟 피커는 파서가 있어야 목록을 그린다. `targetOverride`도 P6-1이 만든 시그니처 위에 얹힌다 |
| P6 → P7 | 재설계로 화면·계약이 통째로 바뀌므로, 그 전에 안정화를 하면 곧 뜯어낼 v1 화면의 버그를 고치게 된다. 실사용 버그 수집은 v2가 자리를 잡은 뒤에 하는 편이 값싸다. 대신 M1에서 넘어온 미확정(A6 실기기, 상세 모달 백드롭 상단 미커버)이 한 단계 더 밀린다 — 둘 다 조작을 막지 않는 항목이라 감수한다 |
| P7 → P8 | 배포 후의 버그는 사용자에게 노출된다. LAN 휴대폰 실사용(A6)이 배포 전 실사용의 대리다 |

**온보딩(P2)이 페르소나(P3)보다 먼저인 이유(3단 사고)**
- 1차 사고: 페르소나 생성이 제품의 첫 가치이므로 P3를 먼저 만들고, 온보딩은 UI라 나중에 붙여도 된다.
- 비판적 재사고: 그렇게 하려면 개발 중 키를 어디선가 읽어야 한다. (a) 소스에 임시 하드코딩 — 커밋 유출 위험이 있고 "키·대화를 콘솔·서버 로그에 남기지 않는다"는 PRD DR-5와 정면 충돌한다. (b) 환경변수 주입 — 정적 빌드에 키가 박혀 배포 산출물이 오염된다. 또 `gemini.ts`의 인증 오류 처리("키가 잘못됐으니 다시 입력")는 온보딩 UI와 계약을 공유하므로, 온보딩 없이 만든 P3는 실패 경로가 비어 있는 상태가 된다. 반면 "온보딩을 먼저 하면 P2 단계에서 보여줄 기능이 없다"는 반론은 약하다 — P2의 출구는 A1(모달 점유)과 A4(키 유지)로 그 자체가 acceptance 항목이다.
- 종합: P2를 먼저 둔다. 대가는 하나 — P2에는 `generate`를 부르는 화면이 없어 실키 품질·지연 확인은 P3 첫 실호출로 밀린다. 대신 CORS 통과 여부와 SDK 오류 객체 형태는 실키 없이도 확인되므로 P2에서 임의(무효) 키로 1회 호출해 확인한다(기대: 인증 오류가 SDK 오류로 도착; 결과를 LOG에, 미실행이면 미실행으로). 나머지 리스크는 §7에 적고, P3 첫 실호출 결과를 LOG에 남긴다.

**이미지 입력(P5)이 M1 이후인 이유(3단 사고)**
- 1차 사고: 멀티모달 모델을 이미 선정했으니 P3에 텍스트/이미지 토글을 함께 넣으면 한 번에 끝난다.
- 비판적 재사고: 이미지 경로는 파일 읽기·base64 인코딩·페이로드 크기·긴 타임아웃·드롭존 UI라는 별도 실패 표면을 가진다. M1의 검증 표면이 커지면 A2 실패 시 원인 분리가 어렵다. 그리고 텍스트 붙여넣기만으로도 MVP 가치(페르소나 → 답변 후보)는 성립한다.
- 종합: M1은 텍스트 전용으로 작게 닫고, P5에서 `generate`에 선택 인자를 **가산**하는 방식으로 붙인다. 이미지 판독 품질은 키가 있어야 확인되므로 P5 출구에서도 "미확정"으로 남을 수 있다.

**분석 재설계(P6)를 안정화보다 앞에 둔 이유(3단 사고)**
- 1차 사고: 계획대로 안정화를 먼저 한다. 실사용 버그가 이미 쌓여 있고(A6 실기기, 상세 모달 백드롭), 사용자에게 보이는 결함부터 없애는 것이 순서다.
- 비판적 재사고: 그 버그들이 어디에 있는지 보면 분석 탭이 상당 부분이다. 그런데 P6은 분석 탭의 입력부를 통째로 갈아 끼운다 — 지금 고친 화면 코드가 곧 사라진다. 반대 방향의 공격도 있다: "재설계를 먼저 하면 알려진 버그가 한 단계 더 방치된다." 남은 두 건을 실제로 보면 A6는 기기가 필요한 확인이고 상세 모달 백드롭은 조작에 영향이 없는 표시 문제라, **한 단계 미뤄도 사용자가 막히지 않는다.** 다만 "실사용 버그가 P6 동안 더 쌓일 수 있다"는 지적은 반박하지 못했다 — 그건 P7의 범위가 늘어난다는 뜻이며 감수한다.
- 종합: P6(재설계) → P7(안정화) 순서로 둔다. 살아남은 근거는 "곧 교체될 코드를 고치는 비용이 확실하고, 미루는 비용은 확실하지 않다"는 비대칭이다. 대신 P6 안에서 발견되는 회귀는 P7로 넘기지 않고 그 자리에서 고친다.

## 7. 리스크·롤백

| 리스크 | 완화 | 롤백 |
|---|---|---|
| 모델명·타임아웃·저장소명이 코드 곳곳에 퍼짐 | `src/lib/config.ts` **단일 출처**: `TEXT_MODEL`, `TEXT_REQUEST_TIMEOUT_MS`, `API_KEY_COOKIE_NAME`, `DB_NAME`/`DB_VERSION`/`STORE_*`. 다른 파일은 이 상수만 import | 값 1곳 수정 후 재빌드 |
| Gemini SDK 파손·브라우저 번들 미지원·모델 폐기 | 호출을 `gemini.ts` `generate()` 한 곳에 **캡슐화**. 도메인 계층은 `Promise<string>`만 본다 | `generate` 내부를 `fetch` REST(`v1beta/models/{model}:generateContent`)로 교체하거나 `TEXT_MODEL` 변경. 호출처 수정 없음 |
| Google이 브라우저 origin 호출을 CORS로 차단(PRD R2b) | 완화책 없음 — REST 폴백도 같은 엔드포인트라 함께 막힌다. P2 임의 키 호출로 현재 상태만 확인 | 없음(Client-First 전제 재검토) |
| `thinkingConfig.thinkingBudget=0`·모델명이 실제 API에서 거부됨(키 없이 진행해 미검증) | P3 첫 실호출 결과를 LOG에 기록 | `gemini.ts` 요청 config 1곳 수정 |
| IndexedDB 스키마 변경으로 기존 로컬 데이터 손실 | **가산 원칙**: 레코드 필드 추가는 선택(optional) 타입으로만, store·인덱스 추가는 `DB_VERSION` 증가 + `onupgradeneeded`에서 존재 확인 후 생성. 기존 레코드를 삭제·변형하는 마이그레이션은 두지 않는다 | 구 레코드가 새 코드에서 그대로 읽히므로 코드 revert만으로 복구 |
| 이미지 경로(P5)가 텍스트 경로를 망가뜨림 | **가산만 한다**: 선택 필드(`CreatePersonaInput.images?`)·선택 인자(`generate(prompt, images?)`)·상수 1개(`IMAGE_REQUEST_TIMEOUT_MS`)로만 붙이고 기존 호출부는 손대지 않는다. `images`가 없으면 M1과 완전히 같은 요청이 나간다(TRD §3.4) | 이미지 관련 코드만 되돌리면 텍스트 경로가 그대로 남는다. 저장 스키마를 건드리지 않아 `DB_VERSION`도 그대로(1) |
| 캡처 요청이 느리거나 타임아웃에 걸림 | 이미지 경로 전용 타임아웃 180초(PRD NFR-3). 값의 근거는 없으므로 P5 검증에서 실측한다 | `config.ts` 상수 1곳 수정 |
| LLM이 JSON 아닌 텍스트나 여분 키를 반환 | `extractJson` 방어 파싱(펜스 제거 → 균형 블록 → 전체 → `{ raw }`), `PersonaFields`는 추가 키를 허용하는 관대한 타입, UI는 없는 항목을 건너뜀 | 프롬프트 문구 수정(`prompts.ts` 1곳). `responseMimeType` 옵션은 후속 후보(§8) |
| 표시명 변경 시 로컬 데이터·키 호환 깨짐 | 표시명은 i18n `app.title`·`index.html` title·README·`package.json` name에 둔다(모두 로컬 데이터·키와 무관). `DB_NAME`·쿠키명만 호환을 위해 코드네임 기반으로 고정(TRD §10 #9) | 표시명만 되돌리면 데이터 무영향 |
| docs와 코드가 한 커밋에 섞여 되돌리기 어려움 | 단계마다 docs 커밋 → feat 커밋 분리 | feat 커밋만 `git revert`, 문서는 다음 docs 커밋에서 정정 |
| 키가 브라우저에 있어 XSS 시 유출 | React 텍스트 렌더링(HTML 주입 경로 없음), CSP meta(P8), 피해 범위 축소로 키 API 제한(Gemini API만) 안내(referrer 제한은 효과 제한적 — PRD R1), 콘솔에 키·대화 미출력 | 사용자 키 회전·삭제(헤더 인디케이터) |
| 모바일 브라우저의 저장소 제약(시크릿 모드·용량) | 온보딩에서 "이 기기 브라우저에만 저장" 고지, 저장 실패는 토스트 | — (미확정, §8) |

## 8. 미확정·후속 후보

| 항목 | 현재 상태 | 결정 시점 |
|---|---|---|
| ~~정식 표시명~~ | **확정: Persora** | 완료 |
| ~~`@google/genai` 정확한 버전 고정~~ | **확정(P2)**: `^2.7.0` | 완료 |
| ~~Gemini 실호출 동작(CORS·모델명·`thinkingConfig` 수락)~~ | **확인(P2~P4)**: 브라우저 직접 호출 CORS 통과, 실키 4회 모두 정상 응답 | 완료 |
| ~~vitest 도입 시점·대상~~ | **확정(P6)**: 트리거(`extractJson` 외에 분기가 비자명한 순수 모듈)가 `thread.ts`로 충족됐다. P6-1에서 `thread.test.ts`·`gemini.test.ts`, P6-2에서 `drafts.test.ts`를 만들고 `npm test`를 커밋 직전 게이트에 넣는다(§1.3). 프롬프트 빌더는 대상에서 뺐다 | 완료 |
| 답장 의도가 후보 방향을 실제로 바꾸는지 | **미실측** — PRD §8 부속 결정 4의 실측 2건은 v1 코드에서 잰 것이라 의도 슬롯을 시험하지 않았다 | P6-1 검증(같은 스레드에 빈 의도 / `decline` 비교) |
| 스레드 파서의 실제 적중률 | **미확정** — 카카오톡 내보내기와 `이름: 내용` 두 형식만 상정했다. 오검출은 수동 타겟 교정(P6-2)으로 복구된다 | P6 검증 → P7 실사용 |
| 타겟 칩 60자·피커 50자 컷, 피커 목록의 사용성 | 임시값. 근거 실측 없음(DESIGN U21·U22) | P7 |
| 스레드 드래프트의 저장소(localStorage)와 삭제 수단 | localStorage 한 칸으로 시작하고 전용 삭제 UI를 두지 않는다. 용량·정리 필요가 보이면 다시 본다(TRD §10 #21, DESIGN U23) | P7 |
| `analyzeMessage` 하위 호환 래퍼 존치 | 화면이 모두 `analyzeReply`로 옮겨 가면 호출부가 없어진다. 미사용 확인 후 제거 여부 판단(TRD §10 #18) | 마무리 단계 |
| 기록 펼침에 스레드·의도를 표시할지 | 레코드에는 저장하되 화면에는 넣지 않고 시작한다(DESIGN U24) | P7 |
| Gemini 실호출 지연·품질의 표본 | 지연은 실측(소형 1.94s / 페르소나 6.57s·5.87s / 분석 3.49s)했으나 **각 1회**라 분산·준수율은 미확정. `thinkingBudget=0`의 지연 단축 효과는 off 상태만 재서 **미실측**. lite와 비-lite flash 비교도 없음 | P7 실사용에서 표본 확대 |
| A6 실기기 확인(같은 Wi-Fi 휴대폰) | **미실행** — 자동화 뷰포트 390/360px만 확인 | P7 |
| 상세 모달 백드롭 상단 미커버(약 20px) | P3 스크린샷 관찰, **원인 미조사** | P7 안정화 |
| 첫 로드 JS 529.88 kB(gzip 131.68 kB) 코드 스플리팅 | 미확정 — 대부분이 `@google/genai` 번들 | P8 배포 전 |
| ~~이미지 입력 UX(P5)의 타임아웃 값·드롭존/썸네일 형태~~ | **확정(P5 docs)**: 타임아웃 `IMAGE_REQUEST_TIMEOUT_MS = 180_000`(이미지가 붙은 요청만), 드롭존은 `<label>` + hidden 파일 입력, 썸네일 64×64 그리드에 개별 제거(TRD §3.2·DESIGN §5.2) | 완료 |
| 캡처 이미지 요청의 지연·페이로드 크기 | **미실측** — 180초는 근거 없는 여유값. 장당 base64 크기도 잰 적이 없다 | P5 검증(실제 캡처 1장) |
| 캡처 페르소나의 정확도(텍스트 대비)·장수 상한·이미지 압축 | **미확정** — 캡처 한 장이 담는 발화가 적을 수 있다는 지적을 반증하지 못했다(TRD ADR-6). 상한과 리사이즈는 두지 않고 시작하며 지연 실측 뒤 판단 | P5 관찰 → P7 실사용 |
| `responseMimeType: 'application/json'` 사용 여부 | 도입하지 않음 — LOG에 파싱 결과가 적힌 실호출에서 실패가 없었다(표본 작음) | 파싱 실패가 보이면 검토 |
| 배포 도메인·`base` 경로 | GitHub Pages 예정. 프로젝트 사이트(하위 경로)인지 사용자 사이트인지에 따라 `vite.config.ts` base가 달라짐(현재 `'/'`) | P8 |
| CSP 정책 상세 | 허용 출처: self + `generativelanguage.googleapis.com` + 폰트 출처(Pretendard 로딩 방식에 따라) | P8 |
| 모바일 브라우저 IndexedDB·쿠키 동작(시크릿 모드, 저장 용량, iOS Safari 만료 정책) | 미확인 | P7 실사용에서 확인 |
| 대화 입력 최소·최대 길이 | 최소 길이 거부 기준은 trim 후 20자(임시값, 근거 실측 없음 — PRD FR-7). 최대는 모델 컨텍스트에 맡김 | 20자 조정 여부는 P7 실사용 후 |
| 후보 복사 성공 토스트 문구 | 미확정 — 자동화 브라우저의 클립보드 권한 대기로 확인하지 못함 | P7 |
