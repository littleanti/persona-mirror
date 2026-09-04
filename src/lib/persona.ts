// 페르소나 도메인 서비스. TRD §3.7.
// 페르소나 도메인 서비스 — 생성/목록/조회/삭제(TRD §3.7).
// createPersona / listPersonaSummaries / getPersona / removePersona + splitPersonaRaw.

import type { PersonaRecord, PersonaSummary, CreatePersonaInput, PersonaFields } from '@/lib/types';
import { uuid } from '@/lib/id';
import { buildPersonaPrompt } from '@/lib/prompts';
import { generate, extractJson } from '@/lib/gemini';
import { getLang } from '@/lib/i18n';
import { personaRepo } from '@/lib/repos/personaRepo';

/**
 * LLM raw 응답을 상대/나 페르소나로 분리한다.
 * - my_name 이 있으면 raw.other_persona / raw.my_persona 로 분리
 * - 없으면 persona=raw, my_persona={}
 * JSON 파싱이 실패해 raw가 `{ raw: text }` 형태여도 그대로 personaData가 되어
 * 원문이 보존된 채 저장된다(TRD §3.7) — PersonaFields의 인덱스 시그니처 덕에
 * 상세 화면이 이 `raw` 키를 관대하게 표시한다.
 */
function splitPersonaRaw(
  raw: Record<string, unknown>,
  myName: string,
): { personaData: PersonaFields; myPersonaData: PersonaFields } {
  if (myName) {
    return {
      personaData: (raw['other_persona'] as PersonaFields | undefined) ?? (raw as PersonaFields),
      myPersonaData: (raw['my_persona'] as PersonaFields | undefined) ?? {},
    };
  }
  return { personaData: raw as PersonaFields, myPersonaData: {} };
}

/**
 * 페르소나를 생성한다.
 * 입력 검증(이름 필수, 텍스트 모드는 대화가 너무 짧으면 거부, 이미지 모드는 0장이면 거부)은
 * 화면(PersonaPage)이 호출 전에 수행한다. 이미지 모드의 conversation은 화면이 미리 채운
 * 표시용 플레이스홀더 문자열이며, 이 함수는 받은 문자열을 그대로 저장할 뿐이다.
 */
export async function createPersona(input: CreatePersonaInput): Promise<PersonaRecord> {
  const myName = input.my_name.trim();

  const prompt = buildPersonaPrompt(input, getLang());
  const text = await generate(prompt, input.images);
  const { personaData, myPersonaData } = splitPersonaRaw(extractJson(text), myName);

  const record: PersonaRecord = {
    id: uuid(),
    name: input.name,
    my_name: myName,
    created_at: new Date().toISOString(),
    conversation: input.conversation,
    persona: personaData,
    my_persona: myPersonaData,
  };

  await personaRepo.put(record);
  return record;
}

/**
 * 기존 페르소나에 새 대화를 추가해 다시 분석한다(TRD §3.7).
 * 기존 conversation + 신규 대화(trim)를 이어 붙여 전체를 다시 분석한다 — 말투 지문은 표본
 * 전체에서 나오므로 새 대화만 분석해 필드를 병합하는 부분 갱신은 두지 않는다.
 * id·created_at·name·my_name은 그대로 둔다 — 목록·분석 기록이 id로 이 레코드를 가리키므로
 * 새로 만들면 참조가 끊긴다. 이미지 인자는 없다(텍스트 붙여넣기 전용).
 */
export async function updatePersona(
  id: string,
  input: { conversation: string },
): Promise<PersonaRecord> {
  const existing = await personaRepo.get(id);
  if (!existing) {
    throw new Error('페르소나를 찾을 수 없습니다.');
  }

  const addition = input.conversation.trim();
  const combined = existing.conversation ? `${existing.conversation}\n${addition}`.trim() : addition;

  const prompt = buildPersonaPrompt(
    { name: existing.name, my_name: existing.my_name, conversation: combined },
    getLang(),
  );
  const text = await generate(prompt);
  const { personaData, myPersonaData } = splitPersonaRaw(extractJson(text), existing.my_name.trim());

  const updated: PersonaRecord = {
    ...existing,
    conversation: combined,
    persona: personaData,
    my_persona: myPersonaData,
    updated_at: new Date().toISOString(),
  };

  await personaRepo.put(updated);
  return updated;
}

/** 목록 화면용 경량 요약 리스트. */
export async function listPersonaSummaries(): Promise<PersonaSummary[]> {
  const records = await personaRepo.list();
  return records.map((p) => ({
    id: p.id,
    name: p.name,
    my_name: p.my_name,
    created_at: p.created_at,
    summary: p.persona?.summary ?? '',
  }));
}

export function getPersona(id: string): Promise<PersonaRecord | null> {
  return personaRepo.get(id);
}

export function removePersona(id: string): Promise<void> {
  return personaRepo.remove(id);
}
