# 🧠 Persona Mirror

> 대화 기록으로 상대방의 페르소나를 분석하고, 받은 메시지에서 "상대방이 원하는 답변"을 추론해주는 모바일 웹 앱

**Client-First 아키텍처**: 개인 데이터는 전부 **내 브라우저**에 저장되고, AI 분석은 **내 Google AI Studio API 키**로 브라우저가 직접 수행합니다. 배포 서버는 정적 파일만 서빙하며 대화 내용을 보관하지 않습니다.

> 이 문서는 P1(앱 스캐폴드) 시점의 초안입니다. 온보딩·페르소나 생성·메시지 분석 기능은 아직 없으며, 각 단계가 진행되며 이 README도 갱신됩니다.

---

## 실행 방법

### 사전 조건
- Node.js 20 이상

### 설치 & 개발 & 빌드

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 (HMR)
npm run dev
# → http://localhost:4121

# 3. 프로덕션 빌드 (dist/ 생성)
npm run build

# 4. 정적 서버 시작
npm start
# → http://localhost:8000
```

### 접속 방법

| 기기 | 주소 |
|------|------|
| PC | http://localhost:8000 |
| 휴대폰(같은 Wi-Fi) | http://[PC의 IP주소]:8000 |

> PC IP 확인: `ipconfig` (Windows) / `ifconfig` (Mac/Linux)

---

## 프로젝트 구조 (P1 시점)

```
persona-mirror/
├── docs/                       # PRD / TRD / DESIGN / PLAN / LOG
├── index.html                  # Vite React 엔트리 (#root)
├── server/index.js             # Express 정적 서버 (dist/ 서빙)
├── src/
│   ├── main.tsx                # React 엔트리 + HashRouter
│   ├── App.tsx                 # 상단바(로고·앱명·언어 토글) + 하단 탭 3개 + 라우트
│   ├── index.css               # Tailwind base + 공용 유틸
│   ├── components/             # Toast · LanguageToggle
│   ├── routes/                 # PersonaPage · AnalyzePage · HistoryPage (placeholder)
│   └── lib/                    # i18n(ko/en) · useI18n · store(Zustand, toasts)
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 예정 기능

- API 키 온보딩과 Gemini 클라이언트 연결
- 대화 기록으로 페르소나 생성·목록·상세·삭제
- 받은 메시지 심리 분석과 답변 후보 제안, 분석 기록 조회

## 문서

자세한 제품·기술·화면·계획 설계는 다음 문서를 참고하세요.

- [PRD](docs/PRD.md) — 제품 요구사항
- [TRD](docs/TRD.md) — 기술 설계·모듈 계약
- [DESIGN](docs/DESIGN.md) — 화면·인터랙션·디자인 토큰
- [PLAN](docs/PLAN.md) — 단계별 구현 계획
- [LOG](docs/LOG.md) — 변경 이력
