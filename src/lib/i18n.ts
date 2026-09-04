// 경량 i18n 레이어 — 프레임워크 없이 ko/en 전환을 담당하는 단일 출처.
// - 초기 언어: localStorage(pm_lang) → 없으면 navigator.language 자동 감지
// - t(): 동적으로 생성되는 문자열용 ({param} 보간 지원)
// - onLangChange(): 동적 뷰가 스스로 다시 렌더링하도록 구독
//
// 사전 키는 DESIGN.md §10.1 영역 규칙(app/nav/common/status/onboarding/persona/analyze/history/toast/err/parse/btn)을 따른다.

export type Lang = 'ko' | 'en';

const LANG_STORAGE_KEY = 'pm_lang';

type Dict = Record<string, string>;

const MESSAGES: Record<Lang, Dict> = {
  ko: {
    'app.title': 'Persora',

    'nav.personas': '페르소나',
    'nav.analyze': '분석하기',
    'nav.history': '기록',

    'persona.title': '페르소나',
    'persona.subtitle': '대화 기록을 입력하면 AI가 상대방의 페르소나를 분석해요',
    'analyze.title': '분석하기',
    'analyze.subtitle': '상대방이 보낸 메시지를 입력하세요',
    'history.title': '기록',
    'history.subtitle': '원하는 답변 후보',

    // 헤더 — 키 상태(ApiKeyStatus)
    'status.ready': 'Gemini 준비됨',
    'status.noKey': 'API 키 미등록',

    // 페르소나 탭 — 목록/빈 상태
    'persona.summaryFallback': '페르소나 분석 완료',
    'persona.empty.title': '저장된 페르소나 없음',
    'persona.empty.desc': '대화 기록을 입력하면 AI가 상대방의 페르소나를 분석해요',
    'persona.createCta': '새 페르소나 만들기',

    // 페르소나 탭 — 생성 바텀 시트
    'persona.create.title': '새 페르소나 만들기',
    'persona.create.otherName': '상대방 이름',
    'persona.create.otherNamePlaceholder': '예) 김민준',
    'persona.create.myName': '나의 이름',
    'persona.create.myNamePlaceholder': '예) 나',
    'persona.create.convPlaceholder':
      '김민준: 야 오늘 뭐해?\n나: 집에 있어. 왜?\n김민준: 아 그냥... 오늘 약속 있나 해서\n나: 없는데 왜?\n...',
    'persona.create.textHint': '📋 대화가 많을수록 더 정확한 페르소나가 만들어져요. 최소 10줄 이상 권장합니다.',
    'persona.create.loading': '페르소나 생성 중...',

    // 페르소나 탭 — 상세 모달
    'persona.detail.title': '페르소나 상세',
    'persona.detail.useForAnalysis': '이 페르소나로 분석',
    'persona.detail.convToggle': '📝 원본 대화 기록 보기',
    'persona.detail.tabMe': '🙋 나 ({my})',
    'persona.detail.createdAt': '생성일 {date}',
    'persona.detail.myLabel': '나: {my}',
    'persona.detail.confirmDelete': '"{name}" 페르소나를 삭제할까요?',

    // 페르소나 필드 라벨 (PersonaFields 속성명과 동일 — DESIGN §10.1)
    'persona.field.communication_style': '소통 방식',
    'persona.field.speech_level': '경어/어미 패턴',
    'persona.field.vocabulary_examples': '자주 쓰는 표현',
    'persona.field.sentence_style': '문장 스타일',
    'persona.field.emoji_symbol_usage': '이모지/특수문자',
    'persona.field.texting_habits': '메시징 습관',
    'persona.field.emotional_tendencies': '감정 표현',
    'persona.field.what_they_value': '중요 가치',
    'persona.field.how_they_seek_response': '원하는 반응',
    'persona.field.relationship_dynamics': '관계 역학',

    // 분석 탭 (AnalyzePage) — DESIGN §10.1 analyze.*
    'analyze.selectPersona': '페르소나 선택',
    'analyze.messagePlaceholder': '예) 야 오늘 뭐해? 시간 돼?',
    'analyze.run': '분석하기',
    'analyze.loading': '메시지 분석 중...',
    'analyze.aiLabel': 'AI 심리 분석',
    'analyze.candidatesTitle': '원하는 답변 후보 3가지',
    'analyze.reason': '원하는 이유:',
    'analyze.copy': '복사하기',
    'analyze.noPersonaHint': '먼저 페르소나 탭에서 상대방의 대화를 분석해 페르소나를 만들어주세요.',

    // 기록 탭 (HistoryPage) — DESIGN §10.1 history.*
    'history.empty': '아직 분석 기록이 없어요',
    'history.candidatesTitle': '원하는 답변 후보',
    'history.delete': '기록 삭제',
    'history.confirmDelete': '이 분석 기록을 삭제할까요?',

    // 공용
    'common.loading': '불러오는 중...',
    'common.candidateN': '후보 {n}',

    // 토스트 — 페르소나 생성/조회/삭제
    'toast.enterName': '이름을 입력해주세요',
    'toast.convTooShort': '대화 기록이 너무 짧아요',
    'toast.personaCreated': '{name} 페르소나 생성 완료!',
    'toast.personaCreateFail': '페르소나 생성에 실패했습니다',
    'toast.loadPersonaFail': '페르소나를 불러오지 못했습니다',
    'toast.loadDetailFail': '상세 정보를 불러오지 못했습니다',
    'toast.personaSelected': '{name} 페르소나 선택됨',
    'toast.deleteFail': '삭제에 실패했습니다',
    'toast.personaDeleted': '{name} 삭제 완료',

    // 토스트 — 분석/기록 (P4)
    'toast.selectPersona': '페르소나를 선택해주세요',
    'toast.enterMessage': '메시지를 입력해주세요',
    'toast.analyzeFail': '분석에 실패했습니다. API 키 설정을 확인해주세요',
    'toast.copied': '✓ 복사됨',
    'toast.copyFail': '클립보드 복사 실패',
    'toast.loadHistoryFail': '기록을 불러오지 못했습니다',
    'toast.historyDeleted': '기록 삭제 완료',

    // 분석 응답 파싱 실패 폴백(analysis.ts가 사용, TRD §3.8 — 저장 시점 언어로 고정됨)
    'parse.failAnalysis': 'AI 응답을 파싱하는 데 문제가 발생했습니다. 원본 응답을 확인하세요.',
    'parse.failLabel': '원본 응답',
    'parse.failReason': 'JSON 파싱 실패',

    // DB 오류(TRD §3.6 — App.tsx가 initDB 실패를 잡아 사용)
    'err.dbOpen': '브라우저 저장소를 여는 데 실패했습니다.',

    // 온보딩(OnboardingModal)
    'onboarding.title': 'Gemini API 키 설정',
    'onboarding.welcomeTitle': 'Persora에 오신 걸 환영합니다',
    'onboarding.welcomeDesc': '상대방의 페르소나에 맞는 답장을 찾아드려요.',
    'onboarding.intro':
      '이 앱은 당신의 Google AI Studio(Gemini) API 키로 동작합니다. 키와 모든 데이터는 이 브라우저에만 저장되며 서버로 전송되지 않습니다.',
    'onboarding.keyLabel': 'API 키',
    'onboarding.consent': '대화 내용이 Gemini API로 전송되고, 로컬 데이터는 브라우저 데이터 삭제나 기기 변경 시 복구할 수 없음을 이해했습니다.',
    'onboarding.helpCta': 'AI Studio에서 키 발급받기 ↗',

    // 공용 버튼/상태
    'common.save': '저장',
    'common.cancel': '취소',
    'common.delete': '삭제',
    'btn.saveKey': '키 저장하고 시작하기',

    // 토스트(온보딩 · 키 변경)
    'toast.invalidKeyFormat': 'API 키 형식이 올바르지 않습니다',
    'toast.confirmLocalOnly': '개인정보 및 로컬 저장 안내를 확인해주세요',
    'toast.keySaved': 'API 키가 저장되었습니다',
    'toast.keyDeleted': '저장된 키를 삭제했습니다',

    // Gemini 오류(gemini.ts가 사용, 사용자 노출)
    'err.keyNotSet': 'API 키가 설정되지 않았습니다. 키를 먼저 입력해주세요.',
    'err.invalidKey': 'API 키가 유효하지 않습니다. 키를 다시 확인해주세요.',
    'err.network': '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.',
    'err.timeout': '응답이 너무 오래 걸려 시간 초과되었습니다. 잠시 후 다시 시도해주세요.',
    'err.rateLimit': 'API 사용 한도(무료 할당량)를 초과했습니다. 잠시 후 다시 시도하거나 결제/할당량을 확인해주세요.',
    'err.serviceTemp': 'Gemini 서비스에 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    'err.aiGeneric': 'AI 응답 중 오류가 발생했습니다: {msg}',
  },
  en: {
    'app.title': 'Persora',

    'nav.personas': 'Personas',
    'nav.analyze': 'Analyze',
    'nav.history': 'History',

    'persona.title': 'Personas',
    'persona.subtitle': 'Paste a conversation and AI will analyze the other person’s persona',
    'analyze.title': 'Analyze',
    'analyze.subtitle': 'Paste the message you received',
    'history.title': 'History',
    'history.subtitle': 'Suggested replies',

    // Header — key status (ApiKeyStatus)
    'status.ready': 'Gemini ready',
    'status.noKey': 'No API key',

    // Personas tab — list/empty state
    'persona.summaryFallback': 'Persona analysis complete',
    'persona.empty.title': 'No saved personas',
    'persona.empty.desc': 'Paste a conversation and AI will analyze the other person’s persona',
    'persona.createCta': 'Create persona',

    // Personas tab — create bottom sheet
    'persona.create.title': 'Create persona',
    'persona.create.otherName': 'Their name',
    'persona.create.otherNamePlaceholder': 'e.g. Alex',
    'persona.create.myName': 'Your name',
    'persona.create.myNamePlaceholder': 'e.g. Me',
    'persona.create.convPlaceholder':
      'Alex: Hey, what are you up to today?\nMe: Just home. Why?\nAlex: Oh nothing... just wondering if you’re free\nMe: I am, what’s up?\n...',
    'persona.create.textHint': '📋 The more conversation you paste, the more accurate the persona. At least 10 lines recommended.',
    'persona.create.loading': 'Creating persona...',

    // Personas tab — detail modal
    'persona.detail.title': 'Persona details',
    'persona.detail.useForAnalysis': 'Analyze with this persona',
    'persona.detail.convToggle': '📝 View original conversation',
    'persona.detail.tabMe': '🙋 Me ({my})',
    'persona.detail.createdAt': 'Created {date}',
    'persona.detail.myLabel': 'Me: {my}',
    'persona.detail.confirmDelete': 'Delete the "{name}" persona?',

    // Persona field labels (must match PersonaFields property names — DESIGN §10.1)
    'persona.field.communication_style': 'Communication style',
    'persona.field.speech_level': 'Politeness / endings',
    'persona.field.vocabulary_examples': 'Frequent expressions',
    'persona.field.sentence_style': 'Sentence style',
    'persona.field.emoji_symbol_usage': 'Emoji / symbols',
    'persona.field.texting_habits': 'Texting habits',
    'persona.field.emotional_tendencies': 'Emotional expression',
    'persona.field.what_they_value': 'What they value',
    'persona.field.how_they_seek_response': 'Desired response',
    'persona.field.relationship_dynamics': 'Relationship dynamics',

    // Analyze tab (AnalyzePage) — DESIGN §10.1 analyze.*
    'analyze.selectPersona': 'Select a persona',
    'analyze.messagePlaceholder': 'e.g. Hey, what are you up to today? Free to talk?',
    'analyze.run': 'Analyze',
    'analyze.loading': 'Analyzing message...',
    'analyze.aiLabel': 'AI psychological analysis',
    'analyze.candidatesTitle': '3 suggested replies',
    'analyze.reason': 'Why they want it:',
    'analyze.copy': 'Copy',
    'analyze.noPersonaHint': 'First create a persona by analyzing a conversation in the Personas tab.',

    // History tab (HistoryPage) — DESIGN §10.1 history.*
    'history.empty': 'No analysis history yet',
    'history.candidatesTitle': 'Suggested replies',
    'history.delete': 'Delete record',
    'history.confirmDelete': 'Delete this analysis record?',

    // Common
    'common.loading': 'Loading...',
    'common.candidateN': 'Option {n}',

    // Toasts — persona create/view/delete
    'toast.enterName': 'Please enter a name',
    'toast.convTooShort': 'The conversation is too short',
    'toast.personaCreated': '{name} persona created!',
    'toast.personaCreateFail': 'Failed to create the persona',
    'toast.loadPersonaFail': 'Failed to load personas',
    'toast.loadDetailFail': 'Failed to load the details',
    'toast.personaSelected': '{name} persona selected',
    'toast.deleteFail': 'Failed to delete',
    'toast.personaDeleted': '{name} deleted',

    // Toasts — analyze/history (P4)
    'toast.selectPersona': 'Please select a persona',
    'toast.enterMessage': 'Please enter a message',
    'toast.analyzeFail': 'Analysis failed. Please check your API key.',
    'toast.copied': '✓ Copied',
    'toast.copyFail': 'Failed to copy to clipboard',
    'toast.loadHistoryFail': 'Failed to load history',
    'toast.historyDeleted': 'Record deleted',

    // Analysis parse-failure fallback (used by analysis.ts, TRD §3.8 — frozen at save-time language)
    'parse.failAnalysis': 'There was a problem parsing the AI response. See the raw response below.',
    'parse.failLabel': 'Raw response',
    'parse.failReason': 'JSON parsing failed',

    // DB error (TRD §3.6 — used by App.tsx when initDB fails)
    'err.dbOpen': 'Failed to open browser storage.',

    // Onboarding (OnboardingModal)
    'onboarding.title': 'Gemini API key',
    'onboarding.welcomeTitle': 'Welcome to Persora',
    'onboarding.welcomeDesc': 'Find the perfect reply that fits the other person’s persona.',
    'onboarding.intro':
      'This app runs on your own Google AI Studio (Gemini) API key. Your key and all data are stored only in this browser and never sent to any server.',
    'onboarding.keyLabel': 'API key',
    'onboarding.consent':
      'I understand conversation data is sent to the Gemini API, and local data cannot be recovered if browser data is cleared or I switch devices.',
    'onboarding.helpCta': 'Get a key from AI Studio ↗',

    // Common buttons/status
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'btn.saveKey': 'Save key & start',

    // Toasts (onboarding · key change)
    'toast.invalidKeyFormat': 'Invalid API key format',
    'toast.confirmLocalOnly': 'Please confirm the privacy and local storage notice',
    'toast.keySaved': 'API key saved',
    'toast.keyDeleted': 'Saved key deleted',

    // Gemini errors (used by gemini.ts, user-facing)
    'err.keyNotSet': 'No API key is set. Please enter your key first.',
    'err.invalidKey': 'The API key is invalid. Please check it again.',
    'err.network': 'A network error occurred. Please check your internet connection.',
    'err.timeout': 'The response took too long and timed out. Please try again in a moment.',
    'err.rateLimit': 'API usage limit (free quota) exceeded. Please retry later or check your billing/quota.',
    'err.serviceTemp': 'Gemini had a temporary error. Please try again in a moment.',
    'err.aiGeneric': 'An error occurred while getting the AI response: {msg}',
  },
};

let currentLang: Lang = detectInitialLang();
const listeners = new Set<() => void>();

/** localStorage → navigator.language 순으로 초기 언어 결정. */
function detectInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'ko' || saved === 'en') return saved;
  } catch {
    // localStorage 접근 불가 — 감지로 폴백
  }
  const nav = (typeof navigator !== 'undefined' && navigator.language) || 'ko';
  return nav.toLowerCase().startsWith('ko') ? 'ko' : 'en';
}

export function getLang(): Lang {
  return currentLang;
}

/** {param} 보간을 적용해 현재 언어의 문자열을 반환. 키가 없으면 ko 사전 → 키 문자열 순으로 폴백. */
export function t(key: string, params?: Record<string, string | number>): string {
  const raw = MESSAGES[currentLang][key] ?? MESSAGES.ko[key] ?? key;
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, p: string) =>
    params[p] !== undefined ? String(params[p]) : `{${p}}`,
  );
}

/** 언어 변경 구독 — 동적 뷰가 자신을 다시 렌더링하도록. 해제 함수 반환. */
export function onLangChange(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** 언어를 설정하고 저장 → <html lang>·document.title 갱신 → 구독자 통지. */
export function setLang(lang: Lang): void {
  if (lang === currentLang) return;
  currentLang = lang;
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // 저장 실패는 무시 (세션 한정으로 동작)
  }
  document.documentElement.lang = lang;
  document.title = t('app.title');
  listeners.forEach((cb) => cb());
}

/** 부팅 시 호출 — <html lang> 동기화 + 문서 제목. */
export function initI18n(): void {
  document.documentElement.lang = currentLang;
  document.title = t('app.title');
}
