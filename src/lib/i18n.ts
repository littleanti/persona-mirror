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
