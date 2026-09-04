# DESIGN — Persona Mirror (코드네임) 화면·인터랙션 설계

> 문서 버전: 0.2 · 갱신일: 2026-09-05 · 상태: P3 착수 — 콘텐츠 폭 `max-w-2xl`, 페르소나 생성 파싱 실패 표시 확정

## 문서 이력
| 버전 | 날짜 | 변경 |
|---|---|---|
| 0.1 | 2026-09-05 | 초안 |
| 0.2 | 2026-09-05 | P3 착수: 콘텐츠 폭 `max-w-2xl`(D1·§3), 생성 실패 행에 원문 보존 저장 반영(§5.2) |

관련 문서: 제품 요구는 [`./PRD.md`](./PRD.md), 모듈 계약·저장·LLM 호출은 [`./TRD.md`](./TRD.md), 단계 계획은 [`./PLAN.md`](./PLAN.md), 변경 이력은 [`./LOG.md`](./LOG.md). 이 문서는 **현재 시점의 설계 상태**만 서술하고, 변경 사유·이력은 LOG에 남긴다.

> 표시명 관련: 앱 이름은 코드네임 "Persona Mirror"를 쓴다. 정식 표시명은 M1 전에 확정 예정이며, 문구는 i18n 키(`app.title`) 한 곳에서 바꾼다. 아래 와이어프레임의 앱명은 자리표시자다.

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
| D7 | **라이트 단일 테마** | `color-scheme: light` 고정. 다크 모드는 0.1 범위의 비목표. |

### 1.1 주요 설계 선택의 근거 (3단 사고)

**(A) 페르소나 생성 UI — 별도 페이지 vs 바텀 시트**
- 1차 사고: 입력이 3개(상대 이름·나의 이름·대화)라 화면 하나를 차지할 만하다 → 별도 라우트도 가능. 그러나 D2(한 화면 한 작업)와 "닫으면 목록으로 복귀"가 자연스러운 쪽은 시트다. → **바텀 시트(slide-up)**.
- 비판적 재사고: 카카오톡 대화는 수백 줄을 붙여넣는다. 시트 내부 스크롤 + 소프트 키보드가 겹치면 textarea가 가려질 수 있다. 또 시트를 닫으면 입력이 사라지는데, 실수로 백드롭을 누르면 긴 붙여넣기를 잃는다.
- 종합: 시트를 채택하되 ① 높이를 `h-[92dvh]`로 고정하고 본문만 `overflow-y-auto`, textarea는 `flex-1`로 남은 높이를 채운다 ② 생성 중(`saving`)에는 백드롭 닫기를 막는다 — 이는 요청 중 컨텍스트 유실을 막는 별개 목적이며, 2차가 지적한 "생성 전 오클릭으로 긴 붙여넣기를 잃는" 리스크는 해결하지 않는다. 그 리스크는 **감수한다**(확인 대화상자를 두지 않음). 실사용에서 발생 빈도를 관찰해 대응 필요 여부를 판단한다(§12). 키보드 겹침의 실기기 동작은 **미확정**(P3 모바일 스모크에서 확인, 문제 시 시트 높이를 키보드 높이에 맞춰 조정).

**(B) 오류 표시 — 인라인 메시지 vs 토스트**
- 1차 사고: 오류 발생 지점이 다양(키 없음, 네트워크, 429, JSON 파싱)하고 모두 "다시 시도"가 해법이다. 위치에 무관한 **토스트**가 단순하다.
- 비판적 재사고: 토스트는 자동으로 사라져(4초) 긴 문구를 못 읽을 수 있고, 여러 개가 겹칠 수 있다. 특히 "API 사용 한도 초과"처럼 행동을 요구하는 문구는 놓치면 원인을 모른다.
- 종합: 토스트를 채택하되 ① 문구는 원인이 드러나게(`err.*` 키, TRD의 오류 변환 표를 따름) ② 클릭 시 즉시 닫힘 ③ 큐로 쌓여 겹치지 않게 한다. 4초라는 값은 **미확정**(실사용 후 조정). 오류가 폼 검증(빈 이름 등)인 경우도 토스트로 통일해 규칙을 하나로 유지한다.

**(C) 내비게이션 — 하단 탭 3개**
- 1차 사고: 기능이 3개이고 모바일이므로 하단 탭이 표준적이다.
- 비판적 재사고: 하단 고정 바가 콘텐츠 마지막 요소를 가릴 수 있다. 또 아이콘 없이 라벨만 두면 좁은 화면에서 탭 구분이 약하다.
- 종합: 탭 수는 3개로 고정하고, `main`에 하단 바 높이만큼 패딩(`pb-20`)을 둔다. 각 탭은 아이콘 + 짧은 라벨(`text-xs`) 구조로 둔다. 탭 추가 요구가 생기면 그때 이 절을 갱신한다.

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
| 층 | z | 대상 |
|---|---|---|
| 바 | `z-30` | 상단바(sticky), 하단 탭(fixed) |
| 오버레이 | `z-40` | 온보딩 모달, 생성 시트, 상세 모달, 상세 로딩 딤 |
| 토스트 | `z-50` | 토스트 스택(항상 최상단) |

---

## 3. 앱 셸

```
┌────────────────────────────────────────────┐
│ [◎] Persona Mirror        ● Gemini 준비됨 한|EN │  ← header: sticky top-0, bg-white/80
├────────────────────────────────────────────┤     backdrop-blur-md, border-b slate-200
│                                            │
│                                            │
│           <Route content>                  │  ← main: flex-1, pb-20
│        max-w-2xl mx-auto px-4 py-6         │     (하단 탭 높이만큼 여백)
│                                            │
│                                            │
├────────────────────────────────────────────┤
│   [👤]         [💬]          [🕘]           │  ← nav: fixed bottom-0 inset-x-0,
│  페르소나      분석하기        기록          │     bg-white/90 backdrop-blur-md,
└────────────────────────────────────────────┘     border-t, 위쪽 그림자
```

| 요소 | 규칙 |
|---|---|
| 루트 | `min-h-dvh flex flex-col bg-slate-50 text-slate-900` |
| 상단바 | `px-5 py-3 flex items-center justify-between gap-4 sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200`. 좌: 로고 `h-8 w-8 rounded-lg`(장식, `alt=""`) + 앱명 `font-semibold tracking-tight truncate`. 우: `ApiKeyStatus` + `LanguageToggle`(`gap-3 flex-shrink-0`) |
| 키 상태 인디케이터 | 키가 있을 때만 렌더. `● Gemini 준비됨` — 점 `w-2 h-2 rounded-full bg-emerald-500`, 문구 `text-xs text-slate-500 font-medium whitespace-nowrap`. 클릭 → 인라인 편집 상태(§4.2) |
| 언어 토글 | `rounded-full border border-slate-200 bg-white p-0.5 shadow-soft-sm` 안에 `한` / `EN` 두 버튼. 활성 `bg-brand-gradient text-white`, 비활성 `text-slate-400`. `role="group"`, 각 버튼 `aria-pressed` |
| 콘텐츠 | 각 라우트 `section`은 `max-w-2xl mx-auto px-4 py-6 space-y-5`. `main`은 `flex-1 pb-20`. (0.1의 `max-w-lg`는 P3에서 실제 콘텐츠를 붙이며 `max-w-2xl`로 조정 — 모바일 무영향) |
| 하단 탭 | `fixed bottom-0 inset-x-0 z-30 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,.06)]`, 내부 `flex items-stretch max-w-lg mx-auto`. 각 탭 `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium` (아이콘 24px 스트로크 SVG + 라벨). 활성 `text-indigo-600` + 아이콘 `scale-110`, 비활성 `text-slate-400 hover:text-slate-600`. 전환 `transition-all` |
| 라우팅 | HashRouter. `#/` → `#/personas`로 redirect. 탭 경로 `#/personas` `#/analyze` `#/history` |
| 온보딩 게이트 | 키가 없으면 셸 위에 `OnboardingModal`을 렌더(§4). 셸 자체는 뒤에 그대로 있어 흐릿하게 보인다 |
| 토스트 | 셸 최하단 자식으로 `ToastContainer` 1개(§8.1) |

탭 아이콘(선 아이콘, `stroke-width 2`): 페르소나 = 사람 실루엣, 분석하기 = 말풍선 + 두 줄, 기록 = 시계.

---

## 4. 온보딩 모달 (API 키)

키가 없을 때 앱 진입 즉시 표시된다. **닫기 수단이 없다**(X·백드롭·ESC 모두 없음) — 키 없이는 어떤 기능도 쓸 수 없기 때문이다(PRD FR 온보딩, Acceptance A1).

```
┌────────────────────────────────────────────┐
│░░░░░░░░░░ dimmed slate-900/40 + blur ░░░░░░│
│░░░  ┌──────────────────────────────┐  ░░░░░│
│░░░  │            [◎ 64px]          │  ░░░░░│
│░░░  │   Persona Mirror에 오신 걸   │  ░░░░░│  h2 text-2xl font-bold
│░░░  │        환영합니다            │  ░░░░░│
│░░░  │  분석은 Google AI Studio     │  ░░░░░│  text-sm slate-500
│░░░  │  (Gemini)를 사용합니다…      │  ░░░░░│
│░░░  │                              │  ░░░░░│
│░░░  │  이 앱은 당신의 Gemini API   │  ░░░░░│  intro text-sm slate-600
│░░░  │  키로 동작합니다. 키와 모든  │  ░░░░░│
│░░░  │  데이터는 이 브라우저에만…   │  ░░░░░│
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
| 동의 | 체크박스 + 문구 "본 기기에만 저장되며 서버로 전송되지 않음을 이해했습니다." 라벨 전체가 클릭 영역. PRD DR-4(Gemini 전송·민감정보 주의)·DR-6(복구 불가) 고지의 노출 위치·문구 수준은 미확정(§12) — 0.1 와이어프레임은 최소 문구이며 P2 온보딩 문구 작성 시 PRD/TRD와 맞춘다 |
| 제출 | `키 저장하고 시작하기`. 검증 순서: ① 빈 값 → 토스트 `toast.invalidKeyFormat`(오류) ② 미동의 → 토스트 `toast.confirmLocalOnly`(오류) ③ 통과 → 저장(`settingsRepo.setApiKey`) → 토스트 `toast.keySaved`(성공) → 모달 언마운트. **사전 검증 호출 없음**(키 유효성은 첫 분석 호출의 인증 오류로 드러남) |
| 언어 | 모달이 떠 있어도 뒤 상단바의 언어 토글은 가려져 있다. 0.1에서는 모달 안에 별도 토글을 두지 않는다(브라우저 언어 자동 감지로 초기 언어 결정) |

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
│ 페르소나                    [+ 새 페르소나] │  h1 text-lg bold / 주 버튼(rounded-full)
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
││ ┌──────────────────────────────────────┐ ││
││ │ 김민준: 야 오늘 뭐해?                │ ││  textarea flex-1 min-h-[10rem]
││ │ 나: 집에 있어. 왜?                   │ ││  placeholder = 대화 예시 4줄
││ │ 김민준: 아 그냥... 오늘 약속 있나 해서│ ││
││ │ …                                    │ ││
││ │                                      │ ││
││ └──────────────────────────────────────┘ ││
││ 📋 대화가 많을수록 더 정확한 페르소나가  ││  hint text-xs slate-400
││ 만들어져요. 최소 10줄 이상 권장합니다.   ││
││                                          ││
││ [           페르소나 생성              ] ││  주 버튼 w-full, 로딩 시 disabled
│└──────────────────────────────────────────┘│     + "페르소나 생성 중..."
└────────────────────────────────────────────┘
```
| 요소 | 규칙 |
|---|---|
| 컨테이너 | 백드롭 `fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm flex items-end justify-center`; 시트 `w-full max-w-lg h-[92dvh] flex flex-col bg-white border border-slate-200 rounded-t-3xl shadow-soft-lg animate-slide-up` |
| 본문 | `px-5 pb-6 flex-1 min-h-0 overflow-y-auto flex flex-col gap-3`. textarea가 `flex-1`로 남은 높이를 채운다(D3) |
| 입력 | 상대방 이름(필수), 나의 이름(선택 — 비우면 `my_name: ""`), 대화 textarea(`rows=8`, `resize-none`, `leading-relaxed`) |
| 검증(제출 시, 순서대로 토스트) | ① 이름 공백 → `toast.enterName` ② 키 없음 → `status.noKey` ③ 대화 trim 길이 < 20(PRD FR-7의 임시값) → `toast.convTooShort`. 힌트의 "10줄 이상 권장"은 안내이고 거부 기준은 20자다 — 둘은 다른 개념 |
| 로딩 | 버튼 `disabled` + 라벨 `페르소나 생성 중...`. 시트는 열린 채 유지, 백드롭 닫기 비활성(§1.1 A) |
| 성공 | 토스트 `toast.personaCreated {name}`(성공) → 폼 초기화 → 시트 닫힘 → 목록 재조회 |
| 실패 | 토스트에 `Error.message`(TRD `gemini.ts`가 만든 사용자 문구) 그대로. 없으면 `toast.personaCreateFail`. 시트와 입력은 **유지**(재시도 가능). LLM 응답이 JSON이 아니면 실패로 보지 않고 원문을 보존해 저장한다(PRD FR-11) — 목록 요약은 비고, 상세 모달이 `raw` 항목으로 원문을 보여 준다 |
| 취소 | 닫기(X)·백드롭·ESC → 입력 폐기 |
| 확장 예정 | P5에서 캡처 이미지(멀티모달) 입력을 이 시트에 추가할 계획(PLAN 참조). 0.1 화면에는 없으며, 그때 이 절을 갱신한다 |

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
│ [   이 페르소나로 분석   ] [   삭제   ]  │  indigo-50 / red-50
└──────────────────────────────────────────┘
```
| 항목 | 규칙 |
|---|---|
| 필드 표시 순서 | `PERSONA_FIELDS` 순서(TRD): summary(상단 블록) → communication_style, speech_level, vocabulary_examples, sentence_style, emoji_symbol_usage, texting_habits, emotional_tendencies, what_they_value, how_they_seek_response, relationship_dynamics. 라벨은 i18n `persona.field.*` |
| 값 렌더 | 배열 → 태그(`rounded-full bg-indigo-50 text-indigo-600 text-xs`), 문자열 → `text-sm whitespace-pre-wrap`. 객체가 오면 값들을 ` / `로 이어 문자열화(LLM이 스키마를 벗어나도 깨지지 않게). 빈 값 항목은 숨김. 알 수 없는 키는 키 이름을 라벨로 그대로 표시 |
| 나/상대 탭 | `my_name`이 있고 `my_persona`가 비어 있지 않을 때만 세그먼트 표시. 기본 탭 = 상대. 탭에 따라 summary 블록·항목 카드가 교체된다 |
| 원본 대화 | 기본 접힘. 펼치면 `pre text-xs whitespace-pre-wrap max-h-48 overflow-y-auto` |
| 삭제 | `window.confirm("\"{name}\" 페르소나를 삭제할까요?")` → 확인 시 `removePersona` → 토스트 `toast.personaDeleted` → 모달 닫힘 → 목록 재조회. 실패 → `toast.deleteFail` |
| 이 페르소나로 분석 | `useApp.setSelectedPersonaId(id)`(TRD §3.9 Zustand 스토어) 후 `#/analyze`로 이동, 토스트 `toast.personaSelected` |
| 상세 로딩 | 카드 탭 → `getPersona` 동안 `z-40` 딤(`bg-slate-900/20 backdrop-blur-sm`) + 중앙 `불러오는 중...` 카드. 실패 → `toast.loadDetailFail` |

---

## 6. 탭 2 — 분석하기 (v1: 받은 메시지 1건)

```
┌────────────────────────────────────────────┐
│ ┌────────────────────────────────────────┐ │  ← 페르소나 0개일 때만: amber 배너
│ │ 먼저 페르소나 탭에서 상대방의 대화를   │ │
│ │ 분석해 페르소나를 만들어주세요.        │ │
│ └────────────────────────────────────────┘ │
│ 분석하기                                   │  h1
│ 상대방이 보낸 메시지를 입력하세요          │  text-sm slate-500
│                                            │
│ 페르소나 선택                              │  섹션 라벨(uppercase xs)
│ [(김) 김민준] [(이) 이지원] [(박) 박서연]→ │  가로 스크롤 칩, scrollbar-none
│                                            │
│ ┌────────────────────────────────────────┐ │  카드(bg-white, shadow-soft-sm)
│ │ 예) 야 오늘 뭐해? 시간 돼?             │ │  textarea rows=5, 투명 배경
│ │                                        │ │
│ │                                        │ │
│ │ 김민준 · Gemini            [ 분석하기 ]│ │  footer: 캡션 + 주 버튼(rounded-xl)
│ └────────────────────────────────────────┘ │
│                                            │
│ ┌──────────┐                               │  로딩: 말풍선 안 점 3개 pulse
│ │ • • •    │                               │
│ └──────────┘                               │
│                                            │
│ ┌────────────────────────────────────────┐ │  결과(fade-in)
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
| 요소 | 규칙 |
|---|---|
| 페르소나 칩 | `listPersonaSummaries()` 결과. 칩 = 6×6 이니셜 아바타 + 이름, 활성/비활성은 §2.5 칩 레시피. 진입 시 `useApp.selectedPersonaId`(TRD §3.9)가 목록에 있으면 그것을, 없으면 첫 번째를 선택. 가로 스크롤 `flex gap-2 overflow-x-auto pb-1 scrollbar-none` |
| 페르소나 없음 | 상단 amber 배너 안내. 분석 버튼 `disabled` |
| 입력 카드 | `rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-soft-sm`; textarea `bg-transparent px-5 pt-4 pb-2 rows=5 resize-none`; footer `px-4 pb-3 flex justify-between`: 좌 캡션 `{선택 페르소나명} · Gemini`(text-xs slate-400), 우 `분석하기`(`rounded-xl`, `disabled:opacity-40 disabled:shadow-none`) |
| 단축키 | textarea에서 Ctrl/Cmd+Enter → 분석 실행 |
| 검증(순서대로 토스트) | ① 페르소나 미선택 → `toast.selectPersona` ② 메시지 공백 → `toast.enterMessage` ③ 키 없음 → `status.noKey` |
| 로딩 | 버튼 `disabled` + 라벨 `메시지 분석 중...`; 입력 카드 아래 채팅 말풍선 모양(`rounded-2xl rounded-tl-sm`) 안에 인디고 점 3개 `animate-pulse`(150ms 간격 지연). 이전 결과는 그대로 남겨 두고 새 결과로 교체 |
| 결과 | `analyzeMessage(personaId, message)` 반환 `AnalysisRecord`를 카드로. 분석 카드(강조 블록) + 후보 3장. 결과는 자동으로 **기록에 저장**된다(별도 저장 버튼 없음) |
| 후보 카드 | 헤더 `px-4 py-3 border-b bg-slate-50 flex gap-3`: 번호 원(`w-7 h-7 rounded-full bg-brand-gradient text-white text-xs font-bold`) + `label`(비어 있으면 `후보 {n}`). 본문: `원하는 이유:`(strong) + `reason`(text-xs slate-500) → `response`(text-sm slate-900 whitespace-pre-wrap) → 우하단 `복사하기` 텍스트 버튼(복사 아이콘 12px) |
| 후보 3축 | 프롬프트가 요구하는 세 축의 정식 라벨(PRD FR-13: "깊은 공감·수용형" / "공감 + 함께 해결형" / "공감 + 분위기 전환형")이 `label`에 담긴다. UI는 라벨을 그대로 표시하고 순서를 바꾸지 않는다 |
| 복사 | `navigator.clipboard.writeText(response)` → 토스트 `✓ 복사됨`(성공). 실패 → `toast.copyFail` |
| 실패 | 토스트에 `Error.message` 그대로(없으면 `toast.analyzeFail`). 입력은 유지 |

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
| 미리보기 | `message`가 55자 초과면 `slice(0,55) + "..."`, 한 줄 `truncate` |
| 펼침 내용 | 분석 카드 → 후보 3장(§6과 같은 구조, 복사 버튼은 두지 않음 — 복사는 분석 탭에서, PRD FR-21. 추가 여부는 §12) → `기록 삭제` |
| 삭제 | `window.confirm("이 분석 기록을 삭제할까요?")` → `removeAnalysis` → 목록에서 제거 → 토스트 `toast.historyDeleted`. 실패 → `toast.deleteFail` |
| 빈 상태 | 점선 컨테이너 + `아직 분석 기록이 없어요`(CTA 없음 — 분석 탭에서 생성되므로) |
| 로딩 | 중앙 `불러오는 중...` |

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
| LLM 호출(생성) | 제출 버튼 `disabled` + 라벨 교체(`페르소나 생성 중...`). 다른 입력은 편집 가능하되 제출 불가 |
| LLM 호출(분석) | 버튼 `disabled` + 라벨 `메시지 분석 중...` + 말풍선 점 3개 인디케이터 |
| 상세 조회 | 화면 전체 딤(`slate-900/20`) + 중앙 카드 `불러오는 중...` |
| 진행률 | 표시하지 않음(LLM 응답 시간을 예측할 수 없음; 지연 수치는 미실측). 텍스트 요청 타임아웃 60초는 TRD의 `gemini.ts`가 오류로 변환해 토스트로 알린다 |

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
삭제(페르소나·기록)는 `window.confirm`으로 재확인한다. 0.1에서는 커스텀 확인 모달을 만들지 않는다(구현 단순, 브라우저 네이티브가 모바일에서도 충분히 명확). 키 삭제는 재확인 없음(§4.2).

---

## 9. 인터랙션 규칙

| 규칙 | 내용 |
|---|---|
| 오버레이 닫기 | 생성 시트·상세 모달: **백드롭 클릭**, **우상단 X**, **ESC** 세 가지. 온보딩 모달은 예외(닫기 불가). 백드롭 클릭은 "백드롭 자체를 눌렀을 때"만 인정(이벤트 target이 백드롭 요소) — 카드 내부 클릭이 전파되어 닫히지 않게 한다 |
| 오버레이 등장 | 시트·상세 `animate-slide-up`(0.24s), 온보딩 카드·결과·펼침 `animate-fade-in`(0.18s). 퇴장 애니메이션은 두지 않는다(즉시 언마운트) |
| 스크롤 잠금 | 오버레이가 열린 동안 뒤 페이지 스크롤은 잠그지 않는다(0.1). 시트는 자체 `overflow-y-auto` |
| 탭 전환 | 탭을 바꾸면 스크롤을 최상단으로 되돌린다. 각 탭은 진입 시 목록을 다시 조회한다(다른 탭에서의 생성·삭제 반영) |
| 입력 유지 | 탭 전환 시 각 탭은 언마운트되어 입력값·결과를 보존하지 않는다. 생성 시트 닫기도 입력 폐기 |
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
`<영역>.<대상>[.<세부>]` 소문자 점 표기. 영역은 아래 11종으로 고정한다.

| 영역 | 용도 | 예 |
|---|---|---|
| `app.*` | 앱 전역 | `app.title` |
| `nav.*` | 하단 탭 라벨 | `nav.personas`, `nav.analyze`, `nav.history` |
| `common.*` | 공용 동작/상태 | `common.loading`, `common.save`, `common.cancel`, `common.delete`, `common.candidateN` |
| `status.*` | 헤더 키 상태 | `status.ready`, `status.noKey` |
| `onboarding.*` | 온보딩 모달 | `onboarding.welcomeTitle`, `onboarding.welcomeDesc`, `onboarding.intro`, `onboarding.keyLabel`, `onboarding.consent`, `onboarding.helpCta`, `onboarding.saveKey` |
| `persona.*` | 페르소나 탭·생성·상세 | `persona.empty.title`, `persona.create.title`, `persona.create.otherName`, `persona.create.convPlaceholder`, `persona.detail.title`, `persona.detail.convToggle`, `persona.field.communication_style` … `persona.field.relationship_dynamics` |
| `analyze.*` | 분석 탭 | `analyze.selectPersona`, `analyze.messagePlaceholder`, `analyze.run`, `analyze.aiLabel`, `analyze.candidatesTitle`, `analyze.reason`, `analyze.copy`, `analyze.copied`, `analyze.noPersonaHint`, `analyze.loading` |
| `history.*` | 기록 탭 | `history.empty`, `history.candidatesTitle`, `history.delete`, `history.confirmDelete` |
| `toast.*` | 사용자 행위 결과 알림 | `toast.keySaved`, `toast.keyDeleted`, `toast.invalidKeyFormat`, `toast.confirmLocalOnly`, `toast.enterName`, `toast.convTooShort`, `toast.personaCreated`, `toast.personaCreateFail`, `toast.personaDeleted`, `toast.personaSelected`, `toast.selectPersona`, `toast.enterMessage`, `toast.analyzeFail`, `toast.copyFail`, `toast.historyDeleted`, `toast.deleteFail`, `toast.loadDetailFail`, `toast.load*Fail` |
| `err.*` | Gemini/저장소 오류(gemini.ts·db.ts가 사용) | `err.invalidKey`, `err.network`, `err.rateLimit`, `err.timeout`, `err.serviceTemp`, `err.aiGeneric`, `err.keyNotSet`, `err.dbOpen` |
| `parse.*` | LLM 응답 JSON 파싱 실패 폴백 문구(analysis.ts가 사용, TRD §3.8) | `parse.failAnalysis`, `parse.failLabel`, `parse.failReason` |

- 필드 라벨 키의 세부 이름은 `PersonaFields`의 속성명과 **동일**하게 둔다(`persona.field.<속성명>`) — 알 수 없는 키가 와도 `t()` 폴백으로 속성명이 그대로 표시된다.
- 보간 파라미터는 `{name}`, `{my}`, `{n}`, `{date}`, `{msg}`처럼 의미가 드러나는 이름을 쓴다.
- 최종 키 목록은 P1(`i18n.ts` 작성) 시점에 확정하고, 이 표와 어긋나면 이 표를 갱신한다.

---

## 11. 접근성 · 모바일

| 항목 | 규칙 |
|---|---|
| 터치 타깃 | 탭 가능한 요소는 최소 44×44px. 하단 탭(`py-3` + 아이콘 + 라벨), 주 버튼(`py-3`~`py-3.5`), 목록 카드는 충족. 텍스트 버튼(복사·저장·취소)은 `py-2` 이상 패딩으로 높이를 확보 |
| 뷰포트 | `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">`, `theme-color #6366f1` |
| 안전 영역 | 하단 탭에 `padding-bottom: env(safe-area-inset-bottom)`을 더해 홈 인디케이터와 겹치지 않게 한다. `main`의 하단 패딩도 같은 값을 더한다. 실기기 효과는 §12 |
| 높이 단위 | `dvh` 사용(`min-h-dvh`, `h-[92dvh]`) — 모바일 브라우저 주소창 변동 대응 |
| 키보드 | Enter/ESC/Ctrl+Enter 단축키(§9). 모든 컨트롤은 실제 `<button>`/`<input>`/`<textarea>`/`<a>`로 만들어 탭 포커스 순서를 자연스럽게 둔다 |
| 시맨틱 | 언어 토글 `role="group" aria-label="Language"` + `aria-pressed`; 장식 이미지 `alt=""`; 상세 모달 제목은 `h3`, 화면 제목은 `h1`(한 화면에 하나) |
| 대비 | WCAG 상대 휘도로 계산한 값(2026-09-05): 본문 slate-900/white 17.85, 보조 slate-500/white 4.76·/slate-50(페이지 배경) 4.55 — AA(4.5:1) 통과. slate-400/white는 2.56이라 힌트·비활성 전용(본문 금지). **AA 미달 조합**: 위험 버튼 red-500/red-50 3.44, 성공 배지 emerald-600/emerald-50 3.58 — 배지·버튼 라벨에 한정해 감수, 조정 여부는 §12 |
| 폰트 크기 | 최소 `text-xs`(12px). 11px(필드 라벨)은 대문자 라벨 한 곳에만 허용 |
| 모션 | 총 0.24s 이하의 짧은 전환만 사용. `prefers-reduced-motion` 대응은 0.1 비목표(§12) |
| 네트워크 | 오프라인이면 LLM 호출이 `err.network` 토스트로 실패한다. 저장된 페르소나·기록 조회는 오프라인에서도 동작(IndexedDB) |
| 같은 Wi-Fi 휴대폰 테스트 | `server/index.js`(정적, 0.0.0.0)로 접속해 위 항목을 실기기에서 확인(Acceptance A6) |

---

## 12. 미확정 항목

| # | 항목 | 현재 판단 | 확정 시점 |
|---|---|---|---|
| U1 | 정식 표시명 | 코드네임 "Persona Mirror"로 진행, i18n `app.title` 한 곳에서 교체 | M1 직전 |
| U2 | 로고·파비콘 자산 | P1에서 임시 자산을 두고, 없으면 이니셜형 플레이스홀더로 대체 | P1~M1 |
| U3 | Pretendard 웹폰트 로드 | 스택에만 선언(설치된 경우 사용, 아니면 시스템 폰트). CDN 로드는 P7 CSP와 충돌 가능성이 있어 보류 | P7 |
| U4 | 생성 시트와 소프트 키보드 겹침 | `h-[92dvh]` + 내부 스크롤로 대응한다고 가정. 실기기 미확인 | P3 모바일 스모크 |
| U5 | 하단 탭 safe-area 패딩의 실효 | `env(safe-area-inset-bottom)` 적용 예정. 홈 인디케이터 기기에서 미실측 | P3 |
| U6 | ESC 닫기 | 규칙으로 두되 모바일에서는 무의미. 데스크톱 편의로 P3에서 구현 | P3 |
| U7 | HTTP(LAN) 접속 시 클립보드 API | `navigator.clipboard`가 제한될 수 있음 → 실패 토스트로 안내. 대체 복사 경로는 미정 | P6 실사용 |
| U8 | 토스트 자동 닫힘 4초 | 임시값. 긴 오류 문구 가독성은 실사용 후 조정 | P6 |
| U9 | 기록 탭 후보 카드의 복사 버튼 | 0.1은 미포함(분석 탭에서 복사, PRD FR-21). 실사용에서 요구되면 추가 | P6 |
| U10 | LLM 대기 시간 표시 | 진행률 없이 점 3개. 지연 수치 미실측(키 필요)이라 기대 시간 문구를 넣지 않음 | M1 이후 |
| U11 | `prefers-reduced-motion` | 비목표. 모션이 짧아 우선순위 낮음 | 미정 |
| U12 | en 문구 품질 | P1에서 초안 작성, 원어민 검수 없음 | 미정 |
| U13 | 이니셜 규칙 | `getInitial`은 첫 글자(영문 대문자). 다국어 이름·이모지 이름은 미검토 | P6 |
| U14 | 생성 시트 백드롭 오클릭으로 입력 유실(§1.1 A) | 감수한다(확인 대화상자 없음). 실사용에서 발생 빈도를 관찰해 대응 필요 여부 판단 | P6 |
| U15 | 온보딩 고지 문구·위치(PRD DR-4 Gemini 전송·민감정보 주의, DR-6 복구 불가) | 기본안은 온보딩 모달 intro/동의 문구. 세부 문구는 P2 온보딩 문구 작성 시 PRD/TRD와 맞춤 | P2 docs |
| U16 | 색 대비 AA 미달(red-500/red-50 3.44, emerald-600/emerald-50 3.58, §11) | 배지·버튼 라벨에 한정해 감수. 더 진한 단계로 조정할지 검토(예: emerald-700/emerald-50은 5.21로 통과, red-600/red-50은 4.41로 여전히 미달) | P6 |
