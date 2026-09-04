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
}

/** 목록 화면용 경량 요약 */
export interface PersonaSummary {
  id: string;
  name: string;
  my_name: string;
  created_at: string;
  summary: string; // persona.summary ?? ''
}

/** 페르소나 생성 입력(텍스트). */
export interface CreatePersonaInput {
  name: string;
  my_name: string;
  conversation: string;
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
  message: string; // 분석한 받은 메시지 1건
  analysis: string; // 심리 분석(2~3문장)
  candidates: CandidateReply[]; // 3개 기대
  created_at: string;
}
