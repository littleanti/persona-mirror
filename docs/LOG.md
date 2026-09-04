# LOG — Persora 변경 이력 (Changelog)

> 규칙(CLAUDE.md 그라운드 룰 2): 최신 항목을 맨 위에 둔다. 각 항목은 태그(`[feat]`/`[fix]`/`[test]`/`[docs]`/`[chore]`), 절대 날짜, 변경 파일, 상태(`진행중`/`완료`/`완료(미검증)`)를 적는다. 코드 변경은 착수 전에 `진행중` 항목을 먼저 추가하고, 검증 후 `완료`로 바꾸며 실제 변경 파일을 정정한다. 검증을 돌리지 않았으면 "검증 비대상" 또는 "미실행"으로 사실대로 적는다. 원인 진단·설계 선택·수치 판단에는 그라운드 룰 1의 3단 사고(1차 사고 / 비판적 재사고 / 종합)를 남긴다.

## 2026-09-05 — [feat] P6 분석 단계 재설계 — 최근 대화 스레드·답장 대상·답장 의도 — 진행중

- 배경/목적: 실사용 리뷰에서 제품 의도와 구현 계약이 어긋나 있음이 드러났다. 의도는 "① 과거 대화로 상대의 장기 페르소나를 파악하고 → ② 최근 대화 맥락에서 → ③ 상대의 **마지막 메시지**에 **내 의도**대로 답장"인데, v1에는 ①과 ③의 일부만 있고 ②(단기 최근 맥락)가 입력 계약에 아예 없다. 근거는 코드다 — `AnalysisRecord.message: string`(메시지 1건), `buildAnalyzePrompt({ persona, message })`가 "…가 다음 메시지를 보냈습니다"로 **단발 메시지를 전제**, 화면 라벨 "받은 메시지", 답장 의도 슬롯 없음, 후보 3개가 항상 공감 3축 고정.
- 1차 사고: v1으로 충분하다. 사용자가 textarea에 최근 대화를 여러 줄 붙여 넣으면 모델이 알아서 맥락을 읽을 것이므로 구조 변경은 불필요하다.
- 비판적 재사고(반증을 실측): 2026-09-05, 유효 키, `analyzeMessage`를 직접 호출(페르소나 지수/현우). "스레드를 통째로 넣으면 품질이 무너진다"를 실제로 재생해 확인했다.

  | 변형 | 입력 | 지연 | 결과 |
  |---|---|---|---|
  | A | 최근 대화 스레드 6줄, **상대 발화로 끝남** | 3.52s | 분석과 후보 3개가 상대의 마지막 고민("리드 맡아보라는데… 너는 어떻게 생각해?")에 정확히 답했다 |
  | B | 같은 스레드 + 마지막 줄이 **내 발화**("일단 축하해! 근데 부담되는 건 당연하지") | 3.84s | 그래도 분석·후보는 상대의 고민에 답했다 — 모델이 관대하게 처리했다 |

  → **"품질이 무너진다"는 공격은 이 표본(2건)에서 반증됐다.** 1차 사고의 "모델이 알아서 읽는다"는 절반은 맞다. 그러나 살아남은 문제가 셋 있다. **(a) 앱이 답장 대상을 모른다** — 변형 B에서 내 발화까지 `message`("받은 메시지")로 저장·표시됐고, UI는 어느 메시지에 답하는지 보여 주거나 고칠 수 없다. **(b) 답장 의도 슬롯이 없다** — 세 후보가 항상 공감·해결·전환 축에 고정되어 거절·선 긋기·설득 같은 목표를 낼 수 없다(③의 "내 의도대로"가 빠짐). **(c) 프롬프트가 거짓 전제를 깐다** — "다음 메시지를 보냈습니다"에 여러 화자의 스레드를 넣는 것은 계약 위반이고, 지금 통하는 것은 모델의 관대함이지 설계가 아니다.
- 종합: 재설계는 품질 붕괴 때문이 아니라 **입력 계약을 사실대로 만들기 위해** 한다. 새 입력 = 페르소나(장기) + 최근 대화 스레드(단기 맥락, 파서가 화자를 구분하고 상대의 마지막 발화를 타겟으로 자동 검출해 화면에 표시, 수동 교정 가능) + 답장 의도(프리셋 6종 comfort/solve/lighten/decline/boundary/persuade + 직접 입력, **빈 값이면 기존 공감 3축 그대로 = v1 무회귀**). 비목표: 페르소나 자동 갱신(정적으로 두고 사용자가 "추가 대화로 업데이트"를 수동 실행), 앱 내 대화 누적(매번 붙여넣되 페르소나별 드래프트 자동 저장으로 재입력 부담을 낮춘다). 계약: [PRD](./PRD.md) §4.3·§8 부속 결정 4, [TRD](./TRD.md) §3.1·§3.5·§3.7·§3.8·§3.11·§3.12·ADR-7, [DESIGN](./DESIGN.md) §5.3·§6, [PLAN](./PLAN.md) §3.
- 변경 예정 파일:
  - **P6-1(스레드·타겟·의도 + vitest)**: `src/lib/thread.ts`(신규 `parseThread`/`detectTarget`), `src/lib/types.ts`(`AnalysisRecord.thread?`/`target_message?`/`intent?`, `ReplyIntentKey`, `REPLY_INTENTS`, `AnalyzeReplyInput`), `src/lib/prompts.ts`(`buildAnalyzePrompt` v2 — 최근 대화 흐름 블록·타겟 명시·`intentDirective`), `src/lib/analysis.ts`(`analyzeReply`, `analyzeMessage`는 하위 호환 래퍼), `src/routes/AnalyzePage.tsx`(스레드 textarea·자동 타겟 칩·의도 칩 6종 + 직접 입력), `src/lib/i18n.ts`(`analyze.thread*`/`analyze.target*`/`analyze.intentLabel`/`intent.*`), `package.json`(vitest devDep + `npm test`), `src/lib/thread.test.ts`, `src/lib/gemini.test.ts`
  - **P6-2(드래프트·타겟 교정·페르소나 업데이트)**: `src/lib/drafts.ts`(신규) + `src/lib/drafts.test.ts`, `src/routes/AnalyzePage.tsx`(드래프트 복원·자동 저장, 타겟 피커), `src/lib/analysis.ts`(`targetOverride`), `src/lib/persona.ts`(`updatePersona`), `src/lib/types.ts`(`PersonaRecord.updated_at?`), `src/routes/PersonaPage.tsx`(상세 모달 "추가 대화로 업데이트"), `src/lib/i18n.ts`(`persona.detail.update*`, `toast.persona*`)
- 검증 계획(아직 **미실행**):
  - `npm test`(= `npx vitest run`) — `thread.test.ts`(카카오톡식 `[이름] [시간] 내용` 파싱, `이름: 내용` 폴백, 멀티라인 이어붙이기, 화자 분류, 타겟 검출 1순위/폴백), `gemini.test.ts`(`extractJson` 4경로), `drafts.test.ts`(localStorage 스텁 — 저장·복원·삭제, 접근 실패 시 폴백)
  - `npx tsc --noEmit`, `npx vite build`
  - UI 스모크(Vite dev + 브라우저 자동화): 스레드 붙여넣기 → 타겟 칩 표시 → 피커로 다른 메시지 선택 → 의도 칩 전환 → 직접 입력 → 페르소나 전환 시 드래프트 복원 → 상세 모달 "추가 대화로 업데이트"
  - 실키 1회 이상: **의도 스티어링 확인** — 같은 스레드에 `decline`(정중한 거절) 의도를 주면 후보 3개의 방향이 공감 3축에서 거절 쪽으로 바뀌는지. 빈 의도로 한 번 더 돌려 v1 무회귀도 함께 본다

## 2026-09-05 — [feat] P5 캡처 이미지로 페르소나 생성(멀티모달) — 완료

- 배경/목적: 텍스트로 넣을 수 없는 대화(타인 기기·스크롤 캡처)를 위해 채팅 캡처 이미지 입력을 **선택 모드**로 추가한다. 텍스트 붙여넣기가 기본. 계약: TRD §3.1·§3.2·§3.4·§3.4.1·§3.5·§3.7·§4, DESIGN §5.2·§5.3, PRD FR-7·FR-9·DR-4, ADR-6.
- 변경 파일: `src/lib/image.ts`(신규, fileToInlineImage), `src/lib/types.ts`(InlineImage, CreatePersonaInput.images?), `src/lib/config.ts`(IMAGE_REQUEST_TIMEOUT_MS=180_000), `src/lib/gemini.ts`(generate(prompt, images?) 멀티모달 contents·이미지 타임아웃), `src/lib/prompts.ts`(buildPersonaPrompt 입력 소스 분기), `src/lib/persona.ts`(images 전달), `src/routes/PersonaPage.tsx`(텍스트/캡처 이미지 토글·드롭존·썸네일·모드별 검증), `src/lib/i18n.ts`(persona.create.tabText/tabImage/imageDropzone/imageHint/imagePlaceholder, toast.addImage/imageLoadFail), `docs/TRD.md`(§10 실측), `docs/PLAN.md`
- 구현 중 결정: 모델은 단일 `gemini-3.1-flash-lite`(멀티모달)로 유지 — 별도 비전 모델 없음. 이미지 자체는 저장하지 않고 `conversation`에 장수 플레이스홀더만 저장. 힌트에 "캡처 이미지도 Google로 전송됩니다" 고지.
- 검증:
  - `npx tsc --noEmit` → 0 에러 / `npx vite build` → 성공: index.html 0.83 kB │ gzip: 0.43 kB / index-BTBsnXpN.css 21.67 kB │ gzip: 4.84 kB / index-CmUtWYd8.js 533.18 kB │ gzip: 132.86 kB (79 modules transformed) / 주석 위생 grep(작업 메모·단계 번호) → 없음
  - UI 스모크(Vite dev, Playwright 390×844, 유효 키): 생성 시트 세그먼트 토글(✍️ 텍스트 / 🖼️ 캡처 이미지) → 이미지 모드에서 0장 제출 → "캡처 이미지를 추가해주세요" 토스트 → 실제 카카오톡 캡처 1장(JPEG 648×1440, 162 KB, base64 약 216 KB) 선택 → 썸네일 + 제거 버튼 표시 → 생성 → **Gemini 4.95s**(Resource Timing; 텍스트 1,331자 생성 6.57s와 같은 자리수) → "친구 페르소나 생성 완료!" 토스트, 목록 카드 추가.
  - 저장 결과(IndexedDB): `conversation` = "[채팅 캡처 이미지 1장으로 생성된 페르소나]", `persona` 11필드 모두 채워짐(`raw` 없음), 나의 이름 미입력이라 `my_persona` = {}. `vocabulary_examples`에 캡처 속 실제 표현("조으당", "먹었쪄용", "ㅋㅋㅋ")이 인용됨 → 모델이 이미지에서 대화를 직접 읽는다는 것은 확인.
- 관찰(정확도, 미확정 — 표본 1): 캡처 1장의 `vocabulary_examples` 5개 중 2개는 음식 이름("쿡밥", "설렁탕")으로 말투 지표가 아니다. 텍스트 모드(대화 38줄)에서는 6개가 모두 어미·감탄 표현이었다. 한 장 분량의 발화로는 문체 근거가 얇을 수 있다는 P5 docs의 2차 공격과 방향이 같지만, 표본이 1건이라 결론은 보류하고 실사용 관찰 항목(TRD §10 #16)으로 남긴다.
- 발견: 코드 주석에 마일스톤 명칭(M1)이 인용되어 있어 제거(주석 규칙: 현재 동작과 TRD 참조만).

## 2026-09-05 — [docs] M1 마일스톤 — 문서 1.0, package 1.0.0 — 완료

- 배경/목적: P4(메시지 분석 v1·기록)까지 구현·검증이 끝나 PLAN §5의 M1(MVP) 출구에 도달했다. PRD/TRD/DESIGN/PLAN을 실제 구현 상태로 정정해 1.0 기준선으로 올리고, README를 M1 기준으로 다시 쓰고, 패키지 버전을 1.0.0으로 맞춘다.
- 변경 파일: `docs/PRD.md`(1.0), `docs/TRD.md`(1.0), `docs/DESIGN.md`(1.0), `docs/PLAN.md`(1.0), `README.md`, `package.json`, `package-lock.json`
- M1 결과 요약: **A1~A5 통과, A6 미확정.** A1 온보딩 모달 점유(P2), A2 실키로 페르소나 생성 6.57s·5.87s와 분석 3.49s + 후보 3개 정식 라벨·나의 말투(P3·P4), A3 우리 서버로는 정적 자산 요청만·LLM은 Google 도메인 직접(P2~P4), A4 키·페르소나·기록이 전체 새로고침 후 유지(P2~P4), A5 `tsc` 0 에러 + `vite build` 성공 + Express 200(P1·표시명 항목). A6는 자동화 뷰포트 390/360px만 확인했고 같은 Wi-Fi 실기기 접속은 **미실행**이라 통과로 적지 않는다. 근거는 모두 아래 P1~P4·표시명 항목이다.
- 문서 정정(코드 대조): TRD §4.1 오류 분류 표의 인증 오류 행에 섞여 들어가 있던 지연 실측치를 떼어내 §9.5(새 소절)와 §10 #1로 옮겼다. TRD §3.7 `splitPersonaRaw`는 export되지 않은 모듈 내부 함수임을 명시. TRD §3.9에 `store.ts`의 모듈 함수 `hasApiKey()` 추가. DESIGN §9·§5.2 오버레이 닫기에서 **ESC를 뺐다** — 생성 시트·상세 모달에 ESC 핸들러가 없고 ESC는 헤더 인라인 키 편집에만 있다. DESIGN §5.1 헤더 버튼 문구를 구현대로 "새 페르소나 만들기"(빈 상태 CTA와 같은 `persona.createCta` 키)로 정정. DESIGN §10.1 i18n 영역을 11종 → 12종으로(`btn.*` 추가). DESIGN 머리말의 코드네임 오기("초기 코드네임 Persora") 수정.
- 남은 미확정: A6 실기기 접속 미실행 / 모델 lite 선택 근거 미실측(비-lite flash 미비교) / thinking off 자체의 효과 미실측(off 상태 지연만 측정) / 실키 표본 4회뿐이라 JSON·말투 준수율 미확정 / 대화 최소 길이 20자 임시값 / 복사 성공 토스트 문구 미확인(자동화 클립보드 권한 대기) / 첫 로드 JS 529.88 kB(gzip 131.68 kB)의 코드 스플리팅 여부는 P7 배포 전 판단 / 상세 모달 백드롭이 최상단 약 20px를 덮지 않는 현상은 원인 미조사, P6 안정화에서 진단.
- 검증: 비대상(문서·버전 메타만 변경, 소스 코드 무변경).

## 2026-09-05 — [chore] 앱 표시명을 "Persora"로 통일 (코드네임 Persona Mirror 종료) — 완료

- 배경/목적: PLAN §5 M1 마무리 항목 "표시명 확정". 코드네임을 그대로 정식명으로 쓸지 결정한다.
- 1차 사고: 코드네임 "Persona Mirror"를 정식명으로 채택 — 뜻이 직관적(페르소나를 비추는 거울)이고 바꿀 비용이 없다.
- 비판적 재사고(반증을 실측): ① **좁은 화면에서 잘린다.** 360px 폭(보급형 안드로이드)에서 헤더 앱명이 "Persona ···"로 말줄임 처리됨(scrollWidth 112 > clientWidth 87, `truncate`). 390px에서도 인디케이터와 여백이 21px로 빡빡하다(P3 LOG 관찰). ② 두 단어라 한국어 표기가 흔들린다("페르소나 미러"/"Persona Mirror" 혼용) — 한·영 단일 표기 원칙(DESIGN §10)과 충돌. ③ 일반명사 조합이라 고유성이 약하고 저장소명과도 다르다.
- 종합: 한 단어 고유명 **Persora**(Persona + -ora)로 확정, 한·영 동일 표기. 교체 범위는 표시 문구(i18n 2키)·`index.html` title·서버 로그·README·패키지명으로 한정한다. 이미 만들어진 로컬 데이터와의 호환을 위해 IndexedDB 이름 `persona-mirror`와 쿠키명 `pm_gemini_key`는 유지한다(TRD §3.2).
- 변경 파일: `index.html`, `src/lib/i18n.ts`(app.title·onboarding.welcomeTitle ko/en), `server/index.js`, `package.json`·`package-lock.json`(name persora), `README.md`, `src/lib/config.ts`(DB_NAME 주석), `docs/PRD.md`(0.3)·`TRD.md`(0.7)·`DESIGN.md`(0.3)·`PLAN.md`(0.3)·`LOG.md`(제목)
- 검증: `npx tsc --noEmit` 0 에러 / `npx vite build` 성공(js 529.88 kB, gzip 131.68 kB) / 브라우저 360px: 문서 제목 "Persora", 헤더 앱명 57px·말줄임 없음·인디케이터와 여백 46px(변경 전 87px 잘림·여백 16px).

## 2026-09-05 — [feat] P4 메시지 분석 v1(받은 메시지 1건)과 기록 — 완료

- 배경/목적: 저장된 페르소나를 골라 상대가 보낸 메시지 1건을 넣으면 심리 분석과 답변 후보 3개(깊은 공감·수용형 / 공감 + 함께 해결형 / 공감 + 분위기 전환형)를 나의 페르소나 말투로 생성하고 기록에 저장한다. 계약: TRD §3.8·§3.6·§3.5·§3.10, DESIGN §6·§7, PRD FR-12~22.
- 변경 파일: `src/lib/analysis.ts`(analyzeMessage/listAnalyses/removeAnalysis, 파싱 실패 폴백), `src/lib/repos/analysisRepo.ts`, `src/lib/prompts.ts`(speechSummary·buildAnalyzePrompt), `src/routes/AnalyzePage.tsx`, `src/routes/HistoryPage.tsx`, `src/lib/i18n.ts`(analyze.*/history.*/parse.*/toast.*), `docs/TRD.md`(§10 #1 실측), `docs/PLAN.md`
- 구현 중 결정: 안내 문구에 HTML 태그를 넣지 않는다(DESIGN D6) — `<strong>` 강조 후처리 대신 평문. i18n 키는 DESIGN §10.1 영역 규칙(`analyze.run`, `analyze.loading`, `analyze.copy`, `history.delete`, `history.confirmDelete` …). 후보가 3개를 넘으면 앞 3개만, 모자라면 있는 만큼만 렌더(가짜 후보를 만들지 않음). 분석 탭 초기 선택은 TRD §3.10대로 "선택 ID가 목록에 있으면 그것, 없으면 첫 번째".
- 검증:
  - `npx tsc --noEmit` → 0 에러 / `npx vite build` → 성공: index.html 0.81 kB │ gzip: 0.42 kB / index-BfvnMbgV.css 21.43 kB │ gzip: 4.80 kB / index-B4x_fgcJ.js 529.91 kB │ gzip: 131.68 kB (78 modules transformed)
  - 코드 리뷰: buildAnalyzePrompt에 3축 정식 라벨, "평소 말투 안에서 공감" 지시, JSON-only 지시 포함. 파싱 실패 폴백은 후보 1개(`parse.failLabel`/`parse.failReason`, response=원문).
  - UI 스모크(Vite dev, Playwright 390×844, 유효 키): 페르소나 없음 → 안내 문구 + 버튼 비활성. 페르소나(지수/현우, 대화 30줄) 생성 5.87s → 분석 탭 진입 시 그 페르소나가 초기 선택("지수 · Gemini"). 메시지 빈 값 → "메시지를 입력해주세요". 실제 메시지(상대의 마지막 고민 문장) 분석 → **Gemini 3.49s** → 심리 분석 카드 + 후보 3개가 정식 라벨 그대로 렌더, response는 나의 페르소나 말투(반말, ㅠㅠ/ㅋㅋ)로 작성됨. 복사 버튼 클릭은 동작했으나 자동화 브라우저의 클립보드 권한 대기로 토스트 문구 확인은 **미확정**.
  - 기록 탭: 카드(페르소나명·메시지 55자 미리보기·날짜) → 펼치면 분석 + 후보 3(복사 버튼 없음, DESIGN §7) + "기록 삭제". 전체 새로고침 후 기록 유지(A4). 삭제 confirm → 빈 상태("아직 분석 기록이 없어요") + "기록 삭제 완료" 토스트. 콘솔 에러 0.
- M1 판단 자료: 이 단계로 PRD Acceptance A1(온보딩)·A2(생성·분석·기록)·A4(영속)·A5(빌드·서빙)는 실측으로 통과, A3(네트워크 분리)은 P2·P3·P4 스모크에서 Google 도메인 직접 호출만 관찰됨(우리 서버로 가는 요청은 정적 자산). A6(휴대폰 동일 Wi-Fi)은 자동화 뷰포트로만 확인 — 실기기 미확정. 상세는 M1 마일스톤 항목(문서 1.0)에서 정리.

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
