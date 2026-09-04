// 앱 전역 상수 — 모델/저장소/DB 설정의 단일 출처(single source of truth).
// 다른 모듈은 리터럴을 쓰지 않고 이 상수만 import해서 쓴다 (TRD §3.2).

/** Gemini 모델(단일). 멀티모달 flash 계열이라 텍스트 외 입력도 같은 모델로 처리할 수 있다. */
export const TEXT_MODEL = 'gemini-3.1-flash-lite';

/** 텍스트 요청 타임아웃(ms). */
export const TEXT_REQUEST_TIMEOUT_MS = 60_000;

/** 이미지가 붙은 요청 타임아웃(ms). 인라인 base64 페이로드가 무거워 넉넉히 잡는다 — 값은 실측 전 여유값. */
export const IMAGE_REQUEST_TIMEOUT_MS = 180_000;

/**
 * 페르소나 생성에 첨부한 대화 파일(.txt)에서 실제로 쓸 말미 글자 수 상한(TRD §3.2).
 * 최근 대화일수록 지금의 말투·관계를 더 잘 반영하므로 전체가 아니라 말미만 쓴다.
 * 값의 근거는 샘플 대화 평균 32.6자/메시지 기준 약 490개 메시지(약 46 KB)라는 계산이며,
 * 이 분량에서 토큰·지연·품질을 재 본 적은 없다.
 */
export const PERSONA_CHAT_TAIL_CHARS = 16_000;

/** API 키를 보관하는 localStorage 키(TRD §3.2). */
export const API_KEY_STORAGE_KEY = 'pm_gemini_key';

/** 쿠키에 저장하던 구버전 API 키 이름. 읽으면 localStorage로 옮기고 쿠키는 만료시킨다(TRD §3.3). */
export const LEGACY_COOKIE_KEY_NAME = 'pm_gemini_key';

/** IndexedDB 설정 (db.ts/personaRepo.ts/analysisRepo.ts가 사용). */
export const DB_NAME = 'persona-mirror';
export const DB_VERSION = 1;
export const STORE_PERSONAS = 'personas';
export const STORE_ANALYSES = 'analyses';

/** Google AI Studio API 키 발급 안내 링크. */
export const GEMINI_API_KEY_HELP_URL = 'https://aistudio.google.com/app/apikey';
