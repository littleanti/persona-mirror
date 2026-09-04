# LOG — Persora 변경 이력 (Changelog)

> 규칙(CLAUDE.md 그라운드 룰 2): 최신 항목을 맨 위에 둔다. 각 항목은 태그(`[feat]`/`[fix]`/`[test]`/`[docs]`/`[chore]`), 절대 날짜, 변경 파일, 상태(`진행중`/`완료`/`완료(미검증)`)를 적는다. 코드 변경은 착수 전에 `진행중` 항목을 먼저 추가하고, 검증 후 `완료`로 바꾸며 실제 변경 파일을 정정한다. 검증을 돌리지 않았으면 "검증 비대상" 또는 "미실행"으로 사실대로 적는다. 원인 진단·설계 선택·수치 판단에는 그라운드 룰 1의 3단 사고(1차 사고 / 비판적 재사고 / 종합)를 남긴다.

## 2026-09-05 — [chore] P11 마무리 — 미사용 코드 제거, README·문서 최종 동기화, 전체 검증 — 진행중

- 배경/목적: 피벗을 거치며 남은 하위 호환 래퍼와 어긋난 서술을 정리하고, 네 문서를 코드 최종 상태와 대조해 닫는다. 그다음 전체 검증(vitest·tsc·build·브라우저 전 흐름)과 독립 리뷰(문서-코드 정합 / 변경 이력-커밋 정합 / 규칙 준수)를 거친다.
- 변경 예정: ① `src/lib/analysis.ts`의 `analyzeMessage`(v1 하위 호환 래퍼, 앱 내 호출부 없음) 제거 — TRD §3.8 정정. ② `README.md` 최종(기능 3+설정, 실행·접속 주소, 개인정보, 프로젝트 구조, 문서 링크). ③ PRD/TRD/DESIGN/PLAN 최종 동기화(상태·미확정 목록 정리). ④ 리뷰 지적 반영.
- 검증 계획: `npm test`, `tsc`, `vite build`, 브라우저 전 흐름 스모크(온보딩 → 페르소나(.txt) → 분석(텍스트·이미지) → 기록 → 설정), 독립 리뷰 3렌즈.
- ① 완료 — `analyzeMessage` 제거: `src/lib/analysis.ts`(래퍼·머리 주석), `docs/TRD.md`(§3.8·§10 #18). 호출부 grep 0건(테스트에도 없음). 검증: `npm test` → Tests 45 passed (45) / `tsc` 0 / `vite build` → js index-DqBYvWdh.js 557.70 kB │ gzip: 140.26 kB.

## 2026-09-05 — [feat] P10 페르소나 생성 입력 재평가 — 캡처 이미지 모드 제거, 카카오톡 대화 파일(.txt) 첨부 + tail 컷 — 완료

- 배경/목적: P5에서 넣은 캡처 이미지 모드를 **제거하고** 페르소나 생성을 대화 텍스트 단일 흐름 + **카카오톡 대화 파일(.txt) 첨부**로 교체한다. 만든 기능을 파기·교체하는 세 번째 피벗이다(첫째 P6 분석 재설계, 둘째 P8 키 저장 매체). 계약: [PRD](./PRD.md) §4.2 FR-7·FR-9·DR-4·NFR-3·R5b·R5c·R8·§8 부속 결정 3(재검토), [TRD](./TRD.md) §3.1·§3.2·§3.5·§3.7·§3.10·**신규 §3.15**·**ADR-10**(ADR-6 종결)·§9.9, [DESIGN](./DESIGN.md) §5.2·§5.3·§10.1·§12, [PLAN](./PLAN.md) §3·§4.

- **문제 제기**: P5 실사용 관찰이 **그때 미확정으로 남겨 둔 항목**에 신호를 냈다. 캡처 1장으로 만든 페르소나의 `vocabulary_examples` 5개 중 2개가 음식 이름("쿡밥", "설렁탕")으로 말투 지표가 아니었고, 같은 프롬프트에 텍스트 38줄(1,331자)을 넣었을 때는 6개가 모두 어미·감탄 표현이었다(각 표본 1). P5 문서의 2차 공격 — "캡처 한 장은 화면 한 장 분량의 발화만 담아 인용 재료가 얇다" — 이 반증되지 않은 채 살아 있었다.

- **1차 사고**: 캡처 모드는 유지하고 안내로 보완한다. 힌트에 이미 "여러 장을 시간 순서대로 올리면 더 정확해요"라고 적어 두었으니, 사용자가 여러 장을 올리면 분량 문제는 사라진다.

- **비판적 재사고 — 계산하고 실측치를 대조했다.**
  - ① **분량이 정확도를 좌우한다는 것은 프롬프트가 스스로 말한다.** 페르소나 프롬프트는 `vocabulary_examples`·`sentence_style`·`texting_habits`에 실제 발화를 그대로 인용하라고 강제한다. 인용할 발화가 적으면 채울 것이 없어 눈에 띄는 명사라도 넣게 된다 — P5 관찰이 정확히 그 모습이다.
  - ② **두 입력의 분량과 페이로드를 계산했다.** 샘플 카카오톡 대화 텍스트는 1,331자·메시지 34줄로 **평균 32.6자/메시지**다.

    | 입력 | 담기는 메시지 | 전송 페이로드 | 실측 지연(표본 1) |
    |---|---|---|---|
    | 캡처 이미지 1장 | 화면 한 장 분량 **약 10~15개**(추정, OCR 미측정) | 원본 JPEG 648×1440, 162,080 B → base64 **약 211 KB** | 4.95s(P5) |
    | 대화 .txt 말미 16,000자 | 평균 32.6자/메시지 기준 **약 490개** | UTF-8 **약 46 KB** | 텍스트 1,331자 생성 6.57s(P3) |

    담는 메시지는 **두 자릿수 차이**인데 페이로드는 이미지가 **약 4.5배 무겁다.** 더 무거운 입력이 더 적게 담는다 — 이 방향의 트레이드오프에는 변호할 여지가 없다. 이미지 경로에 180초 타임아웃을 따로 둔 것도 그 무게 때문이었다.
  - ③ **"여러 장 올리기"는 앱이 할 일을 사용자에게 미루는 답이다.** 490개 메시지를 캡처로 채우려면 스크롤·캡처를 수십 번 반복해야 하고 페이로드도 함께 커진다. 반면 카카오톡은 **대화 전체를 .txt로 내보내는 기능을 이미 제공한다** — 파일 하나로 수천 줄이 들어온다. 1차 사고의 전제가 여기서 깨졌다.
  - ④ **그러면 분석 탭의 캡처 모드(P9)도 버려야 하는가? 아니다.** 두 화면이 필요로 하는 분량이 다르다. 페르소나는 말투 지문을 뽑는 **장기 표본**이라 많을수록 좋고, 분석은 마지막 메시지에 답하기 위한 **단기 맥락**이라 화면 한 장 분량이 맞는 크기다. 같은 기술을 한 화면에서 버리고 다른 화면에서 유지하는 근거는 기술이 아니라 **그 화면이 필요로 하는 분량**이다.
  - ⑤ **반증하지 못한 것**: 같은 대화를 캡처와 텍스트로 각각 넣어 나온 페르소나를 나란히 비교한 표본은 없다. 위 판단의 근거는 계산과 P5의 단발 관찰이고, 정확도 차이 **자체**는 **정성 판단**이다 — 미확정으로 남긴다.

- **종합**: 페르소나 생성의 캡처 이미지 모드를 **제거하고** 대화 텍스트 단일 흐름 + .txt 첨부로 교체한다. 살아남은 근거는 ②의 비대칭 하나다. 첨부하면 `parseKakaoChatTail`이 내보내기 머리말(대화 제목·`저장한 날짜`·`Date Saved`·날짜 구분선)을 떼고 **말미 `PERSONA_CHAT_TAIL_CHARS = 16,000`자만**(줄 경계 보존) 잘라 입력란을 채운다 — 최근 대화일수록 지금의 말투·관계를 반영하기 때문이다. 사용자는 채워진 결과를 편집할 수 있고 "최근 N자 사용(원본 M자)" 안내를 본다.

  **버리는 것을 명시한다.** 텍스트로 아예 넣을 수 없는 대화(타인 기기의 화면, 복사가 막힌 대화)는 이제 페르소나 생성에 넣을 수 없다. 그것이 P5 결정의 유일한 생존 근거였고, ②의 비대칭이 그보다 크다고 판단한 것이다.

- 함께 정한 것:
  - **화자 라벨·타임스탬프는 보존한다** — 모델이 누구의 발화인지 가르는 근거다. 파서는 자르기만 하고 다시 쓰지 않는다.
  - **머리말 패턴에 걸리지 않으면 원문을 그대로 통과시킨다.** 카카오톡 파일이 아닌 평범한 텍스트를 골라도 깨지지 않아야 하고, 그때 옳은 행동은 아무것도 지우지 않는 것이다. 모든 줄이 머리말처럼 보이면(머리말만 있는 파일) 역시 원문을 그대로 둔다.
  - **말미를 자를 때 줄 중간에서 끊지 않는다** — 조각의 첫 줄바꿈 이후부터 시작해 잘린 반쪽 줄을 버린다.
  - **같은 파일 재첨부가 되게 한다** — 파일을 읽은 직후 `input.value`를 비운다. 비우지 않으면 같은 파일을 다시 골라도 `change`가 발생하지 않아 조용히 무시되는데, 채운 뒤 편집했다가 원본으로 되돌리는 흐름에서 실제로 걸린다.
  - **삭감 범위를 열거해 옆 화면으로 새지 않게 한다.** 지우는 것은 `CreatePersonaInput.images`, `buildPersonaPrompt`의 이미지 분기, 생성 시트의 세그먼트·드롭존·썸네일, `persona.create.tab*`·`image*` 5키뿐이다. `InlineImage`·`image.ts`·`generate(prompt, images?)`·`IMAGE_REQUEST_TIMEOUT_MS`·`toast.addImage`·`toast.imageLoadFail`·분석 탭 이미지 모드는 **모두 남긴다**(분석 탭이 쓴다).
  - **저장 스키마는 손대지 않는다.** 지우는 것은 저장되지 않는 입력 DTO의 선택 필드라 `DB_VERSION`은 1 그대로다. P5~P9 사이에 캡처로 만든 레코드의 `conversation`에는 플레이스홀더 문자열이 남아 있는데, 마이그레이션하지 않고 **평범한 문자열로 그대로** 표시한다.
  - **첨부한 파일은 저장하지도 업로드하지도 않는다.** 읽어서 입력란을 채우는 데만 쓰고 버린다. 전송되는 것은 입력란의 텍스트 하나다.

- 교훈: P5 문서가 정확도를 **"반증 못 함 — 미확정"** 으로 정직하게 남긴 것이 옳았다. 그 자리에 "괜찮을 것"이라고 적었다면 P5 관찰이 신호로 읽히지 않았을 것이다. 그리고 **관찰 결과로 자기 결정을 뒤집는 것이 이 워크플로의 정상 경로다** — P8 키 저장 매체에 이은 두 번째 사례이며, 두 번 다 뒤집은 근거는 새 취향이 아니라 재서 얻은 수치였다.

- 변경 예정 파일: `src/lib/chatFile.ts`(신규, `parseKakaoChatTail`), `src/lib/chatFile.test.ts`(신규), `src/lib/config.ts`(`PERSONA_CHAT_TAIL_CHARS = 16_000`), `src/lib/types.ts`(`CreatePersonaInput.images` 제거), `src/lib/prompts.ts`(`buildPersonaPrompt` 이미지 분기 제거), `src/lib/persona.ts`(`generate(prompt)` 텍스트 전용), `src/routes/PersonaPage.tsx`(단일 흐름 — textarea + .txt 첨부 버튼 + 사용 글자수 안내, 세그먼트·드롭존·썸네일 제거), `src/lib/i18n.ts`(`persona.create.attachFile`·`attachHint`·`attachedInfo`·`attachedInfoTrimmed`·`toast.chatFileReadFail` 추가 / `persona.create.tab*`·`image*` 5키 제거), `docs/PRD.md`(1.5)·`docs/TRD.md`(2.0)·`docs/DESIGN.md`(1.6)·`docs/PLAN.md`(2.2)

- 검증 계획(아직 **미실행** — TRD §9.9):
  - `npm test`(신규 `chatFile.test.ts` 포함) · `npx tsc --noEmit` · `npx vite build`
  - **파서 단위 검증** — 머리말 제거 / 머리말 없는 평문 통과 / 말미 컷의 줄 경계 보존 / `maxChars` 이하 짧은 입력 무변경 / CRLF 정규화
  - **.txt 첨부 실측** — 실제 카카오톡 대화 내보내기 파일로 ① 머리말 제거 후 대화 첫 줄부터 채워지는지 ② 상한을 넘으면 "원본 N자 중 최근 M자" 안내가 뜨고 M ≤ 16,000인지 ③ 첫 줄이 온전한 줄인지. 원본·사용 글자 수를 기록한다
  - **같은 파일 재첨부** — 첨부 → 편집 → 같은 파일 재첨부에서 다시 채워지는지
  - **붙여넣기 무회귀** — 파일 없이 붙여넣어 생성, 20자 미만 거부 토스트
  - **분석 탭 무회귀** — 텍스트/캡처 이미지 세그먼트·드롭존·썸네일·플레이스홀더 저장이 P9와 동일한지(삭감이 옆 화면으로 새지 않았는지)
  - **실키 생성 1회** — 첨부로 채운 텍스트로 생성. 11필드 파싱 여부와 **지연 실측**(Resource Timing), `vocabulary_examples`가 어미·표현 인용으로 채워지는지 관찰(표본 1이므로 정확도를 주장하지 않는다)
  - 기존 캡처 레코드 상세에서 플레이스홀더 문자열이 그대로 보이는지 / 주석 위생 grep
- 변경 파일(실제): `src/lib/chatFile.ts`(신규, parseKakaoChatTail), `src/lib/chatFile.test.ts`(신규, 7케이스), `src/lib/config.ts`(PERSONA_CHAT_TAIL_CHARS=16000), `src/lib/types.ts`(CreatePersonaInput 텍스트 전용), `src/lib/prompts.ts`(buildPersonaPrompt 이미지 분기 제거), `src/lib/persona.ts`(generate(prompt)), `src/lib/image.ts`(주석), `src/routes/PersonaPage.tsx`(단일 흐름 + .txt 첨부·글자수 안내·재첨부 input 초기화), `src/lib/i18n.ts`(persona.create.attach* + toast.chatFileReadFail, 이미지 모드 키 5개 삭제), `docs/TRD.md`·`docs/PLAN.md`(상태·§3.15 패턴·§10 실측)
- 검증:
  - `npm test` → Tests 45 passed (45) / `npx tsc --noEmit` → 0 에러 / `npx vite build` → js index-DqBYvWdh.js 557.70 kB │ gzip: 140.26 kB / 주석 위생 grep → 없음 / `InlineImage`·`fileToInlineImage` 사용처는 analysis·gemini·image·types·AnalyzePage에만(분석 탭 무회귀).
  - 브라우저(Playwright, dev `/persora/`, 유효 키) ① 큰 샘플(CRLF, 24,478자, 703줄): 첨부 → textarea **15,989자**(줄 경계 보존), 머리말 없음, 안내 "원본 24476자 중 최근 15989자만 사용했어요" → 같은 파일 재첨부 정상 → 생성 **Gemini 5.63s** → 레코드 conversation 15,989자, 나/상대 11필드, vocabulary 6개 모두 어미·표현 인용. ② 작은 샘플(1,331자, PC 내보내기 표기 "지수 님과 카카오톡 대화"): 첨부 → 머리말 제거 → 1,238자 → 생성 5.57s, 11필드. 콘솔 에러 0.
- 검증에서 발견해 고친 것(3단): 1차 — 머리말 패턴을 "…님과의 (카카오톡 )대화"로 두었다. 반증(작은 샘플 실측) — PC 내보내기 제목은 "OOO 님과 카카오톡 대화"(조사 '의' 없음)여서 첫 줄이 매칭되지 않아 머리말 전체가 남았다. 종합 — 정규식을 `님과(의)? (카카오톡 )?대화$`로 넓히고 테스트 케이스 추가(7번째). TRD §3.15 패턴 표 정정.
- 관찰(미확정): 안내 문구가 "원본 N자 중 최근 M자"로 머리말 제거와 tail 컷을 구분하지 않아, 잘리지 않았는데도 "만 사용했어요"처럼 읽힌다(작은 샘플 1331→1238). 문구 개선 여부는 후속.

## 2026-09-05 — [feat] P9 메시지 분석에 캡처 이미지 입력 지원 — 완료

- 배경/목적: 분석 탭은 최근 대화를 **텍스트로만** 받는다. 페르소나 생성에는 P5에서 캡처 이미지 모드를 넣었는데(§8 부속 결정 3) 분석에는 없어서, 같은 사용자가 같은 대화 앱에서 같은 제약을 만나는데 한쪽 화면에만 우회로가 있는 상태다. 분석 탭에도 텍스트/캡처 이미지 토글을 더한다. 계약: [PRD](./PRD.md) §4.3 FR-39·FR-40·§8 부속 결정 5·DR-4·R10, [TRD](./TRD.md) §3.1·§3.5·§3.8·§3.10·ADR-9·§9.8, [DESIGN](./DESIGN.md) §6·§10.1, [PLAN](./PLAN.md) §3·§4.

- **1차 사고**: 분석은 붙여넣기로 충분하다. 여기서 넣는 것은 "최근 대화 몇 줄"이고 페르소나 생성에 넣는 분량과 다르다. 카카오톡에서 몇 줄 복사하는 것은 어렵지 않다. 게다가 이미지 모드를 열면 파서·타겟 칩·드래프트가 통째로 동작하지 않는 두 번째 경로가 생긴다.

- **비판적 재사고**: 세 가지로 공격했다.
  - ① **"몇 줄 복사"의 비용을 과소평가했다.** 모바일 카카오톡에서 여러 말풍선을 가져오려면 말풍선을 길게 눌러 선택 모드로 들어가 하나씩 체크하고 복사해야 한다. 캡처는 버튼 조합 한 번이다. 주 사용 환경이 모바일인 제품에서 이 차이는 작지 않다 — **1차 사고의 전제가 깨졌다.**
  - ② **P5에서 미확정으로 남은 "캡처는 분량이 적다"가 여기서는 같은 무게가 아니다.** 페르소나 정확도는 인용할 발화가 얼마나 많은지에 좌우되지만(P5 관찰: 캡처 1장의 `vocabulary_examples` 5개 중 2개가 음식 명사), 분석이 필요로 하는 단기 맥락은 **화면 한 장 분량이 오히려 맞는 크기**다. 다만 이것은 논리적 근거이고 **표본으로 확인한 것은 아니다.**
  - ③ **반증하지 못한 위험**: 이미지 모드에서는 텍스트가 없어 `thread.ts` 파싱을 할 수 없다. 그래서 "이 메시지에 답장" 칩도 수동 교정 목록도 렌더할 수 없고, 모델이 말풍선의 좌/우 위치와 순서만 보고 마지막 상대 메시지를 판별해야 한다. **오판해도 사용자가 고칠 수단이 없다.** 이는 P6 재설계가 v1에서 되찾은 성질("앱이 답장 대상을 안다")을 이 모드에서만 다시 내려놓는 것이다. 적중률 표본은 없다.
  - ④ 지연: P5 실측에서 캡처 1장 페르소나 생성이 **4.95s**(JPEG 162 kB, base64 약 216 kB)로 텍스트 생성 6.57s와 같은 자리수였다. 분석도 같은 자리수를 기대하지만 **분석 프롬프트의 이미지 요청은 재 본 적이 없다** — 분석 프롬프트는 페르소나 JSON·말투 요약·말투 지시가 붙어 구성이 다르다.

- **종합**: 분석 탭에 텍스트/캡처 이미지 토글을 더한다. 텍스트가 기본, 이미지가 선택 모드다. 살아남은 근거는 ①("텍스트로는 넣기 번거롭거나 아예 넣을 수 없는 대화가 있다")이며 정확도와 무관하게 성립하고, ②가 이 화면 고유의 근거로 붙는다. **버리는 것은 명시한다** — 이미지 모드에서는 타겟 칩·수동 교정·스레드 드래프트가 동작하지 않으며, 이 셋을 텍스트 모드 전용으로 못 박았다(FR-29·FR-30·FR-32). ③의 오판 위험은 반증하지 못했으므로 **미확정 관찰 항목**으로 남긴다(PRD R10 / TRD §10 #27). ④의 지연도 미실측이다(TRD §10 #28).

  계약은 P5와 같은 방식으로 **가산만** 한다 — 선택 필드 1개(`AnalyzeReplyInput.images?`)와 프롬프트 분기 플래그 1개(`useImages`). 모델·타임아웃 상수·`AnalysisRecord` 스키마·`DB_VERSION`은 손대지 않고, `images`를 넘기지 않으면 P6~P8과 완전히 같은 요청이 나간다. 실패하면 이미지 코드만 되돌리면 텍스트 분석 경로가 그대로 남는다.

- 함께 정한 것:
  - **프롬프트 분기는 두 블록만** — 최근 대화 흐름 블록을 "첨부 캡처를 읽어라 + 말풍선 좌/우·이름표로 화자 구분 + 여러 장은 위→아래·앞→뒤"로, 답장 대상 지시를 "캡처 속 대화에서 상대의 마지막 메시지를 찾아내라"로 바꾼다. 나머지(페르소나 JSON·말투 지시·분석 질문·공감 가이드라인·의도 디렉티브·후보 3축·JSON 형식·언어 지시)는 두 모드가 완전히 같다. 출력 계약을 하나로 유지해 `analysis.ts`의 정규화·저장 코드가 분기하지 않게 하기 위함이다.
  - **의도 칩은 이미지 모드에서도 그대로** 동작한다. 의도는 스레드 텍스트와 무관한 입력이다.
  - **기록 저장 플레이스홀더** — 이미지 모드에는 앱이 아는 타겟 문장이 없어 `message`·`target_message`가 둘 다 비고 기록 목록 미리보기가 통째로 빈다. 그래서 두 자리에 `analyze.imagePlaceholder`("[채팅 캡처 이미지 {n}장으로 분석한 답장]")를 넣고 `thread`에는 `''`을 넣는다. 저장 시점 언어로 굳으며 UI 언어를 바꿔도 번역하지 않는다(P5의 `persona.create.imagePlaceholder`와 같은 취급). **캡처 이미지 자체는 저장하지 않는다** — 요청에만 쓰고 버린다.
  - **캡처는 드래프트에 넣지 않는다** — `drafts.ts`는 스레드 텍스트 전용으로 남긴다. 페르소나를 바꾸면 고른 캡처는 스레드·수동 타겟과 함께 비운다.
  - **i18n은 새 영역·새 토스트 키를 만들지 않는다** — 신규 키 5종은 모두 `analyze.*`에 두고, 0장 거부는 `toast.addImage`, 변환 실패는 `toast.imageLoadFail`을 재사용한다(P5에서 이미 만들었다).

- 변경 예정 파일: `src/lib/types.ts`(`AnalyzeReplyInput.images?`), `src/lib/prompts.ts`(`buildAnalyzePrompt`에 `useImages?` + 두 블록 분기), `src/lib/analysis.ts`(`analyzeReply` 이미지 분기·파싱 생략·플레이스홀더 저장), `src/routes/AnalyzePage.tsx`(입력 모드 세그먼트·드롭존·썸네일·모드별 검증), `src/lib/i18n.ts`(`analyze.tabText`·`tabImage`·`imageDropzone`·`imageHint`·`imagePlaceholder`), `docs/PRD.md`(1.4)·`docs/TRD.md`(1.8)·`docs/DESIGN.md`(1.5)·`docs/PLAN.md`(2.0)

- 검증 계획(아직 **미실행** — TRD §9.8):
  - `npm test` · `npx tsc --noEmit` · `npx vite build`
  - **텍스트 경로 무회귀** — 같은 스레드로 분석했을 때 타겟 칩·수동 교정·드래프트 복원·의도 칩이 그대로 동작하는지
  - UI 스모크(이미지 모드) — 모드 토글, 0장 제출 거부, 캡처 첨부 → 썸네일 → 개별 제거, 모드 왕복 시 양쪽 입력값 유지, 이미지 모드에서 타겟 칩·피커 미렌더
  - **실키 1회** — 실제 카카오톡 대화 캡처로 분석. 후보 3개 파싱 성공 여부와 **지연을 Resource Timing으로 실측**
  - **답장 대상 판별 관찰** — 위 호출에서 캡처의 맨 아래 상대 메시지에 답했는지 확인. 표본 1건의 관찰로만 적고 적중률은 주장하지 않는다
  - 기록 확인 — 목록 미리보기에 캡처 장수 플레이스홀더, 기존 텍스트 기록도 그대로 렌더
- 변경 파일(실제): `src/lib/types.ts`(AnalyzeReplyInput.images?), `src/lib/prompts.ts`(buildAnalyzePrompt useImages — 최근 대화 흐름·답장할 메시지 두 블록만 캡처 지시로 교체), `src/lib/analysis.ts`(이미지 모드: 파싱·타겟 검출 생략, generate(prompt, images), message/target_message에 플레이스홀더, thread ''), `src/routes/AnalyzePage.tsx`(텍스트/캡처 이미지 세그먼트, 드롭존·썸네일·힌트, 타겟 칩·피커·드래프트는 텍스트 모드 전용, 모드별 검증), `src/lib/i18n.ts`(analyze.tabText/tabImage/imageDropzone/imageHint/imagePlaceholder), `docs/TRD.md`·`docs/PLAN.md`(상태·실측)
- 검증:
  - `npm test` → Tests 38 passed (38) / `npx tsc --noEmit` → 0 에러 / `npx vite build` → js index-cSInXtsr.js 558.15 kB │ gzip: 139.87 kB / 주석 위생 grep → 없음. 코드 리뷰: 텍스트 모드 경로 무회귀, 이미지 모드에서 parseThread/detectTarget 미호출.
  - 브라우저(Playwright, dev `/persora/`, 유효 키): 페르소나 생성(텍스트) 4.88s → 분석 탭 → 캡처 이미지 모드 전환 → 실제 카카오톡 캡처 1장 첨부 → 썸네일 표시, "이 메시지에 답장" 칩·피커 미렌더(설계대로), 힌트에 Google 전송 고지 → 분석 → **Gemini 2.75s** → 심리 분석이 캡처 속 마지막 상대 메시지(점심 메뉴 공유)를 정확히 짚었고 후보 1이 그 메시지("설렁탕")에 답함 → 답장 대상 판별 정상(표본 1). 기록: `message`=`target_message`="[채팅 캡처 이미지 1장으로 분석한 답장]", `thread` 빈 문자열, `intent` 빈 값 → 후보 라벨 v1 3축(무회귀). 콘솔 에러 0.
- 미확정 유지: 이미지 모드 답장 대상 오판율(표본 1로는 판단 불가 — 실사용 관찰), 여러 장 캡처 지연.

## 2026-09-05 — [feat] P8 보안 점검·GitHub Pages 배포 — API 키 저장소 쿠키 → localStorage 전환, 설정 탭, CSP — 완료

- 배경/목적: 배포는 이 앱의 데이터가 제3자 호스트를 처음 지나가는 시점이다. 그래서 P8의 첫 항목을 "키가 브라우저 밖으로 나가는 경로가 있는가"로 잡고 실제로 다시 쟀다. 함께 넣는 것은 원래 P8 범위였던 설정 탭(백업·전체 삭제·개인정보/면책 고지), CSP·referrer meta, GitHub Pages 배포다. 계약: [PRD](./PRD.md) §4.7·§8 부속 결정 1·DR-2·DR-3·DR-8, [TRD](./TRD.md) §3.2·§3.3·§3.12·§3.13·§3.14·§6.4·§8.1·ADR-8, [DESIGN](./DESIGN.md) §1.1(C-2)·§7b·§10.1, [PLAN](./PLAN.md) §3·§4.

- **1차 사고**: P0 부속 결정 1 그대로다. 키는 쿠키 `pm_gemini_key`(1년, `SameSite=Lax`)에 둔다. 구현이 단순하고 새로고침·재방문에 유지되며, XSS 노출면은 localStorage와 동등하다고 판단했으니 배포를 앞두고도 바꿀 이유가 없다.

- **비판적 재사고(반증을 실측)**: P0의 2차 사고는 **"localStorage보다 위험한가"라는 비교 축 하나**만 세웠고, 쿠키의 정의적 속성 — 같은 사이트로 가는 **모든 요청에 브라우저가 자동으로 첨부한다** — 은 겨누지 않았다. 그것을 재생했다. 정적 서버(`dist/` 서빙, 8000)에 요청별 `Cookie` 헤더를 기록하는 미들웨어를 붙이고(키 값은 남기지 않고 이름·길이만), 새 Chromium 프로필로 접속해 온보딩에서 키를 저장한 뒤 새로고침과 로고 fetch를 냈다.

  | 시점 | 서버가 받은 요청 | 그중 키 쿠키가 실린 요청 |
  |---|---|---|
  | 키 저장 전 | 4건 | **0건** |
  | 키 저장 후 | 5건 | **5건** — `/`, `assets/index-*.js`, `assets/index-*.css`, `app-logo.png`(2회) |

  정적 자산 요청이 한 건도 빠짐없이 사용자 키를 서버로 실어 보냈다. GitHub Pages 같은 제3자 정적 호스트도 **매 요청마다 키를 수신하며 접근 로그에 남을 수 있다.** 이 결과는 두 서술을 거짓으로 만든다 — 온보딩 문구 "키와 모든 데이터는 이 브라우저에만 저장되며 서버로 전송되지 않습니다"(`onboarding.intro`)와 PRD DR-2·DR-3("우리 서버로 가는 요청은 정적 자산 요청뿐"). 쿠키를 유지한 채 막을 방법도 없다: `SameSite`는 **교차 사이트** 요청을 막는 것이라 같은 사이트인 우리 자산 요청은 그대로 통과하고, `HttpOnly`는 JS가 키를 읽어 Gemini를 불러야 하므로 애초에 불가다. 반면 localStorage 값은 어떤 요청에도 자동으로 실리지 않으며, XSS 노출면은 P0의 판단대로 쿠키와 동등하다.

- **종합**: API 키 저장소를 **localStorage `pm_gemini_key`로 전환한다.** 근거는 비대칭 하나다 — 두 매체의 XSS 노출면은 같은데 쿠키에만 자동 전송 경로가 붙어 있고 끌 수단이 없다. 개발 기기에 남은 쿠키는 최초 읽기에서 한 번 localStorage로 옮기고 만료시킨다(공개 배포 전이라 실제 사용자 데이터는 없지만 잔존 쿠키는 계속 요청에 실린다). 온보딩·설정 고지 문구도 사실대로 고친다. 남기는 교훈은 매체 선택이 아니라 **2차 사고의 사각**이다 — "대안보다 나쁜가"만 물었고 "이 매체가 스스로 무엇을 하는가"를 묻지 않았다.

- 함께 확정한 것(원래 P8 범위):
  - **설정 탭(4번째 탭)** — 백업 내보내기(JSON: 페르소나·분석 기록·스레드 드래프트, **API 키 제외**), 백업 가져오기(같은 id 덮어쓰기, 검증 후 쓰기), 전체 로컬 데이터 삭제(키·페르소나·기록·드래프트, confirm), 개인정보·면책 고지 상시 노출. DESIGN §1.1(C)의 "탭 3개 고정, 추가 요구 시 갱신"을 이 시점에 갱신했다(§1.1 C-2): 헤더 톱니 진입점도 검토했으나 헤더가 이미 차 있고(360px 앱명 잘림 전례), 무엇보다 고지·삭제는 **발견 가능해야** 하므로 탭으로 둔다.
  - **`index.html` meta** — CSP(`default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://generativelanguage.googleapis.com https://*.googleapis.com; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests`)와 `referrer no-referrer`. **GitHub Pages는 응답 헤더를 바꿀 수 없어** meta가 유일한 수단이다(`frame-ancestors`·`report-uri`는 meta에서 무시되므로 포기).
  - **GitHub Pages 프로젝트 사이트 배포** — URL `https://littleanti.github.io/persora/`, `vite.config.ts` `base: '/persora/'`, `.github/workflows/deploy-pages.yml`(main push → `npm ci` → `npm run build` → dist 업로드 → Pages). 하위 경로에서 깨지는 절대 경로 자산은 `src/lib/assets.ts`(`import.meta.env.BASE_URL` 기반)와 `index.html`의 `./` 상대 경로로 해결.
  - **README** — 배포 URL·workflow, 개인정보 절, 키 제한 안내(Google Cloud에서 사용 API를 Gemini API로 제한; referrer 제한은 효과가 제한적임을 함께).

- 변경 예정 파일: `src/lib/config.ts`(`API_KEY_STORAGE_KEY`·`LEGACY_COOKIE_KEY_NAME`), `src/lib/repos/settingsRepo.ts`(localStorage + 레거시 쿠키 1회 이전), `src/lib/dataManagement.ts`(신규), `src/lib/drafts.ts`(`listThreadDrafts`/`importThreadDrafts`/`clearAllThreadDrafts` 가산) + `src/lib/drafts.test.ts`, `src/routes/SettingsPage.tsx`(신규), `src/App.tsx`(탭 4개·`/settings`·로고 경로), `src/lib/assets.ts`(신규), `src/lib/i18n.ts`(`settings.*`·`nav.settings`·`common.saving`, `onboarding.intro` 정정), `index.html`(CSP·referrer meta, 아이콘 상대 경로), `vite.config.ts`(base), `.github/workflows/deploy-pages.yml`(신규), `README.md`, `docs/PRD.md`(1.3)·`TRD.md`(1.6)·`DESIGN.md`(1.4)·`PLAN.md`(1.8)

- 검증 계획(아직 **미실행**):
  - **쿠키 프로브 재실행** — 전환 후 우리 서버가 받은 요청 중 키를 실은 요청이 0건인지. 저장 전 0/4 · 저장 후 5/5였던 같은 절차를 그대로 돌린다
  - 레거시 쿠키 1회 이전 — 쿠키에 키를 심어 둔 프로필로 접속 → localStorage에 키가 생기고 `document.cookie`에서 사라지며 헤더 인디케이터가 유지되는지
  - `npm test` · `npx tsc --noEmit` · `npx vite build`
  - UI 스모크 — 설정 탭 진입, 백업 내보내기(파일에 키 없음 확인) → 전체 삭제(온보딩 모달 재등장) → 가져오기(페르소나·기록·드래프트 복원)
  - CSP — 빌드본과 `npm run dev` 양쪽 콘솔의 CSP 위반. dev(HMR)와 충돌하면 사실대로 기록한다
  - `npm audit` — 결과를 사실대로 기록
  - 배포 확인 — `main` push 후 Pages URL에서 A1~A4 재확인. push 전에는 **미확정**으로 남긴다
- 변경 파일(실제): `src/lib/config.ts`(API_KEY_STORAGE_KEY·LEGACY_COOKIE_KEY_NAME, 쿠키 상수 제거), `src/lib/repos/settingsRepo.ts`(localStorage + 레거시 쿠키 1회 이전·만료, 접근 실패 시 메모리 폴백), `src/lib/drafts.ts`(+listThreadDrafts/importThreadDrafts/clearAllThreadDrafts) · `src/lib/drafts.test.ts`(+8), `src/lib/dataManagement.ts`(신규), `src/lib/assets.ts`(신규), `src/routes/SettingsPage.tsx`(신규), `src/App.tsx`(탭 4개·/settings), `src/components/OnboardingModal.tsx`(로고 경로), `src/lib/i18n.ts`(settings.* 20키, onboarding.intro 정정), `index.html`(CSP·referrer meta, 상대 경로 아이콘), `vite.config.ts`(base `/persora/`), `.github/workflows/deploy-pages.yml`(신규), `server/index.js`(`/persora` 마운트·SPA 폴백·`/`→`/persora/` 302), `README.md`, `package-lock.json`(npm audit fix), `docs/TRD.md`·`docs/PLAN.md`(상태·§10 정정)
- 구현 중 결정: 로컬 미리보기 서버는 dist를 base 하위(`/persora/`)에 마운트한다 — 루트에 마운트하면 빌드본의 `/persora/assets/…` 경로가 404가 되어 앱이 깨진다(README 접속 주소를 `http://localhost:8000/persora/`로). 온보딩·설정 고지 문구는 현 시점 사실(생성 시 텍스트/캡처, 분석 시 페르소나·대화 텍스트 전송)에 맞춰 조정.
- 검증:
  - `npm test` → Tests 38 passed (38) / `npx tsc --noEmit` → 0 에러 / `npx vite build` → js index-BlE1N8oX.js 555.37 kB │ gzip: 139.36 kB. `dist/index.html`의 자산 경로가 `/persora/assets/…`인지 확인. `node server/index.js`: `/persora/` 200, `/` 302→`/persora/`, `/persora/app-logo.png` 200. 주석 위생 grep → 없음, `document.cookie` 사용은 settingsRepo의 레거시 이전 2곳만.
  - **쿠키 프로브 재실행(같은 방법, 빌드본을 `/persora/`에 서빙)**: 키 저장 후 정적 호스트로 간 요청 5건 중 키를 실은 요청 **0건**(변경 전 5/5). `document.cookie`에 키 없음.
  - 브라우저(Playwright, dev 서버 `/persora/`): 레거시 쿠키만 있는 상태로 진입 → localStorage `pm_gemini_key`로 이전되고 쿠키 제거, 온보딩 미표시·헤더 "Gemini 준비됨". CSP·referrer meta 존재. 설정 탭: 백업 내보내기 → `persora-backup-YYYY-MM-DD.json` 다운로드(키 `app/version/exported_at/personas/analyses/drafts`, API 키 문자열 미포함) → 같은 파일 가져오기 → "백업을 가져왔습니다: 페르소나 0개, 기록 0개, 드래프트 0개" → 전체 데이터 삭제(confirm) → localStorage 키 없음·드래프트 0·온보딩 재등장. 콘솔 에러 0.
  - CSP와 dev 서버(HMR) 충돌(TRD §10 #22): dev 서버에서 앱 렌더 정상, CSP 위반 콘솔 메시지 0(Chromium) → **충돌 없음(확인)**.
  - `npm audit fix`(비강제): 12건(low 1·moderate 8·high 3) → **7건(모두 moderate)**. 남은 7건은 vite 5→8, react-router-dom 6→7 등 major 업그레이드가 필요한 항목(esbuild via vite, qs via express, react-router). 판단: express/qs는 로컬 미리보기 서버 전용(번들 미포함), react-router 건은 HashRouter·고정 경로·SSR 없음으로 해당 경로 미사용 → 수용하고 TRD §10에 기록.
- 미확정: 실제 GitHub Pages 배포 URL에서의 A1~A4 재확인은 `main` push 후 workflow 실행이 필요해 이 브랜치에서는 미실행. 실기기(A6) 미실행.

## 2026-09-05 — [fix] P7-3 페이지 오버레이(백드롭)가 화면 최상단 20px를 덮지 않음 — 완료

- 증상/재현(실측): 상세 모달이 열린 상태에서 `fixed inset-0` 오버레이의 `getBoundingClientRect().top = 20`, computed `margin-top = 20px`, 부모는 `<section class="max-w-2xl mx-auto px-4 py-6 space-y-5">`. `document.elementFromPoint(200, 2)`가 오버레이가 아니어서 헤더 윗부분이 덮이지 않는다(P3에서 스크린샷으로 관찰한 것과 동일, TRD §10 #13 / DESIGN U17).
- 1차 사고: z-index나 sticky 헤더가 오버레이 위에 그려지는 문제일 것이다.
- 비판적 재사고: 오버레이의 `top`은 0인데 실제 위치가 20이라면 겹침 순서가 아니라 **배치**의 문제다. Tailwind `space-y-5`는 `> * + *`에 `margin-top: 1.25rem`(20px)을 주입하고, margin은 `position: fixed` 요소도 밀어낸다. 오버레이가 section의 비-첫 자식으로 렌더되어 정확히 20px 내려간다. 반증: 온보딩 모달(App.tsx, `space-y` 없는 컨테이너 직속)은 같은 마크업인데 top 0 — 가설과 일치. 대안 ① 오버레이에 `!mt-0` — 부모 규칙에 기대는 땜질이고 다른 부모로 옮기면 재발. ② `createPortal(document.body)`로 레이아웃 트리에서 분리 — 부모 CSS 영향을 구조적으로 차단.
- 종합: ②. PersonaPage의 오버레이 3개(생성 시트·상세 모달·상세 로딩)를 body 포털로 렌더한다. 규칙화: 페이지 안에서 `fixed` 오버레이를 렌더할 때는 항상 포털(DESIGN §2.6).
- 변경 예정 파일: `src/routes/PersonaPage.tsx`, `docs/DESIGN.md`, `docs/TRD.md`
- 검증 계획: 오버레이 top 0·`elementFromPoint(200, 2)`가 오버레이, 백드롭 닫기·X 닫기 정상, 닫은 뒤 body에 포털 잔존 노드 0, tsc/build/test.
- 변경 파일(실제): `src/routes/PersonaPage.tsx`(오버레이 3개를 `createPortal(document.body)`로 렌더; 닫기 판정·내부 마크업은 그대로), `docs/TRD.md`·`docs/DESIGN.md`·`docs/PLAN.md`(상태 종결)
- 검증: `npm test` → 4 files, 30/30 통과 / `npx tsc --noEmit` → 0 에러 / `npx vite build` → js 544.45 kB(gzip 136.37 kB), 83 modules. 브라우저 실측(Playwright, 390×844): 오버레이 `top = 0`, `margin-top = 0px`, 부모 = `BODY`, `elementFromPoint(200, 2)`가 오버레이 안(헤더까지 덮임). 드래그 후 백드롭에서 손 떼기 → 시트 유지(P7-1 무회귀), X 닫기 → 닫힘, 닫은 뒤 body에 잔존 노드 0, 백드롭 탭 → 닫힘.

## 2026-09-05 — [fix] P7-2 LAN IP(http)로 접속하면 페르소나 생성이 "crypto.randomUUID is not a function"으로 실패 — 완료

- 증상/재현(실측): 같은 Wi-Fi 휴대폰 시나리오를 재현하기 위해 `http://192.168.47.1:4121`로 접속 → `window.isSecureContext = false`, `typeof crypto.randomUUID = "undefined"`, `uuid()` 호출 시 "crypto.randomUUID is not a function". `http://localhost:4121`에서는 정상.
- 1차 사고: 휴대폰 브라우저가 오래되어 API가 없는 것이다.
- 비판적 재사고: 같은 브라우저에서 localhost는 되고 LAN IP는 안 된다면 브라우저 버전 문제가 아니다. `crypto.randomUUID`는 **보안 컨텍스트(HTTPS 또는 localhost)에서만 노출**되는 API다. 반면 `crypto.getRandomValues`는 비보안 컨텍스트에서도 있다(재현에서 `function` 확인). 프로덕션(GitHub Pages, HTTPS)에서는 재현되지 않겠지만 개발·LAN 테스트 경로가 막히고, HTTP로 서빙되는 어떤 배포에서도 재발한다.
- 종합: `randomUUID` → `getRandomValues` 기반 RFC 4122 v4 → `Math.random` 순 폴백. 마지막 폴백은 충돌 확률이 높지만 단일 사용자 로컬 DB 키로는 허용한다(문서에 명시). `id.test.ts`로 형식과 폴백 경로를 검증한다.
- 변경 예정 파일: `src/lib/id.ts`, `src/lib/id.test.ts`(신규), `docs/TRD.md` §3.9
- 검증 계획: `npm test`(id 테스트), LAN IP 재접속 후 `uuid()`가 v4 형식 문자열을 반환, tsc/build.
- 변경 파일(실제): `src/lib/id.ts`(randomUUID → getRandomValues 기반 v4 → Math.random 폴백), `src/lib/id.test.ts`(신규, 4케이스: 현재 환경 v4 / randomUUID 없는 환경 / crypto 없는 환경 / 100회 중복 없음)
- 검증: `npm test` → 4 files, 30/30 통과(id 4 포함) / tsc 0 / build 성공. LAN IP `http://192.168.47.1:4121` 재접속(비보안 컨텍스트, `crypto.randomUUID` undefined 그대로): `uuid()` 5회 모두 v4 형식, 중복 없음. `localhost`에서는 여전히 표준 API 경로(무회귀).

## 2026-09-05 — [fix] P7-1 모달 안에서 텍스트를 드래그하다 백드롭에서 손을 떼면 모달이 닫힘 (+ ErrorBoundary) — 완료

- 증상/재현(실측): 생성 시트의 대화 textarea에서 mousedown → 텍스트를 선택하며 포인터를 시트 바깥(백드롭)으로 이동 → mouseup. mouseup 지점의 요소 = 백드롭 div(`fixed inset-0 bg-slate-900/40 …`), 결과: **시트가 닫히고 입력이 사라짐**(Playwright 마우스 이벤트로 재현).
- 1차 사고: 백드롭은 `onClick`에서 `target === currentTarget`일 때만 닫는다. 드래그는 클릭이 아니니 관련이 없을 것이다.
- 비판적 재사고: DOM `click` 이벤트는 mousedown 요소와 mouseup 요소의 **가장 가까운 공통 조상**에서 발생한다. textarea에서 누르고 백드롭에서 떼면 공통 조상이 백드롭이므로 `click.target === currentTarget`이 참이 되어 "진짜 백드롭 클릭"과 구분되지 않는다. 대안 ① mouseup 위치만 검사 — 같은 결과. ② pointer-down이 백드롭에서 시작했는지 기억해 두고 click 때 그 플래그와 target 조건을 함께 요구 — 누름과 뗌이 모두 백드롭인 경우에만 닫힌다.
- 종합: ②를 생성 시트·상세 모달 양쪽에 적용. 아울러 "UI가 통째로 사라진다"는 증상은 렌더 예외로도 생길 수 있어 `ErrorBoundary`를 `main.tsx`에 안전망으로 둔다(현재 렌더 예외가 발생한 증거는 없음 — 예방 조치임을 명시).
- 변경 예정 파일: `src/routes/PersonaPage.tsx`, `src/components/ErrorBoundary.tsx`(신규), `src/main.tsx`, `docs/DESIGN.md` §9, `docs/TRD.md` §3.10
- 검증 계획: 같은 드래그 시나리오 재실행 → 시트 유지·입력 보존; 백드롭에서 누르고 떼기 → 닫힘; X 닫기 정상; tsc/build/test.
- 변경 파일(실제): `src/routes/PersonaPage.tsx`(생성 시트·상세 모달 백드롭에 `onMouseDown` 플래그 + `onClick` 판정), `src/components/ErrorBoundary.tsx`(신규), `src/main.tsx`
- 검증: `npm test` → 4 files, 30/30 통과 / `npx tsc --noEmit` → 0 에러 / `npx vite build` → js 544.36 kB(gzip 136.33 kB), 83 modules. 브라우저(Vite dev, Playwright)에서 재현 시나리오 재실행: textarea에서 mousedown → 텍스트 선택 → 백드롭에서 mouseup → **시트 유지, 입력 27자 보존**. 백드롭에서 누르고 뗌 → 닫힘. X 닫기 정상. `main.tsx`에 ErrorBoundary 연결 확인(인위적 렌더 예외 주입 테스트는 하지 않아 실제 복구 UI 동작은 미확정).
- 남은 미확정: ErrorBoundary 문구는 ko 고정 문자열(DESIGN §10.1에 오류 화면 영역이 없어 키를 새로 만들지 않음) — i18n 키로 뺄지 P8 이후 판단.

## 2026-09-05 — [feat] P6-2 분석 단계 재설계(2/2) — 스레드 드래프트·타겟 수동 교정·페르소나 추가 대화 업데이트 — 완료

- 배경/목적: P6-1이 만든 입력 계약 위에 재입력 부담(드래프트)과 타겟 오검출(수동 교정), 정적 페르소나의 갱신 수단(추가 대화로 수동 업데이트)을 얹는다. 계약: TRD §3.12 · §3.8 · §3.7 · §3.1, DESIGN §6 · §5.3.
- 변경 파일: `src/lib/drafts.ts`(신규: getThreadDraft/setThreadDraft/clearThreadDraft, 키 `pm_thread_draft:<personaId>`, 접근 실패 시 폴백), `src/lib/drafts.test.ts`(신규, 10케이스 — 인메모리 스텁·throw 스텁), `src/lib/types.ts`(PersonaRecord.updated_at?), `src/lib/persona.ts`(updatePersona), `src/routes/AnalyzePage.tsx`(페르소나 전환 시 드래프트 복원·입력 시 자동 저장, 파싱 라인 피커), `src/routes/PersonaPage.tsx`(상세 모달 "추가 대화로 업데이트"), `src/lib/i18n.ts`, `docs/PLAN.md`
- 구현 중 결정: `analysis.ts`의 targetOverride 우선 규칙은 P6-1에서 이미 계약대로 들어가 있어 변경 없음(PLAN 체크만). 드래프트 백업·일괄 삭제 헬퍼는 두지 않음(그런 화면이 아직 없다). 피커의 내 발화 라벨 폴백 "나"는 ko/en 공통 문자열 — 미확정(en에서도 "나"로 보임, DESIGN에 키 없음).
- 검증:
  - `npm test` → 3 files, **26/26 통과** / `npx tsc --noEmit` → 0 에러 / `npx vite build` → index.html 0.83 kB │ gzip: 0.43 kB / index-DzKE-_IT.css 21.84 kB │ gzip: 4.87 kB / index-BY0hTab_.js 542.43 kB │ gzip: 135.57 kB (82 modules transformed) / 주석 위생 grep → 없음
  - UI 스모크(Vite dev, Playwright 390×844, 유효 키): 지수 선택 → 스레드 6줄 입력 → localStorage `pm_thread_draft:<지수 id>` 192자 저장 확인 → 친구로 전환하면 textarea 비고(친구 드래프트 없음) → 지수로 복귀하면 192자 복원 → 전체 새로고침 후 첫 페르소나(친구)가 기본 선택이라 비어 있다가 지수 선택 시 다시 192자 복원(드래프트는 페르소나별로 영속, 선택 상태는 메모리).
  - 타겟 피커: "다른 메시지에 답장하기 ▾" → 파싱 라인 목록에서 "다음 프로젝트 리드 맡아보라는데…" 선택 → 칩 갱신 → 분석(의도 미지정) → **Gemini 4.51s** → 기록 `target_message`·`message`가 선택한 줄과 일치, `thread` 192자 저장, `intent` 빈 값, 후보 라벨은 v1 3축 그대로(무회귀 재확인).
  - 추가 대화로 업데이트: 상세 모달에서 6줄 추가 → "업데이트" → **Gemini 6.38s** → "지수 페르소나를 업데이트했어요" 토스트, 레코드 `id`·`created_at` 유지, `updated_at` 기록, `conversation` 1,230자로 증가(추가분 포함), 요약·자주 쓰는 표현이 재생성됨.

## 2026-09-05 — [feat] P6-1 분석 단계 재설계(1/2) — 최근 대화 스레드·자동 타겟·답장 의도 + vitest 도입 — 완료

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

- P6-1 변경 파일(실제): `src/lib/thread.ts`(신규), `src/lib/thread.test.ts`(신규, 15케이스), `src/lib/gemini.test.ts`(신규, extractJson 4경로), `src/lib/types.ts`(가산 필드·ReplyIntentKey·REPLY_INTENTS·AnalyzeReplyInput), `src/lib/prompts.ts`(buildAnalyzePrompt v2 + intentDirective), `src/lib/analysis.ts`(analyzeReply, analyzeMessage는 래퍼), `src/routes/AnalyzePage.tsx`(스레드 textarea·타겟 칩·의도 칩·직접 입력), `src/lib/i18n.ts`(analyze.thread*/target*, intent.*; 미사용 키 2개 제거), `package.json`·`package-lock.json`(vitest ^3.2.7, `npm test`), `vite.config.ts`(test.include를 `src/**/*.test.ts`로 한정 — 테스트 수집 범위를 `src/**`에 고정), `docs/TRD.md`(§10 #20 실측), `docs/PLAN.md`
- P6-1 검증:
  - `npm test` → 2 files, **16/16 통과** / `npx tsc --noEmit` → 0 에러 / `npx vite build` → index.html 0.83 kB │ gzip: 0.43 kB / index-DZpy6KgT.css 21.69 kB │ gzip: 4.85 kB / index-CAN2Ugvv.js 538.74 kB │ gzip: 134.67 kB (81 modules transformed) / 주석 위생 grep → 없음
  - 코드 리뷰: 의도가 비어 있으면 후보 축·라벨이 v1과 동일(무회귀). 타겟 = 마지막 상대 발화, 없으면 끝줄.
  - UI 스모크(Vite dev, Playwright 390×844, 유효 키, 페르소나 지수/현우): 스레드 6줄 붙여넣기 → "이 메시지에 답장" 칩이 상대의 마지막 발화(주말에 와서 기획안 봐달라는 요청)를 정확히 표시 → 의도 "정중한 거절" → **Gemini 3.86s** → 후보 3개가 모두 요청을 부드럽게 거절("이번 주는 선약이 있어서…", "톡으로 보내봐 짬 날 때 볼게", "다음엔 내가 맛있는 거 쏠 테니") — 라벨은 의도에 맞게 생성됨("부드럽고 완곡하게 / 솔직하고 분명하게 / 따뜻한 유머를 곁들여"). 말투(반말, ㅠㅠ/ㅋㅋ)는 유지. → **의도 스티어링 실측 확인(표본 1)**. 기록에는 `message`=타겟 메시지가 저장되어 기록 탭은 코드 변경 없이 동작.

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
