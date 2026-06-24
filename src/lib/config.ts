// 앱 전역 상수 — 모델/스토리지/DB 설정의 단일 출처(single source of truth).

// 텍스트·이미지 입력 모두 동일한 Gemini flash 모델을 사용한다.
// gemini-3.1-flash-lite는 멀티모달이라 한글 채팅 캡처 이미지를 직접 판독하며,
// thinking을 끌 수 있어 ~6.5s로 빠르다(별도 비전 모델 불필요).
/** 분석/키 검증/이미지 판독 공용 모델. */
export const TEXT_MODEL = 'gemini-3.1-flash-lite';
/** 이미지(멀티모달) 입력도 동일한 Gemini flash 모델을 쓴다(하위 호환 별칭). */
export const IMAGE_MODEL = TEXT_MODEL;

/**
 * 요청 타임아웃(ms).
 * 이미지 경로는 inline 이미지 페이로드가 무거워 전송이 더 오래 걸리므로 넉넉히 잡아
 * 조기 실패(타임아웃)를 막는다.
 */
export const TEXT_REQUEST_TIMEOUT_MS = 60_000;
export const IMAGE_REQUEST_TIMEOUT_MS = 180_000;

/** 페르소나 생성에 사용할 첨부 대화 파일(.txt)의 말미 글자 수 상한. 최근 대화일수록 현재 말투/관계를 잘 반영하므로 tail만 사용한다. */
export const PERSONA_CHAT_TAIL_CHARS = 16000;

/** API 키를 보관하는 localStorage 키. */
export const API_KEY_STORAGE_KEY = 'pm_gemini_key';

/** 쿠키에 저장하던 구버전 API 키 이름. 읽으면 localStorage로 옮기고 쿠키는 삭제한다. */
export const LEGACY_COOKIE_KEY_NAME = 'pm_gemini_key';

/** IndexedDB 설정. */
export const DB_NAME = 'persona-mirror';
export const DB_VERSION = 1;
export const STORE_PERSONAS = 'personas';
export const STORE_ANALYSES = 'analyses';

/** Google AI Studio API 키 발급 안내 링크. */
export const GEMINI_API_KEY_HELP_URL = 'https://aistudio.google.com/app/apikey';
