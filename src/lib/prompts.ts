
import type { CreatePersonaInput } from '@/lib/types';
import type { Lang } from './i18n';

/**
 * 출력 언어 지시문. 프롬프트 본문은 한국어지만 영어 선택 시 값은 영어로 생성하게 한다.
 * (JSON 키는 그대로 유지 — 파싱 계약 보존)
 */
function outputLangDirective(lang: Lang): string {
  if (lang === 'en') {
    return `\n\n[Output language] Write EVERY value in the JSON in natural English, even though these instructions are written in Korean and the conversation itself may be in Korean. Do NOT translate or change the JSON keys — keep them exactly as specified.`;
  }
  return '';
}

/**
 * LLM에게 요청할 페르소나 JSON 필드 스펙.
 */
export const PERSONA_FIELDS: string =
  `  "summary": "요약 (2-3문장, 핵심 성격과 관계 특성 포함)",
  "communication_style": "소통 방식 (직접적/간접적, 솔직한/우회적, 감정적/이성적 등)",
  "speech_level": "경어 수준 — 반말/해요체/합쇼체/혼합 중 어떤 어미를 주로 쓰는지 구체적으로 (예: ~야, ~어?, ~지, ~해요, ~거든요)",
  "vocabulary_examples": ["대화에서 실제로 자주 등장한 단어나 표현을 5개 이상 직접 인용 (예: ㅋㅋ, 진짜?, 아 그거, 나중에, ㅠㅠ)"],
  "sentence_style": "문장 길이와 구조 특징 — 짧은 단답 위주인지 길고 설명적인지, 완성된 문장인지 단편적인지, 실제 문장 예시 2-3개 포함",
  "emoji_symbol_usage": "이모지/이모티콘/특수문자 사용 패턴 — 어떤 것을 얼마나 자주 쓰는지, 없으면 '사용 안 함'",
  "texting_habits": "메시징 습관(말투 지문) — 메시지당 길이(단답/장문), 띄어쓰기·맞춤법 파괴 여부, 줄임말/초성체, 문장부호 버릇(마침표/물결~/.../!!), 답장의 첫 리액션 패턴 등 실제 관찰된 버릇을 구체적으로",
  "emotional_tendencies": "감정 표현 방식 — 감정을 직접 드러내는지 간접적으로 암시하는지, 강조 표현 패턴",
  "what_they_value": "대화에서 중요하게 여기는 가치와 요소",
  "how_they_seek_response": "어떤 종류의 반응과 답변을 원하는 경향이 있는지 — 표면적 요청 너머의 진짜 정서적 욕구(인정/안심/공감/지지/해결 등)까지",
  "relationship_dynamics": "이 관계에서 보이는 역할과 패턴"`;

/**
 * 페르소나 생성 프롬프트 빌더.
 * my_name 유무에 따라 단일(상대방만) / 이중(other_persona + my_persona) 형식으로 분기.
 */
export function buildPersonaPrompt(input: CreatePersonaInput, lang: Lang = 'ko'): string {
  const { name, conversation } = input;
  const myName = input.my_name.trim();
  const langDirective = outputLangDirective(lang);

  const personaInstruction = `페르소나 분석 시 다음 사항을 반드시 지켜주세요:
- vocabulary_examples: 대화에서 실제로 등장한 단어/표현을 그대로 인용하세요. 추상적 설명 금지.
- sentence_style: 실제 문장 예시를 2-3개 직접 인용하세요. (나중에 이 말투를 그대로 복제할 수 있을 만큼 구체적으로)
- speech_level: 실제 사용된 어미 패턴을 구체적으로 명시하세요 (예: ~야, ~지, ~어?, ~ㄴ데).
- emoji_symbol_usage: 실제 사용된 이모지/이모티콘을 그대로 나열하세요.
- texting_habits: 메시지 길이·띄어쓰기·줄임말·문장부호 버릇을 실제 관찰된 그대로 적으세요.
- emotional_tendencies / how_they_seek_response: 표면적 말 너머의 감정과 진짜 욕구(인정·안심·공감·지지 등)까지 짚으세요.`;

  // 입력 소스 블록: 붙여넣기/첨부 .txt에서 추출한 대화 텍스트를 그대로 제공한다.
  const sourceBlock = `대화 기록:
${conversation}`;

  if (myName) {
    return `다음은 "${myName}"과 "${name}" 사이의 실제 대화 기록입니다.
두 사람 각각의 페르소나와 말투를 분석해주세요.

${personaInstruction}

${sourceBlock}

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트, 설명, 마크다운은 절대 포함하지 마세요:
{
  "other_persona": {
${PERSONA_FIELDS}
  },
  "my_persona": {
${PERSONA_FIELDS}
  }
}

other_persona는 "${name}"의 페르소나이고, my_persona는 "${myName}"의 페르소나입니다.
각 페르소나는 이 두 사람의 관계 맥락에서 분석되어야 합니다.

★ my_persona("${myName}")의 sentence_style·vocabulary_examples·texting_habits에는 "${myName}"이 실제로 보낸 문장과 표현을 그대로 인용하세요. 이 정보는 나중에 "${myName}"의 말투를 똑같이 재현해 답장을 쓰는 데 쓰입니다.${langDirective}`;
  } else {
    return `다음은 "${name}"과의 실제 대화 기록입니다. 이 대화를 깊이 분석하여 ${name}의 페르소나와 말투를 만들어주세요.

${personaInstruction}

${sourceBlock}

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트, 설명, 마크다운은 절대 포함하지 마세요:
{
${PERSONA_FIELDS}
}${langDirective}`;
  }
}
