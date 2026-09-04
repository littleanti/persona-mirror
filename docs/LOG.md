# LOG — Persona Mirror (코드네임) 변경 이력 (Changelog)

> 규칙(CLAUDE.md 그라운드 룰 2): 최신 항목을 맨 위에 둔다. 각 항목은 태그(`[feat]`/`[fix]`/`[test]`/`[docs]`/`[chore]`), 절대 날짜, 변경 파일, 상태(`진행중`/`완료`/`완료(미검증)`)를 적는다. 코드 변경은 착수 전에 `진행중` 항목을 먼저 추가하고, 검증 후 `완료`로 바꾸며 실제 변경 파일을 정정한다. 검증을 돌리지 않았으면 "검증 비대상" 또는 "미실행"으로 사실대로 적는다. 원인 진단·설계 선택·수치 판단에는 그라운드 룰 1의 3단 사고(1차 사고 / 비판적 재사고 / 종합)를 남긴다.

## 2026-09-05 — [feat] P3 페르소나 생성·목록·상세·삭제 — 완료

- 배경/목적: 첫 도메인 기능. 대화 텍스트(+선택적 나의 이름) → Gemini → 상대/나 페르소나 JSON → IndexedDB 저장, 목록/상세/삭제. 계약: TRD §3.1·§3.5·§3.6·§3.7·§3.9·§3.10, DESIGN §5.
- 변경 파일: `src/lib/types.ts`, `src/lib/db.ts`(initDB/withStore, personas·analyses store + created_at 인덱스), `src/lib/repos/personaRepo.ts`, `src/lib/persona.ts`(createPersona/list/get/remove, `splitPersonaRaw`), `src/lib/prompts.ts`(PERSONA_FIELDS·buildPersonaPrompt), `src/lib/id.ts`(`crypto.randomUUID()` 직접 호출), `src/lib/dom.ts`, `src/lib/store.ts`(selectedPersonaId), `src/App.tsx`(initDB 1회), `src/lib/i18n.ts`(persona.*·toast.*·err.dbOpen), `src/routes/PersonaPage.tsx`(목록·빈 상태·생성 바텀 시트·상세 모달), `src/routes/AnalyzePage.tsx`·`HistoryPage.tsx`(폭 `max-w-2xl`), `docs/TRD.md`(§10 #1 실측 추가), `docs/PLAN.md`
- 구현 중 결정: i18n 키는 문구를 그대로 두고 DESIGN §10.1의 `persona.*` 영역으로 배치. 헤더 버튼과 빈 상태 CTA는 같은 문구·키를 재사용. 상세 모달의 알 수 없는 키는 속성명을 라벨로 그대로 표시(관대 표시). 오버레이는 페이지 `section` 안에 렌더하고 백드롭 클릭 판정은 `onClick`의 `target === currentTarget`으로 두었다.
- 검증:
  - `npx tsc --noEmit` → 0 에러 / `npx vite build` → 성공: index.html 0.81 kB │ gzip: 0.42 kB / index-ChW14u_Y.css 19.06 kB │ gzip: 4.45 kB / index-CcIW1zUA.js 515.73 kB │ gzip: 127.58 kB (76 modules transformed). JS가 500 kB를 넘는 것은 `@google/genai` SDK 번들 때문 — NFR-4 측정값으로 기록, 코드 스플리팅 여부는 M1에서 판단.
  - UI 스모크(Vite dev, Playwright 390×844, 유효 키): 빈 상태 → `+ 새 페르소나 만들기` → 시트. 제출 검증 순서 확인: 이름 공백 → "이름을 입력해주세요", 대화 12자 → "대화 기록이 너무 짧아요". 카카오톡 export 형식 샘플(두 화자, 38줄, 1,331자)로 생성 → **Gemini 요청 6.57s**(Resource Timing) → "지수 페르소나 생성 완료!" 토스트, 시트 닫힘, 목록 카드(이니셜·이름·"나: 현우" 배지·요약·날짜).
  - 저장 결과(IndexedDB `persona-mirror` v1, stores analyses/personas): 레코드 1건, `persona`·`my_persona` 모두 11개 필드가 채워짐(`raw` 없음). `vocabulary_examples`는 대화 원문 인용 6개("야", "ㅋㅋ", "ㅠㅠ", "진짜?", "그치??", "홧김"), `sentence_style`에 실제 문장 인용 3개.
  - 상세 모달: 요약 블록 + 10개 항목 카드 + 태그, 나/상대 탭 전환(나의 페르소나 11필드 표시), 원본 대화 토글, "이 페르소나로 분석" → `#/analyze` 이동. 전체 새로고침 후 목록 유지(A4). 삭제 → confirm → 빈 상태 + "지수 삭제 완료" 토스트. 콘솔 에러 0.
- 관찰(미조사): 상세 모달 스크린샷에서 어두운 백드롭이 최상단 약 20px(헤더 윗부분)를 덮지 않고 그 아래에서 시작하는 것처럼 보인다. 닫기·조작에는 영향이 없어 이번 단계에서 원인을 추적하지 않았다 — **미확정, P6 안정화에서 진단**.
- 관찰(M1 표시명 판단용): 390px 폭 헤더에서 앱명 "Persona Mirror"(112px)와 "Gemini 준비됨" 인디케이터(91px) 사이 여백이 21px로 빡빡하다. 더 좁은 기기(360px)에서는 넘칠 가능성 — M1에서 확인.

## 2026-09-05 — [feat] P2 Gemini API 키 온보딩(쿠키)과 클라이언트 — 완료

- 배경/목적: 모든 도메인 기능이 사용자 소유 Gemini 키에 의존하므로 페르소나보다 먼저 키 온보딩과 호출 모듈을 만든다(PLAN §6). 계약: TRD §3.2·§3.3·§3.4·§3.9·§3.10·§4, DESIGN §4.
- 변경 파일: `src/lib/config.ts`, `src/lib/repos/settingsRepo.ts`(쿠키 `pm_gemini_key`, max-age 1년, path=/, SameSite=Lax), `src/lib/gemini.ts`(generate/extractJson/에러 변환), `src/lib/store.ts`(apiKey 미러, setApiKey/clearApiKey, hasApiKey), `src/components/OnboardingModal.tsx`, `src/components/ApiKeyStatus.tsx`, `src/App.tsx`(온보딩 게이트·헤더 인디케이터), `src/lib/i18n.ts`(onboarding/status/err/toast/btn 키), `docs/TRD.md`(§10 #1·#3 실측 반영)
- 구현 중 결정: 스토어는 TRD §3.9대로 `setApiKey(key)`/`clearApiKey()`를 분리(`setApiKey(key|null)` 통합안도 검토했으나 TRD §3.9 계약과 달라 폐기). 온보딩 소개 문구는 이 시점에 없는 기능(이미지 입력 등)을 언급하지 않도록 조정하고, 동의 문구는 DR-4(Gemini 전송)·DR-6(복구 불가)를 함께 담았다.
- 검증:
  - `npx tsc --noEmit` → 0 에러 / `npx vite build` → 성공: index.html 0.81 kB │ gzip: 0.42 kB / index-1V1pdAPq.css 14.64 kB │ gzip: 3.75 kB / index-Bcbch9zE.js 183.82 kB │ gzip: 60.51 kB (59 modules transformed)
  - UI 스모크(Vite dev, Playwright 390×844): 키 없음 → 온보딩 모달이 화면 점유(A1). 빈 입력으로 저장 → 검증 토스트. 무효 키 + 동의 → 저장 → 모달 사라지고 헤더 "● Gemini 준비됨". `document.cookie`에 `pm_gemini_key` 존재 확인. 새로고침 후 인디케이터 유지(A4). 인디케이터 클릭 → 인라인 편집(저장/취소/삭제) → 삭제 → 쿠키 제거 확인, 온보딩 모달 재등장 + "저장된 키를 삭제했습니다" 토스트. 언어 토글 후에도 동일 동작.
  - CORS·오류 형태(TRD §10 #3, 무효 키): 브라우저에서 `generativelanguage.googleapis.com`으로 직접 `fetch` → **CORS 통과**, HTTP 400, 본문 `error.code=400, status=INVALID_ARGUMENT, reason=API_KEY_INVALID`(307ms). `generate('ping')`은 이 오류를 `err.invalidKey` 문구("API 키가 유효하지 않습니다…")로 변환해 throw(152ms). → §4.1 분류 규칙(메시지에 "api key" 포함 시 인증 오류) 유효.
  - 유효 키 1회 호출(TRD §10 #1 일부): 한 문장 말투 평가 + JSON-only 지시 → **1.94s**, 응답 `{"tone": "친근함"}` 15자, `extractJson` 파싱 성공. 실제 페르소나 프롬프트(수천 자 입력) 지연은 P3에서 측정한다 — 미확정 유지.
  - 발견: 콘솔에 Google 400 응답 로그 1건(브라우저 네트워크 로그, 정상). 키·프롬프트 콘솔 출력 없음(grep 확인).

## 2026-09-05 — [feat] P1 앱 스캐폴드와 셸 — 완료

- 배경/목적: 도메인 기능 전에 빌드 파이프라인과 앱 셸(상단바·하단 탭 3개·HashRouter·i18n ko/en·토스트)을 세워 이후 단계가 화면 단위로 붙을 자리를 만든다. 계약: TRD §2·§3.9·§3.10, DESIGN §2·§3, PLAN §4 P1.
- 변경 파일: `package.json`(persona-mirror 0.1.0, engines node>=20), `package-lock.json`, `tsconfig.json`, `vite.config.ts`(base `/` — Pages 경로는 P7), `tailwind.config.js`(토큰 brand-gradient/brand-gradient-subtle/avatar-gradient, soft/glow, slide-up/fade-in), `postcss.config.js`, `index.html`(CSP는 P7), `public/`(favicon·app-icon-192·apple-touch-icon·app-logo), `server/index.js`(Express 4, dist 서빙 + SPA 폴백, 0.0.0.0:8000), `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/vite-env.d.ts`, `src/lib/i18n.ts`(t/getLang/setLang/onLangChange/initI18n, `pm_lang`), `src/lib/useI18n.ts`, `src/lib/store.ts`(toasts만), `src/components/Toast.tsx`, `src/components/LanguageToggle.tsx`, `src/routes/PersonaPage.tsx`·`AnalyzePage.tsx`·`HistoryPage.tsx`(제목·부제 placeholder), `README.md`, `.gitignore`(브라우저 자동화 산출물 무시)
- 구현 중 결정: 라우트는 TRD §3.10대로 `/`→`/personas` redirect + `/personas`·`/analyze`·`/history`. 페이지 콘텐츠 폭은 DESIGN §3의 `max-w-lg`를 그대로 따랐다(실제 콘텐츠가 붙는 P3에서 재검토). i18n 사전은 P1이 실제로 쓰는 키 10개만 넣었다.
- 검증:
  - `npm install` → up to date, 254 packages(lock 최상위 name/version persona-mirror/0.1.0 확인)
  - `npx tsc --noEmit` → 0 에러
  - `npx vite build` → 성공: dist/index.html 0.81 kB (gzip 0.42 kB) / dist/assets/index-*.css 10.75 kB (gzip 3.03 kB) / dist/assets/index-*.js 175.98 kB (gzip 57.63 kB) (55 modules transformed, 1.38s)
  - `node server/index.js` → `GET /` 200, `GET /app-logo.png` 200
  - UI 스모크(Vite dev 4121, Playwright, 390×844): `#/` → `#/personas` 리다이렉트, 문서 제목 "Persona Mirror", 하단 탭 3개 렌더, '분석하기' 클릭 → `#/analyze` 제목 전환, EN 토글 → 제목·탭·부제가 영문으로 전환. 콘솔 에러 0(경고 3: React Router v7 future flag 2건, `apple-mobile-web-app-capable` deprecation 1건 — 동작 영향 없음).
  - 스모크에서 발견해 고친 것: '페르소나' 탭 링크가 `#/`를 가리켜 `/personas`에서 활성 표시가 되지 않았다 → 탭 경로를 `/personas`로 정정 후 tsc·build 재실행.

## 2026-09-05 — [docs] P0 제품·기술·화면·계획 문서 초안 (PRD/TRD/DESIGN/PLAN 0.1) — 완료

- 배경/목적: 코드를 한 줄도 쓰기 전에 제품 정의(PRD), 아키텍처 결정(TRD), 화면 설계(DESIGN), 단계 계획(PLAN)을 먼저 고정한다.
- 변경 파일: `docs/PRD.md`(264줄), `docs/TRD.md`(563줄), `docs/DESIGN.md`(585줄), `docs/PLAN.md`(265줄)
- 결정 요약(3단 사고는 PRD §8 / TRD §5 ADR): Client-First 채택(기각: 서버+로컬 Ollama, 운영자 키 프록시). 단일 모델 `gemini-3.1-flash-lite` + thinking off. 개인 데이터 IndexedDB, API 키 쿠키. HashRouter, Zustand 최소 전역 상태, 하단 탭 3개.
- 미확정으로 남긴 것: 모델 지연·품질(키 필요), 브라우저→Gemini CORS 실확인(P2에서 임의 키 1회 호출로 확인 예정), 정식 표시명(M1 전 확정), 대화 최소 길이 20자(임시값).
- 검증: 비대상(문서). 대신 세 갈래 교차 검토(문서 간 일관성 / 근거 없는 단정·형식적 재사고 / 아직 결정하지 않은 사항의 선반영)를 거쳐 정정했다.

## 2026-09-05 — [chore] 프로젝트 시작: 라이선스·작업 규칙·변경 이력 초기화 — 완료

- 배경/목적: 저장소를 열고 작업 규칙(`CLAUDE.md`: 3단 사고 절차, 문서 우선 코드 수정 워크플로)과 변경 이력 파일을 먼저 둔다.
- 변경 파일: `LICENSE`(MIT), `CLAUDE.md`, `.gitignore`, `docs/LOG.md`
- 검증: 비대상(코드 없음)
