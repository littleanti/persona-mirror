# DESIGN — Persora 화면·인터랙션 설계

> 문서 버전: 1.7 · 갱신일: 2026-09-05 · 상태: P11 최종 — 코드 최종 상태와 대조 완료

## 문서 이력
| 버전 | 날짜 | 변경 |
|---|---|---|
| 0.1 | 2026-09-05 | 초안 |
| 0.2 | 2026-09-05 | P3 착수: 콘텐츠 폭 `max-w-2xl`(D1·§3), 생성 실패 행에 원문 보존 저장 반영(§5.2) |
| 0.3 | 2026-09-05 | 표시명 Persora 확정(머리말 주석, 와이어프레임 앱명, U1 종결) |
| 1.0 | 2026-09-05 | M1 기준선: §5.1 헤더 버튼 문구를 구현과 일치시킴, §10.1 키 영역에 `btn.*` 추가, "0.1 범위" 표현을 M1 기준으로 정리, §12 미확정 정리 + 상세 모달 백드롭 관찰 추가 |
| 1.1 | 2026-09-05 | P5 착수: §5.2 생성 시트에 입력 모드 세그먼트·드롭존·썸네일 그리드·이미지 모드 검증 순서 추가, §5.3 이미지 모드의 원본 대화 표시 정정, §8.2 로딩에 이미지 요청 180초, §10.1 `persona.create.*`·`toast.*` 신규 키, §12에 U18~U20 추가 |
| 1.2 | 2026-09-05 | P6 착수(분석 재설계): §5.3 상세 모달에 "추가 대화로 업데이트" 블록, §6을 v2 화면으로 재작성(스레드 textarea·타겟 칩·타겟 피커·의도 칩 6종 + 직접 입력·검증 순서), §7 기록 미리보기 문구 정정, §9 "입력 유지" 규칙에 스레드 드래프트 예외, §10.1 신규 키(`intent.*` 영역 추가, `analyze.thread*`/`analyze.target*`/`analyze.pickTarget*`/`analyze.intentLabel`/`persona.detail.update*`/`toast.*`), §12 U21~U24 추가 및 단계 번호 재편(안정화 P6→P7, 배포 P7→P8) |
| 1.3 | 2026-09-05 | P7 착수: §9 백드롭 닫기 판정(pointer-down 기준), §2.6 포털 규칙, U17 원인 확정 |
| 1.4 | 2026-09-05 | P8 착수(보안 점검·배포): §1.1(C) 탭 결정을 4개로 갱신(3단 사고), §3 셸 와이어프레임·탭 아이콘, §4 온보딩 intro 문구 정정(localStorage/IndexedDB), **신규 §7b 탭 4 — 설정**(개인정보·면책 카드, 백업 내보내기/가져오기, 전체 삭제), §8.2 로딩·§8.5 확인 대화상자 갱신, §10.1 `settings.*` 영역 추가(13→14종), §12 U3 종결·U25~U28 추가 |
| 1.5 | 2026-09-05 | P9 착수(분석 이미지 입력): §6 와이어프레임에 입력 모드 세그먼트 + 이미지 모드 와이어프레임 추가, §6.1에 세그먼트·모드 전환·드롭존·썸네일·힌트 행 추가 및 타겟 칩·피커·되돌리기를 **텍스트 모드 전용**으로 명시, §6.2 검증 순서를 모드별로 재작성, §6.3 드래프트에 텍스트 모드 한정 단서, §10.1 `analyze.tabText`·`tabImage`·`imageDropzone`·`imageHint`·`imagePlaceholder` 추가, §12 U29~U31 |
| 1.7 | 2026-09-05 | P11 최종 동기화: **신규 §0 화면 최종 상태**, §5.2 와이어프레임의 첨부 안내 문구 위치를 구현대로 정정, §10.1에서 존재하지 않는 키 2개 정정(`onboarding.saveKey`→`btn.saveKey`, `analyze.copied`→`toast.copied`)과 완료된 정리 항목의 시제 정리, **§11 안전 영역·§12 U5를 "미구현"으로 정정**(`env(safe-area-inset-bottom)`이 코드 어디에도 없다), §12를 종결/남은 미확정으로 정리 |
| 1.6 | 2026-09-05 | P10 착수(페르소나 입력 재평가): **§5.2 생성 시트를 단일 흐름으로 재작성**(입력 모드 세그먼트·드롭존·썸네일 그리드 삭제 → 대화 파일 첨부 버튼 + 첨부 안내 문구 추가, 검증·로딩·성공·실패 행 정리), §5.3 원본 대화 행에서 이미지 모드 규칙 제거(구 레코드의 플레이스홀더는 문자열 그대로 표시), §8.2 로딩에서 생성 시트의 180초 단서 제거, §10.1 `persona.create.*` 정리(tab*·image* 5키 삭제, attach* 4키 + `toast.chatFileReadFail` 추가), §6 도입부·§6.1 교차 참조 정정(세그먼트·드롭존 규칙의 단일 출처를 §6.1로), §12 U18~U20 종결 + U32·U33 신규 |

관련 문서: 제품 요구는 [`./PRD.md`](./PRD.md), 모듈 계약·저장·LLM 호출은 [`./TRD.md`](./TRD.md), 단계 계획은 [`./PLAN.md`](./PLAN.md), 변경 이력은 [`./LOG.md`](./LOG.md). 이 문서는 **현재 시점의 설계 상태**만 서술하고, 변경 사유·이력은 LOG에 남긴다.

> 표시명: **Persora**(한·영 동일 표기). 초기 코드네임 "Persona Mirror"를 M1 직전에 교체했다 — 표시 문구는 i18n `app.title`·`onboarding.welcomeTitle` 두 곳에서만 바꿨다.

---

## 0. 화면 최종 상태 (P11)

여러 단계에 걸쳐 화면이 늘고 줄었으므로, 각 화면이 **지금 어떤 모습인지**를 먼저 한 표로 못 박는다. 상세 규칙은 각 절이 단일 출처다.

| 화면 | 최종 상태 | 절 |
|---|---|---|
| 셸 | 상단바(로고·앱명·키 인디케이터·한/EN 토글) + **하단 탭 4개**(페르소나 / 분석하기 / 기록 / 설정) + 온보딩 게이트 + 토스트. HashRouter, `#/` → `#/personas` | §3 |
| 온보딩 모달 | 키 입력 + 발급 링크 + 저장 동의 체크박스. **닫기 수단 없음.** 사전 검증 호출 없음 | §4 |
| 탭 1 페르소나 | 목록·빈 상태 CTA / 생성 바텀 시트는 **단일 흐름**(이름 두 칸 + `.txt` 첨부 버튼 + 대화 textarea 하나 + 첨부 안내) / 상세 모달(나·상대 탭, 11항목, 원본 대화 토글, 추가 대화로 업데이트, 삭제). **P5~P9의 입력 모드 세그먼트·드롭존·썸네일은 P10에서 사라졌다** | §5 |
| 탭 2 분석하기 | 페르소나 칩 + **입력 모드 세그먼트(텍스트 / 캡처 이미지)**. 텍스트 모드는 스레드 textarea·자동 타겟 칩·수동 타겟 피커·드래프트, 이미지 모드는 드롭존·썸네일·힌트. **의도 칩 6종 + 기본 + 직접 입력은 두 모드 공통.** 결과는 분석 카드 1장 + 후보 3장 | §6 |
| 탭 3 기록 | 최신순 카드 목록, 아코디언 펼침(분석 + 후보 3, 복사 버튼 없음), 개별 삭제 | §7 |
| 탭 4 설정 | 카드 3장 — 데이터 관리(내보내기·가져오기·전체 삭제) / 개인정보와 보안 5항목 / 면책. 입력 필드도 LLM 호출도 없다 | §7b |
| 오류 복구 화면 | `ErrorBoundary`가 렌더 예외를 잡아 안내 + 새로고침 버튼을 보여준다. **문구는 ko 고정 문자열이며 i18n 키가 없다**(§12) | §12 |

---

## 1. 디자인 원칙

| # | 원칙 | 구체적 규칙 |
|---|---|---|
| D1 | **모바일 우선** | 기준 뷰포트 390×844(iPhone 급). 콘텐츠는 `max-w-2xl`(672px) 중앙 정렬, 하단 탭바와 시트는 `max-w-lg`(512px). 모바일에서는 셋이 모두 화면 폭과 같고, 데스크톱에서만 콘텐츠가 탭바보다 조금 넓다(항목 카드·대화 입력란 가독성). 주 행동 버튼은 엄지 영역(하단·우측)에 둔다. |
| D2 | **한 화면 한 작업** | 탭 하나 = 작업 하나(페르소나 관리 / 메시지 분석 / 기록 조회). 보조 작업(생성·상세)은 오버레이(시트·모달)로 열고 닫으면 원래 화면으로 돌아간다. 화면 간 중첩 내비게이션(깊이 2 이상)은 두지 않는다. |
| D3 | **대화 입력은 크게** | 대화 기록·받은 메시지 textarea는 카드 폭 100%, 최소 5행(분석)·시트 남은 높이 전체(생성). 입력이 이 앱의 핵심 행위이므로 입력창을 절대 접지 않는다. |
| D4 | **결과는 카드** | LLM 결과는 "분석 1장 + 후보 3장" 카드로 고정. 후보 카드는 번호·라벨·이유·답변·복사 버튼의 순서를 항상 같게 둔다. 결과가 길어도 카드 밖으로 넘치지 않게 `whitespace-pre-wrap`으로 접는다. |
| D5 | **오류를 숨기지 않음** | 실패는 토스트로 **실제 오류 문구**를 보여준다(TRD의 `gemini.ts`가 사용자 친화 문구로 변환한 결과를 그대로). 조용한 실패·무한 로딩을 두지 않는다. |
| D6 | **텍스트 렌더링만** | 사용자·LLM 출력은 React 텍스트 노드로만 렌더한다(`dangerouslySetInnerHTML` 금지). 강조는 i18n 문구 구조로 처리하고 HTML을 문구에 넣지 않는다. 키가 브라우저에 있는 구조라 XSS 표면을 최소화해야 한다(TRD 보안 항목과 연동). |
| D7 | **라이트 단일 테마** | `color-scheme: light` 고정. 다크 모드는 M1 범위의 비목표. |

### 1.1 주요 설계 선택의 근거 (3단 사고)

**(A) 페르소나 생성 UI — 별도 페이지 vs 바텀 시트**
- 1차 사고: 입력이 3개(상대 이름·나의 이름·대화)라 화면 하나를 차지할 만하다 → 별도 라우트도 가능. 그러나 D2(한 화면 한 작업)와 "닫으면 목록으로 복귀"가 자연스러운 쪽은 시트다. → **바텀 시트(slide-up)**.
- 비판적 재사고: 카카오톡 대화는 수백 줄을 붙여넣는다. 시트 내부 스크롤 + 소프트 키보드가 겹치면 textarea가 가려질 수 있다. 또 시트를 닫으면 입력이 사라지는데, 실수로 백드롭을 누르면 긴 붙여넣기를 잃는다.
- 종합: 시트를 채택하되 ① 높이를 `h-[92dvh]`로 고정하고 본문만 `overflow-y-auto`, textarea는 `flex-1`로 남은 높이를 채운다 ② 생성 중(`saving`)에는 백드롭 닫기를 막는다 — 이는 요청 중 컨텍스트 유실을 막는 별개 목적이며, 2차가 지적한 "생성 전 오클릭으로 긴 붙여넣기를 잃는" 리스크는 해결하지 않는다. 그 리스크는 **감수한다**(확인 대화상자를 두지 않음). 실사용에서 발생 빈도를 관찰해 대응 필요 여부를 판단한다(§12). 키보드 겹침의 실기기 동작은 **미확정**(P3 모바일 스모크에서 확인, 문제 시 시트 높이를 키보드 높이에 맞춰 조정).

**(B) 오류 표시 — 인라인 메시지 vs 토스트**
- 1차 사고: 오류 발생 지점이 다양(키 없음, 네트워크, 429, JSON 파싱)하고 모두 "다시 시도"가 해법이다. 위치에 무관한 **토스트**가 단순하다.
- 비판적 재사고: 토스트는 자동으로 사라져(4초) 긴 문구를 못 읽을 수 있고, 여러 개가 겹칠 수 있다. 특히 "API 사용 한도 초과"처럼 행동을 요구하는 문구는 놓치면 원인을 모른다.
- 종합: 토스트를 채택하되 ① 문구는 원인이 드러나게(`err.*` 키, TRD의 오류 변환 표를 따름) ② 클릭 시 즉시 닫힘 ③ 큐로 쌓여 겹치지 않게 한다. 4초라는 값은 **미확정**(실사용 후 조정). 오류가 폼 검증(빈 이름 등)인 경우도 토스트로 통일해 규칙을 하나로 유지한다.

**(C) 내비게이션 — 하단 탭 4개**(P8에서 3개 → 4개로 갱신)
- 1차 사고: 기능이 3개이고 모바일이므로 하단 탭이 표준적이다.
- 비판적 재사고: 하단 고정 바가 콘텐츠 마지막 요소를 가릴 수 있다. 또 아이콘 없이 라벨만 두면 좁은 화면에서 탭 구분이 약하다.
- 종합: 탭은 아이콘 + 짧은 라벨(`text-xs`) 구조로 두고, `main`에 하단 바 높이만큼 패딩(`pb-20`)을 둔다. 탭 수는 3개로 고정하되 **추가 요구가 생기면 이 절을 갱신한다**고 적어 두었다.

**(C-2) 설정을 네 번째 탭으로 둔다**(P8) — 위 단서가 발동한 자리다.
- 1차 사고: 백업·전체 삭제·개인정보 고지가 필요해졌다(PRD §4.7). 설정은 **목적지가 아니라 도구 화면**이라 탭 하나를 내주기 아깝다. 헤더 우측에 톱니 아이콘을 두고 그 진입점에서 열면 탭은 3개로 유지된다.
- 비판적 재사고: 그 헤더는 이미 앱명·키 인디케이터("● Gemini 준비됨")·언어 토글로 차 있고, 360px에서 앱명이 잘렸던 실측이 있다(LOG 표시명 항목). 아이콘을 하나 더 얹으면 그 문제로 되돌아간다. 더 큰 문제는 **발견 가능성**이다 — 이 화면이 담는 것은 "필요할 때 찾아 들어가는 기능"이 아니라 **사용자가 있는지도 모르면 안 되는 것**이다. 데이터가 브라우저에만 있어 유실될 수 있다는 고지와 그 대비 수단(백업)은 눈에 보이는 자리에 있어야 하고(DR-6), 삭제 수단이 어디 있는지 물어야 알 수 있다면 "언제든 지울 수 있다"는 약속이 반쪽이 된다. 반대 공격도 세워 봤다 — "탭이 4개가 되면 좁은 화면에서 라벨이 좁아진다." 512px 탭바를 4등분하면 탭당 128px이고 라벨은 두세 글자(`text-xs`)라 여유가 있다. 탭 5개까지 같은 논리를 반복할 수는 없지만, 4개까지는 이 근거로 넘어간다.
- 종합: **설정을 네 번째 탭으로 둔다.** 살아남은 근거는 "도구 화면이라는 성격"보다 "고지·삭제는 발견 가능해야 한다"는 요구가 세다는 것이다. 헤더 진입점은 두지 않는다(같은 화면으로 가는 문을 둘 두면 어느 쪽이 정식인지 흐려진다). 탭 다섯 번째가 필요해지면 그때는 탭 대신 다른 구조를 검토한다 — 이 절의 단서를 그대로 다음 판단에 넘긴다.

---

## 2. 디자인 토큰

모든 토큰은 `tailwind.config.js`의 `theme.extend`로 구현한다. 임의 값(`bg-[#...]`)을 컴포넌트에 직접 쓰지 않고 아래 이름으로만 쓴다. 허용 예외 1곳: 하단 탭의 위쪽 그림자 `shadow-[0_-4px_20px_rgba(0,0,0,.06)]`(§3) — 사용처가 하나뿐이라 토큰화하지 않는다.

### 2.1 색
| 역할 | 값 | Tailwind |
|---|---|---|
| 페이지 배경 | `#f8fafc` (slate-50) + 은은한 인디고 radial 2개 | `bg-slate-50` (+ `index.css`의 body background-image) |
| 카드/바 배경 | `#ffffff`, 반투명 바는 `white/80`·`white/90` | `bg-white`, `bg-white/80 backdrop-blur-md` |
| 본문 텍스트 | slate-900 / 보조 slate-500 / 힌트 slate-400 | `text-slate-900` `text-slate-500` `text-slate-400` |
| 경계선 | slate-200 (카드), slate-100 (카드 내부 구분) | `border-slate-200` `border-slate-100` |
| 액센트(주) | `#6366f1` (indigo-500) | `text-indigo-600`, `border-indigo-500`(focus), `accent-indigo-500` |
| 액센트(진) | `#4f46e5` (indigo-600) | 그라디언트 끝점 |
| 액센트 배경 | indigo-50 / indigo-100 | `bg-indigo-50 border-indigo-100` (분석 카드·요약 블록·태그) |
| 성공 | emerald-500 (점), emerald-50/200/600 (배지) | 키 상태 인디케이터 점, "나: {my}" 배지 |
| 오류/삭제 | red-400(점) / red-50·red-500(삭제 버튼) | `bg-red-50 text-red-500` |
| 경고 안내 | amber-50/200/700 | 분석 탭 "페르소나가 없어요" 배너 |
| 딤 백드롭 | 오버레이(온보딩·시트·상세 모달) `slate-900/40`, 상세 로딩 딤 `slate-900/20` — 둘 다 `+ backdrop-blur-sm` | 로딩 딤은 뒤 화면이 더 보이도록 옅게 |
| 토스트 | slate-800 배경 + 흰 글자 | `bg-slate-800 text-white` |

### 2.2 그라디언트 · 그림자 · 모션 (extend 항목)
| 그룹 | 토큰 | 값 | 용도 |
|---|---|---|---|
| backgroundImage | `brand-gradient` | `linear-gradient(135deg, #6366f1, #4f46e5)` | 주 버튼, 활성 언어 토글, 후보 번호 원 |
| backgroundImage | `brand-gradient-subtle` | `linear-gradient(135deg, #eef2ff, #e0e7ff)` | 강조 배경(선택 카드 등, 필요 시) |
| backgroundImage | `avatar-gradient` | `linear-gradient(135deg, #818cf8, #6366f1)` | 이니셜 아바타 |
| boxShadow | `soft-sm` | `0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04)` | 목록 카드, 세그먼트 활성 |
| boxShadow | `soft` | `0 4px 12px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.04)` | 떠 있는 카드 |
| boxShadow | `soft-lg` | `0 10px 25px rgba(0,0,0,.1), 0 4px 10px rgba(0,0,0,.06)` | 모달·시트·토스트 |
| boxShadow | `glow` | `0 4px 16px rgba(99,102,241,.4)` | 온보딩 주 버튼, 상세 아바타 |
| boxShadow | `glow-sm` | `0 2px 8px rgba(99,102,241,.3)` | 일반 주 버튼 |
| keyframes/animation | `slide-up` | `translateY(100%)→0, opacity 0→1`, `0.24s cubic-bezier(0.16, 1, 0.3, 1)` | 바텀 시트·상세 모달 등장 |
| keyframes/animation | `fade-in` | `opacity 0→1`, `0.18s ease-out` | 온보딩 카드, 결과 카드, 펼침 영역 |

### 2.3 반경 · 간격 · 타이포
| 항목 | 규칙 |
|---|---|
| 반경 | 카드/입력 `rounded-2xl`(16px), 작은 입력·보조 버튼 `rounded-xl`(12px), 시트 상단 `rounded-t-3xl`(24px), 칩·주 버튼·토스트 `rounded-full` |
| 페이지 여백 | `px-4 py-6`, 섹션 간 `space-y-5`, 카드 내부 `px-4 py-3`(정보) / `px-4 py-4`(목록 행) |
| 폰트 스택 | `Pretendard, -apple-system, BlinkMacSystemFont, 'Noto Sans KR', system-ui, sans-serif` (`fontFamily.sans` 덮어쓰기 + body에 동일 선언). Pretendard 웹폰트 로드 여부는 §12 참조 |
| 크기 | 화면 제목 `text-lg font-bold`, 카드 제목 `text-sm font-semibold`, 본문 `text-sm leading-relaxed`, 보조 `text-xs`, 섹션 라벨 `text-xs font-semibold uppercase tracking-wide text-slate-400`, 필드 라벨 `text-[11px] uppercase text-indigo-600` |
| 컨트롤 | `button, input, textarea, select { font: inherit }`, `-webkit-tap-highlight-color: transparent` |
| 스크롤바 | 4px, thumb `slate-400/50`; 가로 칩 목록은 `.scrollbar-none` 유틸로 숨김 |

### 2.4 `tailwind.config.js` 구현 형태 (P1에서 작성)
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'Noto Sans KR', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #6366f1, #4f46e5)',
        'brand-gradient-subtle': 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
        'avatar-gradient': 'linear-gradient(135deg, #818cf8, #6366f1)',
      },
      boxShadow: {
        'soft-sm': '0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04)',
        soft: '0 4px 12px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.04)',
        'soft-lg': '0 10px 25px rgba(0,0,0,.1), 0 4px 10px rgba(0,0,0,.06)',
        glow: '0 4px 16px rgba(99,102,241,.4)',
        'glow-sm': '0 2px 8px rgba(99,102,241,.3)',
      },
      keyframes: {
        'slide-up': { from: { transform: 'translateY(100%)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      animation: {
        'slide-up': 'slide-up 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 0.18s ease-out',
      },
    },
  },
  plugins: [],
};
```

### 2.5 공통 클래스 레시피
| 이름 | 클래스(핵심만) |
|---|---|
| 주 버튼 | `rounded-full bg-brand-gradient text-white font-semibold text-sm shadow-glow-sm active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all` |
| 보조 버튼(연한) | `rounded-full bg-indigo-50 text-indigo-600 font-semibold text-sm` |
| 위험 버튼 | `rounded-full bg-red-50 text-red-500 font-semibold text-sm` |
| 입력/textarea | `w-full bg-slate-50 border-[1.5px] border-slate-200 rounded-2xl px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors` |
| 목록 카드 | `rounded-2xl bg-white border border-slate-200 shadow-soft-sm` |
| 강조 블록 | `rounded-2xl bg-indigo-50 border border-indigo-100 px-4 py-3` |
| 정보 카드(회색) | `rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3` |
| 칩(선택) | `rounded-full border text-sm font-medium px-3 py-2` + 활성 `border-indigo-300 bg-indigo-50 text-indigo-600` / 비활성 `border-slate-200 bg-white text-slate-500` |
| 태그 | `rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600` |
| 세그먼트 탭 | 컨테이너 `flex rounded-2xl bg-slate-100 p-1 text-xs font-semibold`, 활성 `bg-white text-indigo-600 shadow-soft-sm rounded-xl` |
| 빈 상태 컨테이너 | `border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center` |

### 2.6 레이어(z-index)

> 규칙(P7-3): 페이지 컴포넌트 안에서 `fixed inset-0` 오버레이를 렌더할 때는 항상 `createPortal(document.body)`를 쓴다. `space-y-*`·`overflow`·`transform`을 가진 조상 안에 두면 margin 주입·클리핑·컨테이닝 블록 변경으로 `fixed` 배치가 오염된다(실측: `space-y-5` 아래에서 top 20px).
| 층 | z | 대상 |
|---|---|---|
| 바 | `z-30` | 상단바(sticky), 하단 탭(fixed) |
| 오버레이 | `z-40` | 온보딩 모달, 생성 시트, 상세 모달, 상세 로딩 딤 |
| 토스트 | `z-50` | 토스트 스택(항상 최상단) |

---

## 3. 앱 셸

```
┌────────────────────────────────────────────┐
│ [◎] Persora        ● Gemini 준비됨 한|EN │  ← header: sticky top-0, bg-white/80
├────────────────────────────────────────────┤     backdrop-blur-md, border-b slate-200
│                                            │
│                                            │
│           <Route content>                  │  ← main: flex-1, pb-20
│        max-w-2xl mx-auto px-4 py-6         │     (하단 탭 높이만큼 여백)
│                                            │
│                                            │
├────────────────────────────────────────────┤
│  [👤]       [💬]       [🕘]       [⚙]      │  ← nav: fixed bottom-0 inset-x-0,
│ 페르소나   분석하기    기록      설정       │     bg-white/90 backdrop-blur-md,
└────────────────────────────────────────────┘     border-t, 위쪽 그림자
```

| 요소 | 규칙 |
|---|---|
| 루트 | `min-h-dvh flex flex-col bg-slate-50 text-slate-900` |
| 상단바 | `px-5 py-3 flex items-center justify-between gap-4 sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200`. 좌: 로고 `h-8 w-8 rounded-lg`(장식, `alt=""`) + 앱명 `font-semibold tracking-tight truncate`. 우: `ApiKeyStatus` + `LanguageToggle`(`gap-3 flex-shrink-0`) |
| 키 상태 인디케이터 | 키가 있을 때만 렌더. `● Gemini 준비됨` — 점 `w-2 h-2 rounded-full bg-emerald-500`, 문구 `text-xs text-slate-500 font-medium whitespace-nowrap`. 클릭 → 인라인 편집 상태(§4.2) |
| 언어 토글 | `rounded-full border border-slate-200 bg-white p-0.5 shadow-soft-sm` 안에 `한` / `EN` 두 버튼. 활성 `bg-brand-gradient text-white`, 비활성 `text-slate-400`. `role="group"`, 각 버튼 `aria-pressed` |
| 콘텐츠 | 각 라우트 `section`은 `max-w-2xl mx-auto px-4 py-6 space-y-5`. `main`은 `flex-1 pb-20`. (초안의 `max-w-lg`는 P3에서 실제 콘텐츠를 붙이며 `max-w-2xl`로 조정했다 — 모바일 무영향) |
| 하단 탭 | `fixed bottom-0 inset-x-0 z-30 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,.06)]`, 내부 `flex items-stretch max-w-lg mx-auto`. **탭은 4개**이며 각 탭 `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium` (아이콘 24px 스트로크 SVG + 라벨). 활성 `text-indigo-600` + 아이콘 `scale-110`, 비활성 `text-slate-400 hover:text-slate-600`. 전환 `transition-all`. 4등분이라 512px 기준 탭당 128px — 라벨 두세 글자에 여유가 있다(§1.1 C-2) |
| 라우팅 | HashRouter. `#/` → `#/personas`로 redirect. 탭 경로 `#/personas` `#/analyze` `#/history` `#/settings` |
| 로고 이미지 | `assets.ts`의 `APP_LOGO_SRC`를 쓴다(TRD §3.14). 하위 경로 배포(`/persora/`)에서 `/app-logo.png`는 404이므로 절대 경로를 직접 쓰지 않는다 — 온보딩 모달의 큰 로고도 같다 |
| 온보딩 게이트 | 키가 없으면 셸 위에 `OnboardingModal`을 렌더(§4). 셸 자체는 뒤에 그대로 있어 흐릿하게 보인다 |
| 토스트 | 셸 최하단 자식으로 `ToastContainer` 1개(§8.1) |

탭 아이콘(선 아이콘, `stroke-width 2`): 페르소나 = 사람 실루엣, 분석하기 = 말풍선 + 두 줄, 기록 = 시계, 설정 = 톱니(원 + 톱니 윤곽).

---

## 4. 온보딩 모달 (API 키)

키가 없을 때 앱 진입 즉시 표시된다. **닫기 수단이 없다**(X·백드롭·ESC 모두 없음) — 키 없이는 어떤 기능도 쓸 수 없기 때문이다(PRD FR 온보딩, Acceptance A1).

```
┌────────────────────────────────────────────┐
│░░░░░░░░░░ dimmed slate-900/40 + blur ░░░░░░│
│░░░  ┌──────────────────────────────┐  ░░░░░│
│░░░  │            [◎ 64px]          │  ░░░░░│
│░░░  │   Persora에 오신 걸   │  ░░░░░│  h2 text-2xl font-bold
│░░░  │        환영합니다            │  ░░░░░│
│░░░  │  분석은 Google AI Studio     │  ░░░░░│  text-sm slate-500
│░░░  │  (Gemini)를 사용합니다…      │  ░░░░░│
│░░░  │                              │  ░░░░░│
│░░░  │  이 앱은 당신의 Gemini API   │  ░░░░░│  intro text-sm slate-600
│░░░  │  키로 동작합니다. 키와 페르  │  ░░░░░│
│░░░  │  소나·대화 기록은 이 브라우  │  ░░░░░│
│░░░  │  저(localStorage/IndexedDB)에 │  ░░░░░│
│░░░  │  저장되고, 생성·분석 시 입력 │  ░░░░░│
│░░░  │  한 대화와 키는 Google로…    │  ░░░░░│
│░░░  │                              │  ░░░░░│
│░░░  │  API 키                      │  ░░░░░│  label text-xs
│░░░  │  [ AIgo...            ]      │  ░░░░░│  type=password
│░░░  │  [ ↗ AI Studio에서 키 발급 ] │  ░░░░░│  outline link btn
│░░░  │                              │  ░░░░░│
│░░░  │  □ 본 기기에만 저장되며 서버 │  ░░░░░│  checkbox accent-indigo
│░░░  │    로 전송되지 않음을 이해…  │  ░░░░░│
│░░░  │                              │  ░░░░░│
│░░░  │  [   키 저장하고 시작하기  ] │  ░░░░░│  brand-gradient, shadow-glow
│░░░  └──────────────────────────────┘  ░░░░░│
└────────────────────────────────────────────┘
```

| 요소 | 규칙 |
|---|---|
| 백드롭 | `fixed inset-0 z-40 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm`. 장식용 인디고 블롭 2개(`blur-3xl`, `pointer-events-none`, `aria-hidden`) |
| 카드 | `max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-soft-lg animate-fade-in` |
| 로고 | `h-16 w-16 rounded-2xl mx-auto mb-4`(장식) |
| 키 입력 | `type="password" autoComplete="off" spellCheck={false} placeholder="AIgo..."`. Enter → 제출 |
| 발급 링크 | `https://aistudio.google.com/app/apikey`, `target="_blank" rel="noreferrer"`. 아웃라인 버튼 모양(외부 링크 아이콘 + 문구) |
| 소개 문구(`onboarding.intro`) | **P8에서 정정한다.** 이전 문구 "키와 모든 데이터는 이 브라우저에만 저장되며 서버로 전송되지 않습니다"는 두 군데가 사실이 아니었다 — 키가 쿠키에 있어 정적 자산 요청마다 서버로 갔고([PRD §8 부속 결정 1](./PRD.md)), 대화는 분석 때 Google로 나간다. 새 문구는 저장 위치와 전송 사실을 함께 적는다: "이 앱은 당신의 Google AI Studio(Gemini) API 키로 동작합니다. 키와 페르소나·대화 기록은 이 브라우저(localStorage/IndexedDB)에 저장되고, 페르소나 생성·분석 시 입력한 대화와 키는 Google Gemini API로 직접 전송됩니다." 자세한 항목은 설정 탭(§7b)이 맡고, 여기서는 **한 문단**을 넘기지 않는다 — 진입을 막는 화면이라 길어지면 읽히지 않는다 |
| 동의 | 체크박스 + 문구 "대화 내용이 Gemini API로 전송되고, 로컬 데이터는 브라우저 데이터 삭제나 기기 변경 시 복구할 수 없음을 이해했습니다." 라벨 전체가 클릭 영역. PRD DR-4(Gemini 전송·민감정보 주의)·DR-6(복구 불가) 고지는 **여기(최초 1회) + 설정 탭(상시)** 두 곳에 둔다 — 위치는 P8에서 확정됐다(PRD FR-38) |
| 제출 | `키 저장하고 시작하기`. 검증 순서: ① 빈 값 → 토스트 `toast.invalidKeyFormat`(오류) ② 미동의 → 토스트 `toast.confirmLocalOnly`(오류) ③ 통과 → 저장(`settingsRepo.setApiKey`) → 토스트 `toast.keySaved`(성공) → 모달 언마운트. **사전 검증 호출 없음**(키 유효성은 첫 분석 호출의 인증 오류로 드러남) |
| 언어 | 모달이 떠 있어도 뒤 상단바의 언어 토글은 가려져 있다. M1에서는 모달 안에 별도 토글을 두지 않는다(브라우저 언어 자동 감지로 초기 언어 결정) |

### 4.2 키 변경/삭제 (헤더 인라인)
헤더의 `● Gemini 준비됨`을 누르면 그 자리가 인라인 편집으로 바뀐다(모달 아님).

```
[ ••••••••  ] 저장  취소  삭제        ← input(password, w-32, autoFocus) + 3 텍스트 버튼
```
- 저장: 공백 제거 후 비어 있으면 무시, 아니면 `setApiKey` → 토스트 `toast.keySaved` → 표시 모드로 복귀.
- 취소 / ESC: 표시 모드로 복귀. Enter: 저장.
- 삭제(`text-red-400`): `clearApiKey` → 토스트 `toast.keyDeleted` → 키가 없어졌으므로 온보딩 모달이 즉시 다시 뜬다(재확인 대화상자 없음 — 키 재입력으로 복구 가능하고 데이터는 유지되므로).

---

## 5. 탭 1 — 페르소나

### 5.1 목록
```
┌────────────────────────────────────────────┐
│ 페르소나              [+ 새 페르소나 만들기]│  h1 text-lg bold / 주 버튼(rounded-full)
│ 대화 기록을 입력하면 AI가 상대방의          │  text-sm slate-500
│ 페르소나를 분석해요                         │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ (김)  김민준  [나: 지수]             › │ │  아바타 12×12 avatar-gradient, 이니셜
│ │       요약 한 줄이 여기에 잘려서…      │ │  summary text-sm slate-500 truncate
│ │       2026.09.05                       │ │  formatDate → YYYY.MM.DD, text-xs
│ └────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────┐ │
│ │ (이)  이지원                         › │ │
│ │       …                                │ │
│ └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```
- 헤더 주 버튼과 빈 상태 CTA는 **같은 문구·같은 키**(`persona.createCta` = "새 페르소나 만들기")를 쓴다. 헤더 쪽에만 앞에 `+`를 붙인다. 두 버튼이 같은 시트를 여는데 라벨이 다르면 다른 동작으로 읽히기 때문이다.
- 카드 전체가 버튼(`w-full text-left flex items-center gap-3 px-4 py-4`, `active:scale-[.99]`). 탭하면 상세 모달(§5.3).
- 이니셜은 `getInitial(name)`(첫 글자, 영문은 대문자). `my_name`이 있으면 이름 옆 `나: {my}` 태그.
- 정렬: `created_at` 내림차순(리포지토리 계약).
- 로딩: 중앙 `불러오는 중...` 텍스트(`text-slate-400 text-sm py-8`).

**빈 상태**
```
┌────────────────────────────────────────────┐
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │  border-2 dashed slate-300, p-10
│ │              ( P )                     │ │  16×16 원, bg-indigo-50 text-indigo-500
│ │      저장된 페르소나 없음              │ │  text-sm font-semibold
│ │  대화 기록을 입력하면 AI가 상대방의    │ │  text-xs slate-400
│ │  페르소나를 분석해요                   │ │
│ │       [ 새 페르소나 만들기 ]           │ │  주 버튼
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │
└────────────────────────────────────────────┘
```

### 5.2 생성 바텀 시트
```
┌────────────────────────────────────────────┐
│░░░░░░░░░░░░░░ backdrop ░░░░░░░░░░░░░░░░░░░░│
│┌──────────────────────────────────────────┐│  ← slide-up, h-[92dvh], rounded-t-3xl
││                 ▬▬▬                      ││  핸들 w-10 h-1 slate-300
││ 새 페르소나 만들기                   (x) ││  h3 + 닫기 버튼(28px 원)
││                                          ││
││ 상대방 이름            나의 이름 (선택)  ││  2열 grid
││ [ 예) 김민준     ]     [ 예) 나      ]   ││  rounded-xl input
││                                          ││
││ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ ││  첨부 버튼 = <label> + hidden input
││ │  📎 카카오톡 대화 파일(.txt) 첨부    │ ││  border-dashed, 한 줄 높이
││ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ ││
││                                          ││
││ ┌──────────────────────────────────────┐ ││
││ │ 김민준: 야 오늘 뭐해?                │ ││  textarea flex-1 min-h-[10rem]
││ │ 나: 집에 있어. 왜?                   │ ││  placeholder = 대화 예시 4줄
││ │ 김민준: 아 그냥... 오늘 약속 있나 해서│ ││
││ │ …                                    │ ││
││ │                                      │ ││
││ └──────────────────────────────────────┘ ││
││ 카카오톡에서 내보낸 .txt를 첨부하면      ││  attachHint text-xs slate-400
││ 머리말을 빼고 최근 대화만 자동으로       ││  (첨부 전 · 편집 후에 이 자리)
││ 채워요. 채운 뒤 직접 편집할 수 있어요.   ││
││ ✅ 원본 48,210자 중 최근 16,000자만      ││  attachedInfo text-xs indigo-500
││    사용했어요                            ││  (첨부 직후 같은 자리를 차지)
││ 📋 대화가 많을수록 더 정확한 페르소나가  ││  textHint text-xs slate-400
││ 만들어져요. 최소 10줄 이상 권장합니다.   ││
││                                          ││
││ [           페르소나 생성              ] ││  주 버튼 w-full, 로딩 시 disabled
│└──────────────────────────────────────────┘│     + "페르소나 생성 중..."
└────────────────────────────────────────────┘
```

**입력 흐름은 하나다**(P10). P5~P9의 텍스트/캡처 이미지 세그먼트와 드롭존·썸네일 그리드는 **삭제한다.** 대화를 넣는 자리는 textarea 하나이고, 파일 첨부는 그 textarea를 **채워 주는 보조 수단**이지 두 번째 모드가 아니다 — 첨부한 뒤 화면에 남는 것은 여느 입력값과 똑같은 텍스트다. 근거는 [PRD §8 부속 결정 3](./PRD.md)의 재검토이고, 분석 탭(§6)의 세그먼트는 그대로 둔다.

| 요소 | 규칙 |
|---|---|
| 컨테이너 | 백드롭 `fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm flex items-end justify-center`; 시트 `w-full max-w-lg h-[92dvh] flex flex-col bg-white border border-slate-200 rounded-t-3xl shadow-soft-lg animate-slide-up` |
| 본문 | `px-5 pb-6 flex-1 min-h-0 overflow-y-auto flex flex-col gap-3`. textarea가 `flex-1`로 남은 높이를 채우고, 첨부 버튼·안내 문구·힌트·생성 버튼은 `shrink-0`으로 밀리지 않게 둔다(D3) |
| 입력 | 상대방 이름(필수), 나의 이름(선택 — 비우면 `my_name: ""`), 대화 textarea(`rows=8`, `resize-none`, `leading-relaxed`) 하나 |
| 첨부 버튼 | 이름 두 칸 **아래**, 대화 textarea **위**에 놓는다 — "파일이 있으면 여기서 채우고, 없으면 아래에 붙여넣는다"는 순서다. `<label>` 안에 `<input type="file" accept=".txt,text/plain" hidden>`을 넣어 라벨 전체가 클릭 영역이 된다. 모양은 한 줄 높이의 점선 상자 `flex items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-500 cursor-pointer`, 호버 `border-indigo-300 text-indigo-500`. 라벨은 `persona.create.attachFile`("📎 카카오톡 대화 파일(.txt) 첨부"). **`multiple`을 두지 않는다** — 대화 파일은 하나를 고르는 것이고, 여러 개를 이어 붙이는 규칙을 정할 근거가 없다 |
| 첨부 동작 | 파일을 읽어(`FileReader.readAsText`) `parseKakaoChatTail`(TRD §3.15)로 머리말 제거 + 말미 `PERSONA_CHAT_TAIL_CHARS` 컷을 거친 결과로 **textarea 값을 교체**하고, 안내 문구를 세운다. 이어 붙이지 않고 **교체**하는 이유는 첨부가 "이 대화로 만들겠다"는 선언이기 때문이며, 붙여넣던 내용이 있으면 그것이 사라지는 것이 사용자 의도에 가깝다. 읽기 실패 → 토스트 `toast.chatFileReadFail`, textarea는 **건드리지 않는다** |
| 같은 파일 재첨부 | 파일을 읽은 직후 `input.value`를 비운다. 비우지 않으면 같은 파일을 다시 고를 때 `change`가 발생하지 않아 아무 일도 일어나지 않는다 — 채운 뒤 편집했다가 원본으로 되돌리려는 사용자가 실제로 걸리는 자리다(PRD FR-7) |
| 첨부 안내 문구 | textarea **아래**, 힌트 **위**에 한 줄. 잘렸으면 `persona.create.attachedInfoTrimmed`("✅ 원본 {total}자 중 최근 {n}자만 사용했어요"), 잘리지 않았으면 `persona.create.attachedInfo`("✅ 최근 {n}자를 사용했어요"). 색은 `text-xs text-indigo-500`로 힌트(`slate-400`)와 구분한다 — 방금 일어난 일에 대한 **응답**이지 상시 안내가 아니기 때문이다. **사용자가 textarea를 직접 편집하면 즉시 사라진다**(그 순간부터 문구가 참이 아니다). 첨부 전에는 자리에 `persona.create.attachHint`가 대신 놓인다 |
| 힌트 | `persona.create.textHint`("📋 대화가 많을수록 더 정확한 페르소나가 만들어져요. 최소 10줄 이상 권장합니다.") 한 줄만 상시 표시한다. **캡처 전송 고지 줄은 여기서 사라진다** — 이 화면은 더 이상 이미지를 보내지 않는다(PRD DR-4). 첨부 파일 자체가 업로드되지 않고 잘린 텍스트만 나간다는 사실은 `attachHint`의 "최근 대화만 자동으로 채워요"가 이미 드러낸다 |
| 검증(제출 시, 순서대로 토스트) | ① 이름 공백 → `toast.enterName` ② 키 없음 → `status.noKey` ③ 대화 trim 길이 < 20(PRD FR-7의 임시값) → `toast.convTooShort`. **모드 분기가 없어져 한 줄기다.** 힌트의 "10줄 이상 권장"은 안내이고 거부 기준은 20자다 — 둘은 다른 개념 |
| 로딩 | 버튼 `disabled` + 라벨 `페르소나 생성 중...`(`persona.create.loading`). 시트는 열린 채 유지, 백드롭 닫기 비활성(§1.1 A). 요청은 항상 텍스트 경로(60초 타임아웃)다 |
| 성공 | 토스트 `toast.personaCreated {name}`(성공) → 폼 초기화(이름·대화·첨부 안내 문구 비움, 파일 입력 `value`도 비움) → 시트 닫힘 → 목록 재조회 |
| 실패 | 토스트에 `Error.message`(TRD `gemini.ts`가 만든 사용자 문구) 그대로. 없으면 `toast.personaCreateFail`. 시트와 입력은 **유지**(재시도 가능 — 첨부로 채운 텍스트도 남는다). LLM 응답이 JSON이 아니면 실패로 보지 않고 원문을 보존해 저장한다(PRD FR-11) — 목록 요약은 비고, 상세 모달이 `raw` 항목으로 원문을 보여 준다 |
| 취소 | 닫기(X)·백드롭 → 입력 폐기. ESC는 없다(§12 U6) |

### 5.3 상세 모달
하단에서 올라오는 시트형 모달(`items-end`, `max-h-[92dvh] overflow-y-auto`, `animate-slide-up`). 생성 시트와 같은 컨테이너 스타일이라 시각적 일관성을 갖는다.

```
┌──────────────────────────────────────────┐
│                 ▬▬▬                      │
│ 페르소나 상세                        (x) │
│                                          │
│               ( 김 )                     │  아바타 20×20, shadow-glow
│               김민준                     │  text-xl bold
│           생성일 2026.09.05              │  text-xs slate-400
│            [ 나: 지수 ]                  │  emerald 배지 (my_name 있을 때)
│                                          │
│ ┌────────────────┬───────────────────┐   │  세그먼트 탭 — my_persona 있을 때만
│ │    김민준      │    🙋 나 (지수)    │   │  활성: bg-white text-indigo-600
│ └────────────────┴───────────────────┘   │
│                                          │
│ ┌──────────────────────────────────────┐ │  summary 블록 (bg-indigo-50)
│ │ 친근하고 직설적인 말투로 상대에게…   │ │
│ └──────────────────────────────────────┘ │
│ ┌──────────────────────────────────────┐ │  항목 카드 (bg-slate-50), 라벨 11px 인디고
│ │ 소통 방식                            │ │
│ │ 짧은 문장을 연속으로 보내며…         │ │
│ └──────────────────────────────────────┘ │
│ ┌──────────────────────────────────────┐ │
│ │ 자주 쓰는 표현                       │ │  vocabulary_examples → 태그 나열
│ │ [ㅋㅋ] [진짜?] [아 그냥] [ㅇㅇ]      │ │
│ └──────────────────────────────────────┘ │
│  … (경어/어미 패턴, 문장 스타일, 이모지, │
│     메시징 습관, 감정 표현, 중요 가치,   │
│     원하는 반응, 관계 역학)              │
│ ┌──────────────────────────────────────┐ │
│ │ 📝 원본 대화 기록 보기            ˅  │ │  접힘 토글, 펼치면 <pre> max-h-48
│ └──────────────────────────────────────┘ │
│ ┌──────────────────────────────────────┐ │  정보 카드(bg-slate-50)
│ │ 추가 대화로 업데이트                 │ │  text-sm font-medium slate-600
│ │ ┌──────────────────────────────────┐ │ │
│ │ │ 새로 나눈 대화를 붙여넣으면…     │ │ │  textarea rows=3, resize-none
│ │ └──────────────────────────────────┘ │ │
│ │ [           업데이트             ]   │ │  보조 버튼(indigo-50) w-full
│ └──────────────────────────────────────┘ │
│ [   이 페르소나로 분석   ] [   삭제   ]  │  indigo-50 / red-50
└──────────────────────────────────────────┘
```
| 항목 | 규칙 |
|---|---|
| 필드 표시 순서 | `PERSONA_FIELDS` 순서(TRD): summary(상단 블록) → communication_style, speech_level, vocabulary_examples, sentence_style, emoji_symbol_usage, texting_habits, emotional_tendencies, what_they_value, how_they_seek_response, relationship_dynamics. 라벨은 i18n `persona.field.*` |
| 값 렌더 | 배열 → 태그(`rounded-full bg-indigo-50 text-indigo-600 text-xs`), 문자열 → `text-sm whitespace-pre-wrap`. 객체가 오면 값들을 ` / `로 이어 문자열화(LLM이 스키마를 벗어나도 깨지지 않게). 빈 값 항목은 숨김. 알 수 없는 키는 키 이름을 라벨로 그대로 표시 |
| 나/상대 탭 | `my_name`이 있고 `my_persona`가 비어 있지 않을 때만 세그먼트 표시. 기본 탭 = 상대. 탭에 따라 summary 블록·항목 카드가 교체된다 |
| 원본 대화 | 기본 접힘. 펼치면 `pre text-xs whitespace-pre-wrap max-h-48 overflow-y-auto`. **모델에 보낸 대화 텍스트가 그대로 들어 있다** — 붙여넣었든 .txt 첨부로 채웠든 같다(TRD §3.7). P5~P9 사이에 캡처로 만든 레코드에는 플레이스홀더 문자열("[채팅 캡처 이미지 3장으로 생성된 페르소나]")이 남아 있을 수 있는데, 화면은 그것도 **평범한 문자열로 그대로** 표시한다. 별도 분기·안내를 두지 않는다 |
| 추가 대화로 업데이트 | 원본 대화 토글 **아래**, 하단 행동 버튼 **위**에 두는 정보 카드(`rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 space-y-2`). 제목 `persona.detail.updateTitle`("추가 대화로 업데이트") + textarea(`rows=3`, `resize-none`, placeholder `persona.detail.updatePlaceholder`) + 전체폭 보조 버튼 `persona.detail.updateCta`("업데이트"). 위치 근거: 사용자가 기존 대화를 확인한 **직후**에 "여기에 더 붙이겠다"가 자연스럽고, 삭제 버튼과는 떨어뜨려야 오조작이 줄어든다 |
| 업데이트 검증·상태 | 순서대로 토스트: ① 키 없음 → `status.noKey` ② 대화 공백 → `toast.enterConversation`. 입력이 비어 있으면 버튼도 `disabled`라 ②는 방어선이다. 실행 중에는 버튼 `disabled` + 라벨 `persona.detail.updateLoading`("업데이트 중..."). 성공 → 토스트 `toast.personaUpdated {name}`, textarea 비움, 모달은 **열린 채로** 갱신된 내용을 보여준다(닫으면 결과를 못 본다). 실패 → `Error.message` 그대로, 없으면 `toast.personaUpdateFail`. 입력은 유지 |
| 삭제 | `window.confirm("\"{name}\" 페르소나를 삭제할까요?")` → 확인 시 `removePersona` → 토스트 `toast.personaDeleted` → 모달 닫힘 → 목록 재조회. 실패 → `toast.deleteFail` |
| 이 페르소나로 분석 | `useApp.setSelectedPersonaId(id)`(TRD §3.9 Zustand 스토어) 후 `#/analyze`로 이동, 토스트 `toast.personaSelected` |
| 상세 로딩 | 카드 탭 → `getPersona` 동안 `z-40` 딤(`bg-slate-900/20 backdrop-blur-sm`) + 중앙 `불러오는 중...` 카드. 실패 → `toast.loadDetailFail` |

---

## 6. 탭 2 — 분석하기 (v2: 최근 대화 스레드 · 답장 대상 · 답장 의도 / 텍스트 · 캡처 이미지)

v1은 "받은 메시지" textarea 하나였다. v2는 그 자리에 **최근 대화 스레드**를 받고, 앱이 잡은 **답장 대상**을 보여 주며, **답장 의도**를 고르는 줄을 더한다(근거는 [PRD §8 부속 결정 4](./PRD.md)). 결과 영역(분석 카드 + 후보 3장)은 v1과 **완전히 같다** — 바뀐 것은 입력부뿐이다.

P9에서 최근 대화 입력에 **텍스트 / 캡처 이미지 세그먼트**를 더했다([PRD §8 부속 결정 5](./PRD.md), FR-39). **P10 이후 이 패턴이 남아 있는 화면은 여기 하나다** — 생성 시트(§5.2)는 캡처 모드를 걷어내고 단일 흐름으로 돌아갔고, 이 탭은 그대로 둔다. 분석이 필요로 하는 것은 화면 한 장 분량의 단기 맥락이라 캡처가 맞는 크기이기 때문이다([PRD §8 부속 결정 3](./PRD.md)의 재검토 ④). 따라서 아래 §6.1의 세그먼트·드롭존·썸네일 규칙은 **이 문서에서 그 형태의 단일 출처**이며, 다른 화면을 참조하지 않는다.

이미지 모드에서는 **타겟 칩·타겟 피커·스레드 드래프트가 통째로 사라진다.** 앱이 답장 대상을 모르기 때문이며, 그 사실을 화면이 숨기지 않는다.

```
┌────────────────────────────────────────────┐
│ ┌────────────────────────────────────────┐ │  ← 페르소나 0개일 때만: amber 배너
│ │ 먼저 페르소나 탭에서 상대방의 대화를   │ │
│ │ 분석해 페르소나를 만들어주세요.        │ │
│ └────────────────────────────────────────┘ │
│ 분석하기                                   │  h1
│ 상대와 주고받은 최근 대화를 그대로        │  text-sm slate-500 (analyze.threadHint)
│ 붙여넣으세요. 맨 아래(최신)의 상대        │
│ 메시지에 답장해요.                        │
│                                            │
│ 페르소나 선택                              │  섹션 라벨(uppercase xs)
│ [(김) 김민준] [(이) 이지원] [(박) 박서연]→ │  가로 스크롤 칩, scrollbar-none
│                                            │
│ 최근 대화 붙여넣기                         │  섹션 라벨(analyze.threadLabel)
│ ┌──────────────┬─────────────────────────┐ │  입력 모드 세그먼트(§2.5)
│ │ ✍️ 텍스트     │  🖼️ 캡처 이미지          │ │  기본 = 텍스트
│ └──────────────┴─────────────────────────┘ │
│ ┌────────────────────────────────────────┐ │  카드(bg-white, shadow-soft-sm)
│ │ [상대] 오늘 뭐해?                      │ │  textarea rows=7, 투명 배경
│ │ [나] 집에 있어                         │ │  placeholder = 3줄 대화 예시
│ │ [상대] 그럼 이따 볼래?                 │ │
│ │                                        │ │
│ ├────────────────────────────────────────┤ │  border-t slate-100
│ │ 이 메시지에 답장 "그럼 이따 볼래?"     │ │  라벨 인디고 semibold + 본문 60자 컷
│ │ 다른 메시지에 답장하기              ▾  │ │  접힘 토글(text-xs slate-400)
│ │  ┌──────────────────────────────────┐  │ │  펼침: max-h-40 스크롤
│ │  │ 김민준  오늘 뭐해?               │  │ │  화자 라벨(slate-400) + 본문 50자
│ │  │ 나      집에 있어                │  │ │
│ │  │ 김민준  그럼 이따 볼래?          │  │ │  ← 현재 타겟은 indigo-50 배경
│ │  └──────────────────────────────────┘  │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ 답장 의도                                  │  섹션 라벨(analyze.intentLabel)
│ [기본(공감)] [위로·공감] [함께 해결]       │  칩 wrap, 활성 = indigo 칩
│ [가볍게 전환] [정중한 거절] [선 긋기]      │
│ [설득·제안] [직접 입력]                    │
│ ┌────────────────────────────────────────┐ │  "직접 입력" 선택 시에만
│ │ 원하는 답장 방향을 적어주세요…         │ │  input(rounded-xl)
│ └────────────────────────────────────────┘ │
│                                            │
│ 김민준 · Gemini              [ 분석하기 ]  │  캡션 + 주 버튼(rounded-xl)
│                                            │
│ ┌──────────┐                               │  로딩: 말풍선 안 점 3개 pulse
│ │ • • •    │                               │
│ └──────────┘                               │
│                                            │
│ ┌────────────────────────────────────────┐ │  결과(fade-in) — v1과 동일
│ │ AI 심리 분석                           │ │  bg-indigo-50, 라벨 인디고 uppercase
│ │ 상대는 지금 심심하고 만날 구실을…      │ │  text-sm whitespace-pre-wrap
│ └────────────────────────────────────────┘ │
│ 원하는 답변 후보 3가지                     │  섹션 라벨
│ ┌────────────────────────────────────────┐ │
│ │ (1) 깊은 공감·수용형                   │ │  header bg-slate-50, 번호 원 brand-gradient
│ ├────────────────────────────────────────┤ │
│ │ 원하는 이유: 지금은 해결보다 마음을…   │ │  text-xs, "원하는 이유:" strong
│ │ 아 진짜? 오늘 좀 그랬구나ㅠ 무슨 일…   │ │  response text-sm, 나의 말투
│ │                             [⧉ 복사하기]│ │  우하단 텍스트 버튼
│ └────────────────────────────────────────┘ │
│ ┌ (2) 공감 + 함께 해결형 ───────────────┐ │
│ │ …                                      │ │
│ └────────────────────────────────────────┘ │
│ ┌ (3) 공감 + 분위기 전환형 ─────────────┐ │
│ │ …                                      │ │
│ └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

**캡처 이미지 모드**(세그먼트에서 "🖼️ 캡처 이미지" 선택 — 페르소나 칩·의도 칩·실행 줄·결과 영역은 그대로다)

```
│ 최근 대화 붙여넣기                         │  섹션 라벨은 그대로
│ ┌──────────────┬─────────────────────────┐ │
│ │ ✍️ 텍스트     │ [🖼️ 캡처 이미지]         │ │  활성: bg-white text-indigo-600
│ └──────────────┴─────────────────────────┘ │
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │  드롭존 = <label> + hidden input
│ │                                        │ │  border-2 dashed, min-h-32
│ │   카카오톡·문자 캡처 이미지 선택       │ │  hover: border-indigo-300
│ │                                        │ │
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │
│ ┌────┐ ┌────┐                              │  썸네일 그리드(flex-wrap gap-2)
│ │▨ ⓧ│ │▨ ⓧ│                              │  64×64 rounded-xl, 우상단 제거 ×
│ └────┘ └────┘                              │
│ 🖼️ 캡처의 맨 아래 상대 메시지에            │  hint text-xs slate-400
│ 답장해요. 답장할 메시지가 잘 보이게,       │
│ 여러 장이면 시간 순서대로 올려주세요.      │
│ 캡처 이미지도 Google로 전송됩니다.         │
                                              ← 타겟 칩·타겟 피커 없음(앱이 타겟을 모른다)
```

이미지 모드에서 **비어 있는 자리를 안내 문구로 채우지 않는다.** "답장 대상을 표시할 수 없어요" 같은 줄을 두면 매번 읽히는 사과문이 되고, 사용자가 할 수 있는 일도 없다(모드를 바꾸는 것뿐인데 그건 세그먼트가 이미 보여 준다). 대신 힌트 첫 문장이 무엇에 답할지를 **긍정문으로** 알려 준다 — "캡처의 맨 아래 상대 메시지에 답장해요."

### 6.1 입력부

| 요소 | 규칙 |
|---|---|
| 페르소나 칩 | `listPersonaSummaries()` 결과. 칩 = 6×6 이니셜 아바타 + 이름, 활성/비활성은 §2.5 칩 레시피. 진입 시 `useApp.selectedPersonaId`(TRD §3.9)가 목록에 있으면 그것을, 없으면 첫 번째를 선택. 가로 스크롤 `flex gap-2 overflow-x-auto pb-1 scrollbar-none` |
| 페르소나 전환 | 스레드를 **그 페르소나의 드래프트로 갈아 끼우고**(§6.3), 수동 타겟과 피커 열림 상태를 초기화하며, **고른 캡처도 비운다** — 다른 상대의 대화 캡처를 들고 갈 이유가 없고, 캡처는 드래프트로 저장되지 않아 복원할 대상도 아니다. 입력 모드 자체는 유지한다(방금 고른 선택을 되돌릴 이유가 없다). 이전 결과 카드는 그대로 둔다 — 사용자가 방금 본 답장을 아직 복사 중일 수 있다 |
| 페르소나 없음 | 상단 amber 배너 안내. 분석 버튼 `disabled` |
| 입력 모드 세그먼트 | 섹션 라벨 **아래**, 입력 카드 **위**에 놓는다(무엇을 넣을지 고른 뒤 넣는 순서). §2.5 세그먼트 탭 레시피 그대로: 컨테이너 `flex rounded-2xl bg-slate-100 p-1 text-xs font-semibold`, 각 버튼 `flex-1 rounded-xl px-3 py-2`, 활성 `bg-white text-indigo-600 shadow-soft-sm`. 라벨은 `analyze.tabText`("✍️ 텍스트") / `analyze.tabImage`("🖼️ 캡처 이미지"). **기본은 텍스트**(PRD §8 부속 결정 5) |
| 모드 전환 | 두 모드의 입력값은 **각각 보존**한다 — 텍스트로 돌아오면 붙여넣던 스레드가, 이미지로 돌아오면 고른 썸네일이 남아 있다. 전환만으로 값을 지우면 잘못 누른 사용자가 입력을 잃는다(§12 U14와 같은 종류의 손실). 제출 시에는 **현재 선택된 모드의 값만** 보낸다 |
| 드롭존(이미지 모드) | `<label>` 안에 `<input type="file" accept="image/*" multiple hidden>`. 모양 `flex flex-col items-center justify-center gap-2 min-h-32 rounded-2xl border-2 border-dashed border-slate-200 bg-white text-slate-400 text-sm font-medium cursor-pointer`, 호버 `border-indigo-300 text-indigo-500`. 문구 `analyze.imageDropzone`("카카오톡·문자 캡처 이미지 선택" — P5가 생성 시트에 쓰던 문구와 같고, 그 화면이 사라진 뒤에도 이 키는 그대로다). 고른 파일은 `fileToInlineImage`(TRD §3.4.1)로 변환해 **기존 목록 뒤에 이어 붙인다**. 변환 실패 → 토스트 `toast.imageLoadFail` |
| 썸네일 그리드(이미지 모드) | 드롭존 아래 `flex flex-wrap gap-2`. 각 항목 `relative w-16 h-16 overflow-hidden rounded-xl border border-slate-200`에 `<img class="w-full h-full object-cover" alt="">`, 우상단 제거 버튼 `absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/70 text-white text-xs`. 제거는 확인 없이 즉시(다시 고르면 되므로). 0장이면 렌더하지 않는다 |
| 힌트(이미지 모드) | 썸네일 아래 `text-xs text-slate-400 leading-relaxed`, 문구 `analyze.imageHint`: **"🖼️ 캡처의 맨 아래 상대 메시지에 답장해요. 답장할 메시지가 잘 보이게, 여러 장이면 시간 순서대로 올려주세요. 캡처 이미지도 Google로 전송됩니다."** 세 문장이 각각 일한다 — ① 앱이 타겟을 표시하지 못하는 자리를 대신해 무엇에 답할지 알려주고, ② 오판을 줄이는 촬영 지침(PRD R10의 완화책)이며, ③ PRD DR-4의 캡처 전송 고지다 |
| 스레드 입력 카드 | **텍스트 모드 전용.** `rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-soft-sm`; textarea `bg-transparent px-5 pt-4 pb-2 rows=7 resize-none leading-relaxed`, placeholder는 카카오톡식 3줄 예시(`analyze.threadPlaceholder`). v1의 5행에서 **7행으로 키웠다** — 이제 한 줄이 아니라 대화 몇 줄을 넣는 자리이기 때문이다(D3) |
| 타겟 칩 | **텍스트 모드 전용.** 카드 하단 `border-t border-slate-100` 영역. `analyze.target`("이 메시지에 답장") 라벨(인디고 semibold) + 검출된 메시지를 따옴표로 감싸 **60자에서 자르고 `…`** 를 붙인다. 스레드가 비었거나 타겟을 못 잡으면 대신 `analyze.targetEmpty` 안내를 회색으로 보여준다. **이 줄이 v2의 핵심 UI다** — 앱이 무엇에 답하는지 사용자가 항상 볼 수 있어야 한다(PRD FR-29) |
| 타겟 피커 | **텍스트 모드 전용.** 파싱된 라인이 하나라도 있을 때만 타겟 칩 아래에 접힘 토글 `analyze.pickTarget`("다른 메시지에 답장하기") + `▾`/`▲`. 펼치면 `max-h-40 overflow-y-auto space-y-1` 목록에 라인마다 버튼 하나: 화자 라벨(`slate-400 font-semibold`, 나=`my_name` 또는 "나" / 상대=페르소나 이름 / 미상=원본 라벨 또는 `?`) + 본문 50자 컷. 현재 타겟인 항목은 `bg-indigo-50 text-indigo-700`. 고르면 즉시 반영되고 피커는 닫힌다 |
| 타겟 되돌리기 | **텍스트 모드 전용.** textarea를 편집하면 수동 지정이 풀리고 자동 검출로 돌아간다. "자동으로 되돌리기" 버튼은 두지 않는다 — 되돌릴 일이 드물고, 목록에서 원래 줄을 다시 고르면 같은 결과가 된다 |
| 의도 칩 | **두 모드 공통.** `flex flex-wrap gap-2`, 각 칩 `px-3 py-1.5 rounded-full border text-xs font-medium`. 순서 고정: `기본(공감)` → 프리셋 6개(`REPLY_INTENTS` 순서: 위로·공감 / 함께 해결 / 가볍게 전환 / 정중한 거절 / 선 긋기 / 설득·제안) → `직접 입력`. **기본값은 "기본(공감)"** 이며 이때 v1과 같은 공감 3축이 나온다(PRD FR-31) |
| 직접 입력 | "직접 입력" 칩을 고를 때만 아래에 input 한 줄(`rounded-xl`, placeholder `intent.customPlaceholder`)이 나타난다. 항상 펼쳐 두지 않는 이유는 대부분의 사용자가 프리셋으로 끝내기 때문이다. 입력이 비어 있으면 의도 미지정과 같게 취급한다 |
| 실행 줄 | `flex items-center justify-between gap-3`: 좌 캡션 `{선택 페르소나명} · Gemini`(text-xs slate-400 truncate), 우 `분석하기`(`rounded-xl`, `disabled:opacity-40 disabled:shadow-none`). v1에서는 입력 카드 안 footer였지만 **카드 밖으로 뺐다** — 카드 하단이 타겟 칩·피커 자리가 되었기 때문이다 |
| 단축키 | textarea에서 Ctrl/Cmd+Enter → 분석 실행(v1과 동일). 이미지 모드에는 textarea가 없으므로 단축키도 없다 |
| 로딩 | 버튼 라벨 교체는 두 모드 공통(§6.4). 이미지가 붙은 요청은 타임아웃이 180초라 텍스트보다 오래 기다릴 수 있다(§8.2) |

### 6.2 검증 순서 (제출 시, 순서대로 토스트)

① 페르소나 미선택 → `toast.selectPersona` ② **모드별 입력 검사** — 텍스트 모드는 스레드 공백 → `toast.enterMessage`, 이미지 모드는 캡처 0장 → `toast.addImage` ③ 키 없음 → `status.noKey`.

①과 ③은 모드와 무관하게 같은 순서로 돌고, 바뀌는 것은 ②뿐이다. v1·v2의 순서와 키를 그대로 두어 텍스트 경로에 회귀가 없게 했고, ②의 이미지 분기는 P5가 생성 시트용으로 만든 토스트 키(`toast.addImage`)를 재사용한다 — **P10에서 생성 시트가 그 자리를 떠나 이제 이 화면이 유일한 사용처다**(§10.1).

의도는 **검증하지 않는다** — 비어 있는 것이 정상값이기 때문이다. 타겟도 검증하지 않는다. 텍스트 모드에서는 파서가 마지막 줄 폴백까지 갖고 있어(TRD §3.11) 스레드가 비어 있지 않으면 타겟이 항상 잡히고, 이미지 모드에서는 **애초에 클라이언트가 검증할 타겟이 없다**(모델이 캡처에서 고른다 — PRD FR-39).

### 6.3 스레드 드래프트 (텍스트 모드 전용)

- **첨부한 캡처는 드래프트로 저장하지 않는다.** 이미지 모드에서 페르소나를 바꾸거나 탭을 떠나면 고른 캡처는 사라지고, 다시 고르면 된다. 이미지를 브라우저 저장소에 쌓지 않는다는 규칙(PRD FR-9·FR-40)이 여기에도 그대로 적용된다 — base64 문자열 수백 KB를 localStorage에 넣을 자리도 없다(TRD §3.12).
- textarea에 입력할 때마다 **현재 페르소나의 드래프트로 저장**한다(TRD §3.12). 저장 버튼도, 저장됐다는 토스트도 두지 않는다 — 사용자가 의식할 필요가 없는 편의 기능이고, 입력마다 토스트가 뜨면 소음이 된다.
- 페르소나를 고르거나 탭에 다시 들어오면 그 페르소나의 드래프트가 textarea에 복원된다. 이때도 안내를 띄우지 않는다. 복원된 스레드는 그대로 파싱되어 타겟 칩이 다시 채워지므로, 사용자는 무엇이 복원됐는지 화면에서 바로 본다.
- 내용을 전부 지우면 드래프트도 사라진다. 전용 삭제 버튼은 두지 않는다(§12 U23).

### 6.4 결과부 (v1과 동일)

| 요소 | 규칙 |
|---|---|
| 로딩 | 버튼 `disabled` + 라벨 `메시지 분석 중...`; 입력 아래 채팅 말풍선 모양(`rounded-2xl rounded-tl-sm`) 안에 인디고 점 3개 `animate-pulse`(150ms 간격 지연). 이전 결과는 그대로 남겨 두고 새 결과로 교체 |
| 결과 | `analyzeReply(personaId, { thread, intent, targetOverride, images })` 반환 `AnalysisRecord`를 카드로. 분석 카드(강조 블록) + 후보 3장. 결과는 자동으로 **기록에 저장**된다(별도 저장 버튼 없음). 이미지 모드에서는 `thread`·`targetOverride`를 비우고 `images`만 넘긴다 — 기록의 답장 대상 자리에는 캡처 장수 플레이스홀더가 저장된다(`analyze.imagePlaceholder`, PRD FR-40) |
| 후보 카드 | 헤더 `px-4 py-3 border-b bg-slate-50 flex gap-3`: 번호 원(`w-7 h-7 rounded-full bg-brand-gradient text-white text-xs font-bold`) + `label`(비어 있으면 `후보 {n}`). 본문: `원하는 이유:`(strong) + `reason`(text-xs slate-500) → `response`(text-sm slate-900 whitespace-pre-wrap) → 우하단 `복사하기` 텍스트 버튼(복사 아이콘 12px) |
| 후보 라벨 | 프롬프트가 만든 `label`을 **그대로** 표시하고 순서를 바꾸지 않는다. 의도를 비우면 v1의 3축("깊은 공감·수용형" / "공감 + 함께 해결형" / "공감 + 분위기 전환형"), 의도를 지정하면 "부드럽고 완곡하게" / "솔직하고 분명하게" / "따뜻한 유머를 곁들여"가 온다(PRD FR-13). **UI에 라벨 목록을 하드코딩하지 않는다** — 어느 쪽이 오든 같은 카드로 그린다 |
| 복사 | `navigator.clipboard.writeText(response)` → 토스트 `✓ 복사됨`(성공). 실패 → `toast.copyFail` |
| 실패 | 토스트에 `Error.message` 그대로(없으면 `toast.analyzeFail`). 입력은 유지(스레드·의도·수동 타겟·고른 캡처 모두 — 재시도 가능) |

---

## 7. 탭 3 — 기록

```
┌────────────────────────────────────────────┐
│ 기록                                       │  h1
│ 원하는 답변 후보                           │  text-sm slate-500
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ 김민준                                 │ │  persona_name text-xs indigo-600 semibold
│ │ "야 오늘 뭐해? 시간 돼?"            ˅  │ │  message 첫 55자 + "..." (따옴표)
│ │ 2026.09.05                             │ │  text-xs slate-400
│ └────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────┐ │
│ │ 이지원                                 │ │
│ │ "주말에 뭐 할 거야?"                ˄  │ │  ← 펼침: 화살표 rotate-180
│ │ 2026.09.05                             │ │
│ ├────────────────────────────────────────┤ │  border-t slate-100, fade-in
│ │ ┌ AI 심리 분석 ──────────────────────┐ │ │  분석하기와 동일 카드
│ │ │ …                                  │ │ │
│ │ └────────────────────────────────────┘ │ │
│ │ 원하는 답변 후보                       │ │
│ │ ┌ (1) … ┐ ┌ (2) … ┐ ┌ (3) … ┐         │ │  후보 카드(복사 버튼 없음)
│ │ [            기록 삭제             ]   │ │  red-50, w-full rounded-xl
│ └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```
| 요소 | 규칙 |
|---|---|
| 목록 | `listAnalyses()` — `created_at` 내림차순. 카드 헤더 전체가 토글 버튼(`hover:bg-slate-50`) |
| 펼침 | 아코디언 — 한 번에 하나만 펼친다(다른 카드를 펼치면 이전 카드는 접힘). 펼침 영역 `animate-fade-in` |
| 미리보기 | `message`가 55자 초과면 `slice(0,55) + "..."`, 한 줄 `truncate`. v2에서 이 필드에는 **답장 대상 메시지**가 담긴다(TRD §3.8). v1에서 만든 기록도 같은 필드를 갖고 있어 목록 코드는 분기하지 않는다. **캡처 이미지 모드로 만든 기록에는 "[채팅 캡처 이미지 {n}장으로 분석한 답장]"이 들어간다**(PRD FR-40) — 앱이 답장 대상 문장을 모르기 때문이며, 이 자리를 비우면 카드가 날짜만 남는다. 기록 탭 코드는 여전히 분기하지 않는다 |
| 스레드·의도 표시 | 기록 레코드는 붙여넣은 스레드와 답장 의도도 보관하지만(PRD FR-33), **펼침 화면에 아직 표시하지 않는다.** 카드가 길어지고, 무엇을 어떤 형태로 보여줄지 정하지 않았다. 표시 여부는 §12 U24 |
| 펼침 내용 | 분석 카드 → 후보 3장(§6과 같은 구조, 복사 버튼은 두지 않음 — 복사는 분석 탭에서, PRD FR-21. 추가 여부는 §12) → `기록 삭제` |
| 삭제 | `window.confirm("이 분석 기록을 삭제할까요?")` → `removeAnalysis` → 목록에서 제거 → 토스트 `toast.historyDeleted`. 실패 → `toast.deleteFail` |
| 빈 상태 | 점선 컨테이너 + `아직 분석 기록이 없어요`(CTA 없음 — 분석 탭에서 생성되므로) |
| 로딩 | 중앙 `불러오는 중...` |

---

## 7b. 탭 4 — 설정 (P8에서 추가)

> 번호를 `7b`로 둔 이유: 뒤 절(§8 공통 컴포넌트 ~ §12 미확정)을 밀면 다른 문서와 LOG의 절 참조가 한꺼번에 깨진다. 탭 순서상 §7 다음 자리가 맞으므로 그 자리에 삽입하고 번호만 나눈다.

이 탭은 **결과를 만드는 화면이 아니라 상태를 다루는 화면**이다(§1.1 C-2). 그래서 다른 탭과 달리 입력 필드도, LLM 호출도 없고, 카드 세 장으로 끝난다.

```
┌────────────────────────────────────────────┐
│ 설정                                       │  h1 text-lg bold
│ 로컬 데이터, 백업, 개인정보 안내를 관리     │  text-sm slate-500 (settings.subtitle)
│ 합니다.                                    │
│                                            │
│ ┌────────────────────────────────────────┐ │  카드 1 — 데이터 관리
│ │ 데이터 관리                            │ │  text-sm font-semibold
│ │ 백업 파일에는 API 키가 포함되지 않습   │ │  text-xs slate-500 (settings.dataDesc)
│ │ 니다. 같은 ID의 데이터는 가져오기 시   │ │
│ │ 덮어씁니다.                            │ │
│ ├────────────────────────────────────────┤ │  border-t slate-100
│ │ [ ↓ 백업 내보내기 ] [ ↑ 백업 가져오기 ]│ │  grid gap-3 sm:grid-cols-3
│ │ [ × 전체 데이터 삭제 ]                 │ │  세 번째만 red 계열
│ └────────────────────────────────────────┘ │
│                                            │
│ ┌────────────────────────────────────────┐ │  카드 2 — 개인정보와 보안
│ │ 개인정보와 보안                        │ │
│ │ Persora는 서버 계정이나 자체 데이터베  │ │  settings.privacyDesc
│ │ 이스 없이 이 브라우저에서 동작합니다.  │ │
│ ├────────────────────────────────────────┤ │
│ │ ● 페르소나·원본 대화·기록·드래프트는   │ │  항목마다 emerald 점 + 본문
│ │   이 브라우저에 저장됩니다             │ │  text-sm leading-relaxed slate-600
│ │ ● 생성·분석 시 대화 텍스트와 캡처는    │ │
│ │   Google Gemini API로 직접 전송됩니다  │ │
│ │ ● 키는 localStorage에 저장됩니다.      │ │
│ │   사용 API를 Gemini API로 제한하세요   │ │
│ │ ● 브라우저 데이터 삭제·기기 변경 시    │ │
│ │   복구할 수 없습니다. 백업하세요       │ │
│ │ ● 타인의 대화·민감정보 입력에 주의     │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ ┌────────────────────────────────────────┐ │  카드 3 — 면책(amber)
│ │ 분석 결과 안내                         │ │  amber-50 / amber-200 / amber-800
│ │ AI가 만든 페르소나와 답변 후보는 참고  │ │  text-xs amber-700
│ │ 용입니다. 의료·법률·심리 진단이나 중요 │ │
│ │ 한 관계 결정을 대신하지 않습니다.      │ │
│ └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

| 요소 | 규칙 |
|---|---|
| 레이아웃 | 다른 탭과 같은 `section max-w-2xl mx-auto px-4 py-6 space-y-5`. 제목 + 부제(`settings.subtitle`) 뒤에 카드 3장 |
| 카드 1·2 | `rounded-2xl bg-white border border-slate-200 shadow-soft-sm overflow-hidden`. 머리(`px-4 py-3 border-b border-slate-100`)에 제목 + 설명, 본문에 내용. §2.5의 목록 카드 레시피를 그대로 쓴다 |
| 버튼 3개 | `p-4 grid gap-3 sm:grid-cols-3` — 모바일에서는 세로로 쌓이고 넓은 화면에서만 한 줄이 된다. 내보내기·가져오기는 중립(`border-slate-200 bg-slate-50 text-slate-700`), **전체 삭제만 red**(`border-red-100 bg-red-50 text-red-600`)로 무게를 달리한다. 아이콘은 텍스트 글리프(`↓`/`↑`/`×`, `aria-hidden`)로 두어 새 SVG를 늘리지 않는다 |
| 가져오기 입력 | 화면에 보이는 것은 버튼이고, 실제 입력은 `<input type="file" accept="application/json,.json" hidden>`이다. 버튼이 `ref`로 그 입력을 클릭한다 — 생성 시트의 대화 파일 첨부 버튼과 같은 발상(§5.2)이며, 파일 입력의 기본 모양이 화면 톤과 맞지 않기 때문이다. **같은 파일을 다시 고를 수 있도록** 처리 후 `input.value`를 비운다(비우지 않으면 `change`가 오지 않는다) |
| 동작 잠금 | 세 버튼은 `busy` 상태 하나(`'export' \| 'import' \| 'clear' \| null`)를 공유해 **하나가 도는 동안 셋 다 비활성**이다. 백업 도중에 전체 삭제가 겹치면 무엇이 저장됐는지 말할 수 없기 때문이다. 진행 중인 버튼은 라벨이 `common.saving`/`common.loading`으로 바뀐다 |
| 전체 삭제 확인 | `window.confirm(settings.confirmClearAll)` — "API 키, 페르소나, 분석 기록, 작성 중인 대화를 이 브라우저에서 모두 삭제할까요? 이 작업은 되돌릴 수 없습니다." 삭제 대상을 **문구에 열거한다**(§8.5의 확인 대화상자 규칙을 따르되, 되돌릴 수 없는 유일한 동작이라 무엇이 사라지는지 이름으로 말한다) |
| 삭제 후 | 키가 사라지므로 **온보딩 모달이 즉시 다시 화면을 점유한다.** 설정 탭에 머문 채로 모달이 뜨는 모습이며, 별도 화면 이동을 하지 않는다 — 키를 다시 넣으면 그 자리에서 이어진다 |
| 개인정보 카드 | 항목마다 `flex gap-3` + 좌측 emerald 점(`mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500`). 다섯 항목은 PRD FR-38의 ①~⑤이고, ⑥(AI 결과는 참고용)은 톤이 달라 카드 3으로 분리했다 |
| 면책 카드 | amber 계열(`bg-amber-50 border-amber-200`, 제목 `amber-800`, 본문 `amber-700`). 분석 탭의 "페르소나가 없어요" 배너와 같은 색 역할 — "읽고 넘어가되 기억해 둘 것" |
| 토스트 | 성공/실패 모두 토스트 한 줄(§8.1). 가져오기 성공은 **복원한 개수**를 넣는다(`settings.toastImported`: 페르소나 {personas}개, 기록 {analyses}개, 드래프트 {drafts}개) — 파일을 골랐는데 아무것도 안 들어온 경우를 사용자가 알아야 한다 |
| 내보내기 결과 | 브라우저 다운로드로 끝난다. 파일명 `persora-backup-<YYYY-MM-DD>.json`. 앱 안에 백업 목록·이력을 두지 않는다 — 파일 보관은 사용자 몫이고, 목록을 두면 그 자체가 또 하나의 상태가 된다 |
| 빈 상태 | 없다. 데이터가 하나도 없어도 화면 구성은 같고, 내보내면 빈 배열이 담긴 파일이 만들어진다(가져오기 왕복이 무해하게 성립한다) |

---

## 8. 공통 컴포넌트 · 상태

### 8.1 토스트
| 규칙 | 값 |
|---|---|
| 위치 | `fixed bottom-24 right-4 z-50 flex flex-col gap-2 max-w-[calc(100vw-2rem)]` — 하단 탭 위에 겹치지 않게 `bottom-24` |
| 모양 | `rounded-full bg-slate-800 text-white text-sm px-4 py-2.5 shadow-soft-lg` + 좌측 톤 점(`w-2 h-2`): info `slate-400` / success `emerald-400` / error `red-400` |
| 수명 | 4초 후 자동 제거. 토스트 자체가 버튼 — 클릭 시 즉시 닫힘 |
| 큐 | 여러 개는 세로로 쌓임(최신이 아래). 상한 없음(0.1) |
| 상태 | Zustand 스토어의 `toasts[]`, `pushToast(message, tone)`, `dismissToast(id)` |
| 문구 | 항상 i18n을 거친 문자열 또는 `gemini.ts`가 만든 현지화 오류 문구. 마크업 없음 |

### 8.2 로딩
| 상황 | 표현 |
|---|---|
| 목록 로딩(페르소나/기록/칩) | 텍스트 `불러오는 중...`(`text-slate-400 text-sm text-center py-8`) |
| LLM 호출(생성) | 제출 버튼 `disabled` + 라벨 교체(`페르소나 생성 중...`). 다른 입력은 편집 가능하되 제출 불가. **P10 이후 생성은 언제나 텍스트 요청**(60초 타임아웃)이므로 이미지 경로를 위한 단서가 필요 없다. 진행률·예상 시간은 넣지 않는다(§12 U10) |
| LLM 호출(분석) | 버튼 `disabled` + 라벨 `메시지 분석 중...` + 말풍선 점 3개 인디케이터. **캡처 이미지 모드도 같은 표시를 쓴다** — 같은 이유로 진행률·예상 시간을 넣지 않는다(§12 U10). 캡처 1장 분석 지연은 2.75s로 한 번 실측했다(표본 1, PRD §11) |
| 대화 파일 첨부 | **로딩 표시를 두지 않는다.** 파일 읽기는 로컬 `FileReader`라 네트워크를 타지 않고, 완료 신호는 textarea가 채워지는 것과 첨부 안내 문구가 나타나는 것 자체다(§5.2). 매우 큰 파일에서 체감 지연이 있는지는 **미확인**(§12 U32) |
| LLM 호출(페르소나 업데이트) | 업데이트 버튼 `disabled` + 라벨 `업데이트 중...`(`persona.detail.updateLoading`). 상세 모달은 열린 채 유지된다 — 결과를 그 자리에서 봐야 하기 때문이다(§5.3) |
| 상세 조회 | 화면 전체 딤(`slate-900/20`) + 중앙 카드 `불러오는 중...` |
| 설정 탭 백업·삭제 | 해당 버튼 라벨을 `저장 중...`/`불러오는 중...`으로 바꾸고 **세 버튼을 모두 비활성**한다(§7b). 딤이나 스피너를 두지 않는다 — IndexedDB 조회·쓰기라 LLM 호출과 달리 대개 즉시 끝나고, 오래 걸리면 그때 다시 본다 |
| 진행률 | 표시하지 않음(LLM 응답 시간을 예측할 수 없음). 요청 타임아웃(텍스트 60초 / 캡처 이미지 180초 — 후자는 P10 이후 분석 탭에만 걸린다)은 TRD의 `gemini.ts`가 오류로 변환해 토스트로 알린다. 두 경로의 타임아웃 문구는 같다 |

### 8.3 빈 상태
| 화면 | 구성 |
|---|---|
| 페르소나 | 아이콘 원 + 제목 + 설명 + 주 CTA(생성 시트 열기) |
| 분석하기 | 상단 amber 안내 배너(페르소나 탭으로 유도) + 분석 버튼 비활성 |
| 기록 | 제목 문구만 |

### 8.4 오류 표시 원칙
1. 모든 오류는 토스트(`error` 톤)로 보인다. 인라인 오류 텍스트·모달 알림은 두지 않는다.
2. LLM/네트워크 오류는 `gemini.ts`가 원인별 현지화 문구(`err.invalidKey`, `err.network`, `err.rateLimit`, `err.timeout`, `err.serviceTemp`, `err.aiGeneric {msg}`)로 변환해 throw하고, 화면은 `Error.message`를 **가공 없이** 토스트에 넣는다. 원인 진단이 가능하도록 일반 문구로 덮어쓰지 않는다.
3. 폼 검증 오류(빈 이름, 짧은 대화, 미선택 등)도 같은 토스트 채널을 쓴다.
4. 오류 후 입력값은 유지한다(재시도 비용 최소화).
5. 키·대화·프롬프트는 콘솔에 출력하지 않는다(TRD 보안 항목).

### 8.5 확인 대화상자
삭제(페르소나·기록·**설정 탭의 전체 삭제**)는 `window.confirm`으로 재확인한다. 커스텀 확인 모달을 만들지 않는다(구현 단순, 브라우저 네이티브가 모바일에서도 충분히 명확). 키 삭제만 재확인이 없다(§4.2) — 키는 다시 입력하면 복구되고 데이터는 그대로 남기 때문이며, 그래서 **되돌릴 수 없는 유일한 동작은 전체 삭제**다. 그 문구에는 사라지는 것을 이름으로 열거한다(§7b).

---

## 9. 인터랙션 규칙

| 규칙 | 내용 |
|---|---|
| 오버레이 닫기 | 생성 시트·상세 모달: **백드롭 탭**과 **우상단 X** 두 가지. 온보딩 모달은 예외(닫기 불가). 백드롭 탭은 "누름(pointer-down)과 뗌이 모두 백드롭에서 일어난 클릭"에만 반응한다 — textarea에서 텍스트를 드래그하다 백드롭에서 손을 떼면 DOM `click`이 공통 조상(백드롭)에서 발생하므로 `target === currentTarget`만으로는 구분할 수 없다(LOG P7-1 재현). |
| 오버레이 등장 | 시트·상세 `animate-slide-up`(0.24s), 온보딩 카드·결과·펼침 `animate-fade-in`(0.18s). 퇴장 애니메이션은 두지 않는다(즉시 언마운트) |
| 스크롤 잠금 | 오버레이가 열린 동안 뒤 페이지 스크롤은 잠그지 않는다(0.1). 시트는 자체 `overflow-y-auto` |
| 탭 전환 | 탭을 바꾸면 스크롤을 최상단으로 되돌린다. 각 탭은 진입 시 목록을 다시 조회한다(다른 탭에서의 생성·삭제 반영) |
| 입력 유지 | 탭 전환 시 각 탭은 언마운트되어 입력값·결과를 보존하지 않는다. 생성 시트 닫기도 입력 폐기. **예외 하나** — 분석 탭의 최근 대화 스레드는 페르소나별 드래프트로 저장돼 다시 들어오면 복원된다(§6.3). 의도 선택·수동 타겟·결과 카드는 저장하지 않는다: 의도와 타겟은 그때그때 달라지는 값이고, 결과는 기록 탭에 이미 남는다 |
| 복사 | 성공 → `✓ 복사됨` 토스트(성공 톤). 실패(권한 거부 등) → `toast.copyFail` |
| 버튼 피드백 | 주 버튼 `active:scale-[.98]`, 목록 카드 `active:scale-[.99]`, 전부 `transition-all`. 호버는 데스크톱 보조(`hover:opacity-90`, `hover:text-slate-600`) |
| 단축키 | 온보딩 키 입력 Enter = 저장, 헤더 인라인 편집 Enter/ESC, 분석 textarea Ctrl/Cmd+Enter = 분석 |
| 포커스 | 입력 포커스 시 `border-indigo-500 bg-white`(outline 제거는 border 색 변화로 대체). 헤더 인라인 편집 input은 `autoFocus` |
| 언어 전환 | 즉시 리렌더(전 화면). 선택은 localStorage `pm_lang`에 저장, `<html lang>`·`document.title` 동기화 |

---

## 10. 다국어(i18n)

- 지원 언어: `ko`(기본) / `en`. 초기 언어는 저장값(`pm_lang`) → 없으면 `navigator.language`가 `ko*`면 ko, 아니면 en.
- 구현: `src/lib/i18n.ts`에 `MESSAGES: Record<Lang, Record<string,string>>` 사전과 `t(key, params?)`(`{param}` 보간). React에서는 `useI18n.ts`의 `useT()`/`useLocale()`로 구독한다. 누락 키는 ko → 키 문자열 순으로 폴백.
- 문구에 HTML을 넣지 않는다(D6). 줄바꿈이 필요하면 별도 키로 나눈다.
- 저장되는 데이터(페르소나·분석 결과)는 LLM 출력 언어를 그대로 두며, UI 언어를 바꿔도 번역하지 않는다. 프롬프트의 출력 언어 지시는 생성 시점 언어를 따른다(TRD `buildPersonaPrompt(input, lang)`).

### 10.1 키 네이밍 규칙
`<영역>.<대상>[.<세부>]` 소문자 점 표기. 영역은 아래 14종으로 고정한다(1.2에서 `intent.*`, 1.4에서 `settings.*` 추가).

| 영역 | 용도 | 예 |
|---|---|---|
| `app.*` | 앱 전역 | `app.title` |
| `nav.*` | 하단 탭 라벨 | `nav.personas`, `nav.analyze`, `nav.history`, **`nav.settings`** |
| `common.*` | 공용 동작/상태 | `common.loading`, `common.save`, `common.cancel`, `common.delete`, `common.candidateN`, **`common.saving`** |
| `btn.*` | 화면 하나에만 쓰이는 주 버튼 라벨 | `btn.saveKey`(온보딩 "키 저장하고 시작하기") |
| `status.*` | 헤더 키 상태 | `status.ready`, `status.noKey` |
| `onboarding.*` | 온보딩 모달 | `onboarding.welcomeTitle`, `onboarding.welcomeDesc`, `onboarding.intro`, `onboarding.keyLabel`, `onboarding.consent`, `onboarding.helpCta`(제출 버튼 라벨은 `btn.saveKey`) |
| `persona.*` | 페르소나 탭·생성·상세 | `persona.empty.title`, `persona.create.title`, `persona.create.otherName`, `persona.create.convPlaceholder`, `persona.create.textHint`, **`persona.create.attachFile`**, **`persona.create.attachHint`**, **`persona.create.attachedInfo`**(`{n}`), **`persona.create.attachedInfoTrimmed`**(`{n}`·`{total}`), `persona.detail.title`, `persona.detail.convToggle`, `persona.detail.updateTitle`, `persona.detail.updatePlaceholder`, `persona.detail.updateCta`, `persona.detail.updateLoading`, `persona.field.communication_style` … `persona.field.relationship_dynamics` |
| `analyze.*` | 분석 탭 | `analyze.selectPersona`, `analyze.run`, `analyze.aiLabel`, `analyze.candidatesTitle`, `analyze.reason`, `analyze.copy`, `analyze.noPersonaHint`, `analyze.loading`, `analyze.threadLabel`, `analyze.threadHint`, `analyze.threadPlaceholder`, `analyze.target`, `analyze.targetEmpty`, `analyze.pickTarget`, `analyze.intentLabel`, **`analyze.tabText`**, **`analyze.tabImage`**, **`analyze.imageDropzone`**, **`analyze.imageHint`**, **`analyze.imagePlaceholder`** |
| `intent.*` | 답장 의도 라벨(1.2 신규 영역) | `intent.none`, `intent.comfort`, `intent.solve`, `intent.lighten`, `intent.decline`, `intent.boundary`, `intent.persuade`, `intent.custom`, `intent.customPlaceholder` |
| `history.*` | 기록 탭 | `history.empty`, `history.candidatesTitle`, `history.delete`, `history.confirmDelete` |
| `settings.*` | 설정 탭(1.4 신규 영역) — 화면 문구와 그 화면 전용 토스트를 함께 담는다 | `settings.subtitle`, `settings.dataTitle`, `settings.dataDesc`, `settings.exportBtn`, `settings.importBtn`, `settings.clearBtn`, `settings.privacyTitle`, `settings.privacyDesc`, `settings.privacyLocal`, `settings.privacyGemini`, `settings.privacyKey`, `settings.privacyLoss`, `settings.privacyConsent`, `settings.disclaimerTitle`, `settings.disclaimerDesc`, `settings.confirmClearAll`, `settings.toastExported`, `settings.toastExportFailed`, `settings.toastImported`(`{personas}`·`{analyses}`·`{drafts}`), `settings.toastImportFailed`, `settings.toastCleared`, `settings.toastClearFailed` |
| `toast.*` | 사용자 행위 결과 알림 | `toast.keySaved`, `toast.keyDeleted`, `toast.copied`, `toast.invalidKeyFormat`, `toast.confirmLocalOnly`, `toast.enterName`, `toast.convTooShort`, **`toast.chatFileReadFail`**, `toast.addImage`, `toast.imageLoadFail`, `toast.personaCreated`, `toast.personaCreateFail`, `toast.personaDeleted`, `toast.personaSelected`, **`toast.enterConversation`**, **`toast.personaUpdated`**, **`toast.personaUpdateFail`**, `toast.selectPersona`, `toast.enterMessage`, `toast.analyzeFail`, `toast.copyFail`, `toast.historyDeleted`, `toast.deleteFail`, `toast.loadDetailFail`, `toast.load*Fail` |
| `err.*` | Gemini/저장소 오류(gemini.ts·db.ts가 사용) | `err.invalidKey`, `err.network`, `err.rateLimit`, `err.timeout`, `err.serviceTemp`, `err.aiGeneric`, `err.keyNotSet`, `err.dbOpen` |
| `parse.*` | LLM 응답 JSON 파싱 실패 폴백 문구(analysis.ts가 사용, TRD §3.8) | `parse.failAnalysis`, `parse.failLabel`, `parse.failReason` |

- 필드 라벨 키의 세부 이름은 `PersonaFields`의 속성명과 **동일**하게 둔다(`persona.field.<속성명>`) — 알 수 없는 키가 와도 `t()` 폴백으로 속성명이 그대로 표시된다.
- 보간 파라미터는 `{name}`, `{my}`, `{n}`, `{date}`, `{msg}`처럼 의미가 드러나는 이름을 쓴다.
- **P10에서 `persona.create.*`의 다섯 키를 지웠다** — `tabText`·`tabImage`·`imageDropzone`·`imageHint`·`imagePlaceholder`. 생성 시트에 이미지 모드가 없어져 어느 것도 렌더되지 않기 때문이며, 남겨 두면 다음 사람이 "어딘가 쓰이는 문구"로 오해한다. **`analyze.*`의 같은 이름 키들은 지우지 않는다**(분석 탭이 계속 쓴다). `toast.addImage`·`toast.imageLoadFail`도 분석 탭이 쓰므로 남는다 — P5에서 만들 때 두 화면이 공유하도록 이름에 화면을 넣지 않은 것이 여기서 값을 한다.
  - `persona.create.imagePlaceholder`가 사라져도 **이미 저장된 문자열은 그대로 남는다.** 그것은 키가 아니라 생성 시점에 굳은 값이라 사전에서 키를 지워도 화면 표시가 바뀌지 않는다(§10의 저장 데이터 규칙).
- **P10의 신규 키 4종은 모두 `persona.create.*`에 둔다.** `attachFile`·`attachHint`는 버튼과 안내 문구이고, `attachedInfo`·`attachedInfoTrimmed`는 첨부 직후의 응답 문구다. 뒤 둘을 **한 키에 조건 분기로 몰지 않고 둘로 나눈 이유**는 잘렸을 때만 원본 글자 수를 말해야 하기 때문이다 — 잘리지 않았는데 "원본 1,200자 중 1,200자"라고 적으면 없는 손실을 암시한다.
- **`toast.chatFileReadFail`은 `toast.*`에 둔다.** 파일 읽기 실패는 사용자 행위의 결과 알림이고, `settings.*`처럼 화면 전용 예외를 만들 이유가 없다.
- **P9의 신규 키 5종은 모두 `analyze.*`에 둔다.** `analyze.tabText`·`analyze.tabImage`·`analyze.imageDropzone`·`analyze.imageHint`는 분석 탭 화면 문구이므로 자리가 자명하다. 저장되는 값인 **`analyze.imagePlaceholder`(`{n}` 보간)도 새 영역을 만들지 않고 여기에 둔다** — 이 문자열을 만드는 곳이 분석 경로 하나뿐이기 때문이다. 화면 라벨이 아니라 `AnalysisRecord.message`·`target_message`에 들어가 기록 목록 미리보기에 보이는 값이므로 **생성 당시 언어로 굳고**, 나중에 UI 언어를 바꿔도 번역되지 않는다(TRD §3.8).
- **P9은 새 토스트 키를 만들지 않았다.** 이미지 0장 거부는 `toast.addImage`, 파일 변환 실패는 `toast.imageLoadFail`을 P5의 생성 시트와 공유했다. **P10에서 생성 시트가 그 자리를 떠나면서 두 키의 유일한 사용처가 분석 탭이 됐다** — 이름에 화면을 넣지 않았기에 사용처가 줄어도 그대로 쓸 수 있다.
- `intent.*`만 영역을 새로 만든 이유: 이 라벨 키들은 화면 소속이 아니라 **프리셋 자체의 이름**이고, `REPLY_INTENTS`(TRD §3.1)가 키를 데이터로 들고 다닌다. `analyze.*` 아래에 넣으면 나중에 다른 화면에서 같은 프리셋을 쓸 때 이름이 어긋난다. `intent.none`과 `intent.custom`은 프리셋이 아니지만 같은 칩 줄에 나란히 서므로 같은 영역에 둔다.
- 페르소나 업데이트 문구는 상세 화면 소속이라 `persona.detail.*`에 둔다 — 이 표의 `<영역>.<대상>.<세부>` 규칙을 그대로 따른 것이다.
- **`settings.*`의 토스트만 `toast.*`가 아니라 자기 영역에 둔다.** 다른 화면의 결과 알림은 `toast.*`에 모아 두었지만, 설정 탭의 여섯 문구는 그 화면 밖에서 쓰일 일이 없고 화면 문구(`settings.dataDesc` 등)와 짝을 이뤄 함께 고쳐진다. 규칙의 예외이므로 여기 적어 둔다 — 다른 화면의 새 토스트는 계속 `toast.*`로 간다.
- **스레드 드래프트에는 i18n 키가 없다.** 저장·복원이 조용히 일어나고 화면에 문구가 뜨지 않기 때문이다(§6.3).
- v1의 `analyze.messagePlaceholder`("받은 메시지" 예시)는 v2에서 쓰이지 않게 되어 **P6-1에서 사전과 함께 지웠다.** 자리는 `analyze.threadPlaceholder`가 대신한다.
- 최종 키 목록은 `src/lib/i18n.ts`가 단일 출처다. 이 표와 어긋나면 이 표를 갱신한다 — 1.0의 `btn.*` 추가와 1.7의 두 건(`onboarding.saveKey`·`analyze.copied`는 사전에 없는 키였다)이 그 사례다. **P11 대조 결과 14개 영역과 이 표의 키가 코드와 일치한다.**

---

## 11. 접근성 · 모바일

| 항목 | 규칙 |
|---|---|
| 터치 타깃 | 탭 가능한 요소는 최소 44×44px. 하단 탭(`py-3` + 아이콘 + 라벨), 주 버튼(`py-3`~`py-3.5`), 목록 카드는 충족. 텍스트 버튼(복사·저장·취소)은 `py-2` 이상 패딩으로 높이를 확보 |
| 뷰포트 | `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">`, `theme-color #6366f1` |
| 안전 영역 | **미구현(P11 대조).** 설계 의도는 하단 탭과 `main` 패딩에 `env(safe-area-inset-bottom)`을 더하는 것이었지만, 코드에는 그 선언이 없다 — 하단 탭은 `py-3`, `main`은 `pb-20` 고정값뿐이다. 홈 인디케이터 기기에서 탭이 가려지는지는 실기기 확인과 함께 본다(§12 U5) |
| 높이 단위 | `dvh` 사용(`min-h-dvh`, `h-[92dvh]`) — 모바일 브라우저 주소창 변동 대응 |
| 키보드 | Enter(온보딩 저장)·Enter/ESC(헤더 인라인 편집)·Ctrl/Cmd+Enter(분석) 단축키(§9). 모든 컨트롤은 실제 `<button>`/`<input>`/`<textarea>`/`<a>`로 만들어 탭 포커스 순서를 자연스럽게 둔다 |
| 시맨틱 | 언어 토글 `role="group" aria-label="Language"` + `aria-pressed`; 장식 이미지 `alt=""`; 상세 모달 제목은 `h3`, 화면 제목은 `h1`(한 화면에 하나) |
| 대비 | WCAG 상대 휘도로 계산한 값(2026-09-05): 본문 slate-900/white 17.85, 보조 slate-500/white 4.76·/slate-50(페이지 배경) 4.55 — AA(4.5:1) 통과. slate-400/white는 2.56이라 힌트·비활성 전용(본문 금지). **AA 미달 조합**: 위험 버튼 red-500/red-50 3.44, 성공 배지 emerald-600/emerald-50 3.58 — 배지·버튼 라벨에 한정해 감수, 조정 여부는 §12 |
| 폰트 크기 | 최소 `text-xs`(12px). 11px(필드 라벨)은 대문자 라벨 한 곳에만 허용 |
| 모션 | 총 0.24s 이하의 짧은 전환만 사용. `prefers-reduced-motion` 대응은 M1 비목표(§12) |
| 네트워크 | 오프라인이면 LLM 호출이 `err.network` 토스트로 실패한다. 저장된 페르소나·기록 조회는 오프라인에서도 동작(IndexedDB) |
| 같은 Wi-Fi 휴대폰 테스트 | `server/index.js`(정적, 0.0.0.0)로 접속해 위 항목을 실기기에서 확인(Acceptance A6) |

---

## 12. 미확정 항목

**취소선이 그어진 항목은 종결**(결과만 남긴다), 나머지는 **남은 미확정**이며 확정 방법·시점을 함께 적는다. P11 기준으로 종결된 것은 U1·U2·U3·U17·U18·U19·U20 일곱이고, 나머지는 실사용 관찰이나 실기기 확인을 기다린다. 화면 밖 항목까지 포함한 단일 목록은 [`./PLAN.md`](./PLAN.md) §8에 있다.

| # | 항목 | 현재 판단 | 확정 시점 |
|---|---|---|---|
| ~~U1~~ | 정식 표시명 | **확정: Persora**(M1 직전, 360px 헤더 잘림 실측이 근거 — LOG 참조) | 완료 |
| ~~U2~~ | 로고·파비콘 자산 | **확정(P1)**: `public/`의 `favicon.png`·`app-icon-192.png`·`apple-touch-icon.png`·`app-logo.png`를 사용한다. 이니셜형 플레이스홀더는 쓰지 않았다 | 완료 |
| ~~U3~~ | Pretendard 웹폰트 로드 | **결정(P8): 로드하지 않는다.** CSP를 `default-src 'self'`로 닫았고(TRD §8.1) 폰트 CDN을 허용하려면 `font-src`·`style-src`에 외부 출처를 열어야 한다. 설치된 기기에서는 스택 선언만으로 이미 Pretendard가 쓰이고, 아닌 기기에서는 시스템 폰트로 떨어진다 — 그 차이보다 외부 출처를 여는 비용이 크다고 봤다. 웹폰트가 정말 필요해지면 **파일을 `public/`에 두고 `'self'`로 서빙**하는 쪽이 CSP를 건드리지 않는 길이다 | 완료 |
| U4 | 생성 시트와 소프트 키보드 겹침 | `h-[92dvh]` + 내부 스크롤로 대응한다고 가정. **실기기 미확인**(A6가 미실행이라 P3 모바일 스모크에서도 확인하지 못했다) | P8 배포 후 실기기 |
| U5 | 하단 탭 safe-area 패딩 | **미구현.** `env(safe-area-inset-bottom)`이 코드에 없다(P11 대조) — 하단 탭 `py-3`, `main` `pb-20` 고정값뿐이다. 홈 인디케이터 기기에서 탭 라벨이 가려지는지 먼저 보고, 가려지면 두 자리에 패딩을 더한다 | 실기기 확인 시 |
| U6 | 오버레이 ESC 닫기 | **미구현.** 생성 시트·상세 모달은 백드롭 클릭과 X 버튼으로만 닫힌다. ESC는 헤더 인라인 키 편집에만 있다(§4.2). 모바일에서 이득이 없어 M1에서 넣지 않았다 | 실사용 후 |
| U7 | HTTP(LAN) 접속 시 클립보드 API | `navigator.clipboard`가 제한될 수 있음 → 실패 토스트로 안내. 대체 복사 경로는 미정. M1 스모크에서 복사 클릭은 동작했으나 자동화 브라우저의 권한 대기로 **성공 토스트 문구를 확인하지 못했다** | 실사용 관찰(계속) |
| ~~U17~~ | 상세 모달 백드롭이 최상단 약 20px를 덮지 않음 | **원인 확정(P7-3)**: `space-y-5` 부모의 margin-top 주입. 페이지 오버레이는 `createPortal(document.body)`로 렌더(§2.6 규칙) — 적용 후 top 0 실측 | 완료 |
| U8 | 토스트 자동 닫힘 4초 | 임시값. 긴 오류 문구 가독성은 실사용 후 조정 | 실사용 관찰(계속) |
| U9 | 기록 탭 후보 카드의 복사 버튼 | M1은 미포함(분석 탭에서 복사, PRD FR-21). 실사용에서 요구되면 추가 | 실사용 후 |
| U10 | LLM 대기 시간 표시 | 진행률 없이 점 3개. 지연은 실측했지만(2.75~6.57s, 시나리오별 표본 1) **분산을 모르므로** 기대 시간 문구를 넣지 않는다. 표본이 쌓여 범위를 말할 수 있게 되면 다시 본다 | 실사용 관찰(계속) |
| U11 | `prefers-reduced-motion` | 비목표. 모션이 짧아 우선순위 낮음 | 미정 |
| U12 | en 문구 품질 | P1에서 초안 작성, 원어민 검수 없음 | 미정 |
| U13 | 이니셜 규칙 | `getInitial`은 첫 글자(영문 대문자). 다국어 이름·이모지 이름은 미검토 | 실사용 후 |
| U14 | 생성 시트 백드롭 오클릭으로 입력 유실(§1.1 A) | 감수한다(확인 대화상자 없음). 실사용에서 발생 빈도를 관찰해 대응 필요 여부 판단 | 실사용 관찰(계속) |
| U15 | 온보딩 고지 문구·위치(PRD DR-4 Gemini 전송·민감정보 주의, DR-6 복구 불가) | 기본안은 온보딩 모달 intro/동의 문구. 세부 문구는 P2 온보딩 문구 작성 시 PRD/TRD와 맞춤 | P2 docs |
| U16 | 색 대비 AA 미달(red-500/red-50 3.44, emerald-600/emerald-50 3.58, §11) | 배지·버튼 라벨에 한정해 감수. 더 진한 단계로 조정할지 검토(예: emerald-700/emerald-50은 5.21로 통과, red-600/red-50은 4.41로 여전히 미달) | 실사용 후 |
| ~~U18~~ | 생성 시트의 캡처 장수 상한과 썸네일 그리드가 넘칠 때의 처리 | **종결(P10)** — 생성 시트에서 캡처 모드를 제거해 이 자리가 사라졌다. 분석 탭의 같은 물음은 U31로 남는다 | 완료 |
| ~~U19~~ | 이미지 생성 대기 중 표시 | **종결(P10)** — 생성이 텍스트 전용이 되어 이미지 대기 시간이라는 상황이 없어졌다. 분석 탭의 대기 표시는 §8.2 그대로이고, 대기 시간 문구를 넣지 않는 이유는 U10에 남는다 | 완료 |
| ~~U20~~ | 생성 시트의 드롭존이 실제 드래그 앤 드롭을 받지는 않음 | **종결(P10)** — 드롭존이 사라졌다. 새 첨부 버튼도 같은 형태(`<label>` + hidden `<input type="file">`)이고 `onDrop`을 두지 않는다. 판단 근거는 그대로다 — 주 사용 환경이 모바일이라 드래그 앤 드롭의 이득이 작다. 분석 탭 드롭존에는 U20의 물음이 그대로 유효하다 | 완료(분석 탭은 유지) |
| U21 | 타겟 피커의 라인 목록이 긴 스레드에서 쓸 만한지 | 목록에 `max-h-40 overflow-y-auto`만 두고 검색·접기를 넣지 않았다(§6.1). 수십 줄을 붙여넣으면 원하는 줄까지 스크롤이 길어지는데, **실사용에서 몇 줄부터 불편한지 확인하지 않았다.** 대개 답장 대상은 끝에서 한두 번째라 목록을 역순으로 두는 안도 후보다 | 실사용 관찰(계속) |
| U22 | 타겟 칩의 60자 컷과 피커의 50자 컷 | 임시값이다. 컷이 짧으면 어느 메시지인지 구분이 안 되고, 길면 칩 한 줄이 두 줄로 늘어져 레이아웃이 흔들린다. 근거 실측은 없다 | 실사용 후 |
| U23 | 스레드 드래프트의 삭제 수단 | **부분 해소(P8).** 설정 탭의 전체 삭제가 드래프트도 함께 지운다(§7b). 페르소나별 개별 삭제 버튼과 "저장된 드래프트가 있다"는 표시는 여전히 없다 | 실사용 후 |
| U24 | 기록 펼침에 스레드·의도를 보여줄지 | 레코드에는 남지만 화면에는 아직 없다(§7). 스레드 전문을 그대로 펼치면 카드가 매우 길어지므로 접힘 블록이나 의도 배지 한 줄이 후보다. 형태를 정하지 않았다 | 실사용 후 |
| U25 | 탭 4개에서 라벨이 좁아지는지(실기기) | 512px 탭바 4등분 = 탭당 128px이고 라벨이 두세 글자라 여유가 있다고 **계산으로** 판단했다(§1.1 C-2). 360px 기기에서 실제로 어떻게 보이는지는 **미확인** — 표시명 잘림을 실측으로 잡았던 전례가 있으므로 배포 후 확인 대상이다 | P8 배포 후 |
| U26 | 백업 목록·이력 화면 | 두지 않는다(§7b). 내보낸 파일은 앱이 추적하지 않으므로 "언제 마지막으로 백업했는지"를 사용자가 알 수 없다. 유실 사고가 실제로 생기면 마지막 내보내기 시각만 기록하는 안이 후보다 | 실사용 후 |
| U27 | 큰 백업 파일에서의 체감 | 대화 원문이 통째로 들어가 페르소나가 많으면 파일이 수 MB가 될 수 있다. 내보내기·가져오기 모두 동기적으로 JSON 전체를 다루는데 **몇 MB부터 버벅이는지 재지 않았다.** 진행률 표시도 없다(버튼 라벨 교체만) | 실사용 후 |
| U28 | 잘못된 백업 파일을 골랐을 때의 안내 수준 | 실패 토스트 한 줄(`settings.toastImportFailed`)로만 알린다. "형식이 아니다 / 버전이 다르다 / JSON이 깨졌다"를 구분해 보여주지 않는다 — 사용자가 할 일은 어느 쪽이든 "맞는 파일을 다시 고르기" 하나라고 봤다. 구분이 필요하다는 신호가 보이면 문구를 나눈다 | 실사용 후 |
| U29 | 이미지 모드에서 답장 대상을 보여줄 수 없는 자리(§6.1) | 안내 문구를 두지 않고 힌트 첫 문장("캡처의 맨 아래 상대 메시지에 답장해요")으로 대신한다. 대안은 분석 **결과**에 모델이 무엇에 답했는지를 한 줄로 되돌려 받아 표시하는 것인데, 그러려면 출력 JSON에 필드를 하나 더해야 하고 그 순간 두 모드의 출력 계약이 갈라진다(TRD §3.5가 지키려는 것). 오판이 실제로 잦다면 그 비용을 다시 저울질한다 | 실사용 관찰(§12 U30과 함께) |
| U30 | 이미지 모드 답장 대상 오판의 체감 빈도 | **미확정.** 모델이 말풍선 좌/우 위치와 순서로 마지막 상대 메시지를 고르며, 틀려도 고칠 수단이 없다(PRD R10 / TRD §10 #27). 화면 완화책은 힌트의 촬영 지침 한 줄뿐이다. 잦다면 후보는 셋 — U29의 결과 표시, 이미지 모드에서도 타겟을 직접 입력하는 칸, 그리고 텍스트 모드 권유 | P9 검증에서 1회 관찰, 판단은 실사용 |
| U31 | 분석 탭 캡처 장수 상한·썸네일이 화면을 밀어내는 정도 | 상한을 두지 않고 시작한다(P10에서 종결된 U18과 같은 판단이었다). 분석 탭은 시트가 아니라 페이지라 그리드가 길어지면 의도 칩과 실행 버튼이 아래로 밀리는데, 페이지 스크롤로 닿을 수는 있다. 최근 맥락은 대개 한두 장이라 문제가 늦게 온다고 봤다 — **몇 장부터 불편한지는 미확인** | 실사용 관찰(계속) |
| U32 | 큰 대화 파일을 첨부했을 때의 체감 | 카카오톡 대화 내보내기는 수 MB에 이를 수 있는데, `FileReader.readAsText`로 **전체를 읽은 뒤** 말미만 잘라 쓴다(TRD §3.15). 읽는 동안 로딩 표시가 없고(§8.2), **몇 MB부터 체감 지연이 생기는지 재지 않았다.** 필요가 보이면 후보는 둘 — 읽는 동안 버튼 라벨을 바꾸거나, 파일의 뒷부분만 잘라 읽는 것(`File.slice`). 후자는 멀티바이트 문자가 경계에서 깨질 수 있어 그 처리가 따라붙는다 | 실사용 후 |
| U33 | 첨부 안내 문구가 첨부 직후에만 참이라는 점 | 사용자가 textarea를 편집하면 문구를 지우는 것으로 다룬다(§5.2). 단순하지만 **한 글자만 고쳐도 사라지므로** "얼마나 쓰였는지"를 다시 보려면 재첨부해야 한다. 대안은 문구를 남기되 "편집됨" 표시를 붙이는 것인데, 상태가 하나 늘고 화면 문구도 늘어 지금은 두지 않았다 | 실사용 후 |
| U34 | `ErrorBoundary` 복구 화면의 i18n | **미해결.** 문구가 ko 고정 문자열이다 — §10.1에 오류 화면 영역이 없어 P7-1에서 키를 만들지 않았고, 렌더 예외를 인위적으로 주입한 적도 없어 복구 UI의 실제 동작도 확인하지 못했다. 방법: 영역을 하나 더할지(`error.*`) `common.*`에 넣을지 정해 ko/en 키를 만들고, 예외를 주입해 화면을 본다 | 후속 후보 |
| U35 | 첨부 안내 문구가 머리말 제거와 tail 컷을 구분하지 않음 | **관찰(P10).** 1,331자 파일이 머리말 제거만으로 1,238자가 됐을 때도 `attachedInfoTrimmed`("원본 N자 중 최근 M자만 사용했어요")가 떠, 잘리지 않았는데 잘린 것처럼 읽힌다. 비교 기준이 원본 전체 길이여서 생기는 일이다(§5.2). 방법: 기준을 머리말 제거 후 길이로 바꾸거나 두 경우의 문구를 나눈다 | 후속 후보 |
