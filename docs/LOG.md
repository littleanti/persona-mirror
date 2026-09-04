# LOG — Persona Mirror (코드네임) 변경 이력 (Changelog)

> 규칙(CLAUDE.md 그라운드 룰 2): 최신 항목을 맨 위에 둔다. 각 항목은 태그(`[feat]`/`[fix]`/`[test]`/`[docs]`/`[chore]`), 절대 날짜, 변경 파일, 상태(`진행중`/`완료`/`완료(미검증)`)를 적는다. 코드 변경은 착수 전에 `진행중` 항목을 먼저 추가하고, 검증 후 `완료`로 바꾸며 실제 변경 파일을 정정한다. 검증을 돌리지 않았으면 "검증 비대상" 또는 "미실행"으로 사실대로 적는다. 원인 진단·설계 선택·수치 판단에는 그라운드 룰 1의 3단 사고(1차 사고 / 비판적 재사고 / 종합)를 남긴다.

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
