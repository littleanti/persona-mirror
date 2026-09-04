// 모든 모듈이 공유하는 타입 계약(single source of truth). TRD §3.1.
// 변경 시 docs/TRD.md §3 도 함께 갱신할 것.
// PersonaFields / PersonaRecord / PersonaSummary / CreatePersonaInput / CandidateReply / AnalysisRecord (TRD §3.1).

/** LLM이 생성하는 페르소나 항목. 추가 키를 줄 수 있어 인덱스 시그니처를 둔다(UI는 관대하게 표시). */
export interface PersonaFields {
  summary?: string;
  communication_style?: string;
  speech_level?: string;
  vocabulary_examples?: string[];
  sentence_style?: string;
  emoji_symbol_usage?: string;
  texting_habits?: string;
  emotional_tendencies?: string;
  what_they_value?: string;
  how_they_seek_response?: string;
  relationship_dynamics?: string;
  [key: string]: unknown;
}

/** IndexedDB `personas` 스토어 레코드. keyPath = id */
export interface PersonaRecord {
  id: string; // uuid v4
  name: string; // 상대 이름
  my_name: string; // 나의 이름(없으면 "")
  created_at: string; // ISO 8601
  conversation: string; // 원본 대화(브라우저에만 저장)
  persona: PersonaFields; // 상대 페르소나
  my_persona: PersonaFields; // 나의 페르소나(my_name 없으면 {})
  updated_at?: string; // ISO 8601. updatePersona로 재분석한 시각(없으면 미갱신)
}

/** 목록 화면용 경량 요약 */
export interface PersonaSummary {
  id: string;
  name: string;
  my_name: string;
  created_at: string;
  summary: string; // persona.summary ?? ''
}

/**
 * 멀티모달 입력용 인라인 이미지. Gemini `inlineData` 파트에 그대로 실린다.
 * data는 base64 문자열이며 `data:image/png;base64,` 같은 data URL 접두는 제외한다.
 */
export interface InlineImage {
  mimeType: string; // 예: 'image/png', 'image/jpeg'
  data: string; // base64 (data URL 접두 제외)
}

/**
 * 페르소나 생성 입력. 두 모드가 있고 필드로 구분한다.
 * - 텍스트 모드: conversation에 대화 텍스트, images는 비움
 * - 이미지 모드: images에 캡처, conversation은 표시용 플레이스홀더
 */
export interface CreatePersonaInput {
  name: string;
  my_name: string;
  conversation: string;
  images?: InlineImage[];
}

/** 분석 결과의 답변 후보 1개 */
export interface CandidateReply {
  label: string; // 예: "깊은 공감·수용형"
  reason: string; // 상대가 이 답변을 원하는 이유
  response: string; // 나의 말투로 쓴 실제 답장
}

/** IndexedDB `analyses` 스토어 레코드. keyPath = id */
export interface AnalysisRecord {
  id: string;
  persona_id: string;
  persona_name: string; // 삭제된 페르소나여도 기록에 이름이 남도록 비정규화
  message: string; // 답장 대상(타겟) 메시지. 구 스키마 호환을 위해 이름을 유지한다
  analysis: string; // 심리 분석(2~3문장)
  candidates: CandidateReply[]; // 3개 기대
  created_at: string;
  // ── 선택 필드(구 레코드 무회귀) ──
  thread?: string; // 붙여넣은 최근 대화 원문
  target_message?: string; // 답장 대상 메시지(없으면 message로 폴백)
  intent?: string; // 답장 의도 — 프리셋 키 또는 자유 텍스트. ''는 "의도 미지정 = 공감 기본"
}

/** 답장 의도 프리셋 키. 빈 문자열('')은 프리셋이 아니라 "의도 미지정"을 뜻한다. */
export type ReplyIntentKey =
  | 'comfort' // 위로·공감
  | 'solve' // 함께 해결
  | 'lighten' // 가볍게 전환
  | 'decline' // 정중한 거절
  | 'boundary' // 선 긋기
  | 'persuade'; // 설득·제안

/** 프리셋 목록(키 + i18n 라벨 키). 화면 칩과 프롬프트 디렉티브가 공유하는 단일 출처(TRD §3.1). */
export const REPLY_INTENTS: ReadonlyArray<{ key: ReplyIntentKey; labelKey: string }> = [
  { key: 'comfort', labelKey: 'intent.comfort' },
  { key: 'solve', labelKey: 'intent.solve' },
  { key: 'lighten', labelKey: 'intent.lighten' },
  { key: 'decline', labelKey: 'intent.decline' },
  { key: 'boundary', labelKey: 'intent.boundary' },
  { key: 'persuade', labelKey: 'intent.persuade' },
];

/** 분석(답장 생성) 입력(TRD §3.1). */
export interface AnalyzeReplyInput {
  personaId: string;
  thread: string; // 붙여넣은 최근 대화 원문
  intent: string; // 프리셋 키 · 자유 텍스트 · '' (미지정)
  targetOverride?: string; // 사용자가 직접 고른 답장 대상. 비면 자동 검출을 쓴다
}
