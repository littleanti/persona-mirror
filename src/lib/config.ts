// 앱 전역 상수 — 모델/저장소/DB 설정의 단일 출처(single source of truth).
// 다른 모듈은 리터럴을 쓰지 않고 이 상수만 import해서 쓴다 (TRD §3.2).

/** Gemini 모델(단일). 멀티모달 flash 계열이라 텍스트 외 입력도 같은 모델로 처리할 수 있다. */
export const TEXT_MODEL = 'gemini-3.1-flash-lite';

/** 텍스트 요청 타임아웃(ms). */
export const TEXT_REQUEST_TIMEOUT_MS = 60_000;

/** API 키를 보관하는 쿠키 이름. */
export const API_KEY_COOKIE_NAME = 'pm_gemini_key';

/** API 키 쿠키 만료(일). */
export const API_KEY_COOKIE_MAX_AGE_DAYS = 365;

/** IndexedDB 설정 (db.ts/personaRepo.ts/analysisRepo.ts가 사용). */
export const DB_NAME = 'persona-mirror';
export const DB_VERSION = 1;
export const STORE_PERSONAS = 'personas';
export const STORE_ANALYSES = 'analyses';

/** Google AI Studio API 키 발급 안내 링크. */
export const GEMINI_API_KEY_HELP_URL = 'https://aistudio.google.com/app/apikey';
