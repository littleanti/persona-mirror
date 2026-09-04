// 경량 i18n 레이어 — 프레임워크 없이 ko/en 전환을 담당하는 단일 출처.
// - 초기 언어: localStorage(pm_lang) → 없으면 navigator.language 자동 감지
// - t(): 동적으로 생성되는 문자열용 ({param} 보간 지원)
// - onLangChange(): 동적 뷰가 스스로 다시 렌더링하도록 구독
//

export type Lang = 'ko' | 'en';

const LANG_STORAGE_KEY = 'pm_lang';

type Dict = Record<string, string>;

const MESSAGES: Record<Lang, Dict> = {
  ko: {
    'app.title': 'Persona Mirror',

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

    // 온보딩(OnboardingModal)
    'onboarding.title': 'Gemini API 키 설정',
    'onboarding.welcomeTitle': 'Persona Mirror에 오신 걸 환영합니다',
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
    'app.title': 'Persona Mirror',

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

    // Onboarding (OnboardingModal)
    'onboarding.title': 'Gemini API key',
    'onboarding.welcomeTitle': 'Welcome to Persona Mirror',
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
