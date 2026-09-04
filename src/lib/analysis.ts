// 메시지 분석 도메인 서비스. TRD §3.8.
// 분석 도메인 서비스 — 페르소나 조회 → 최근 대화 스레드 파싱·타겟 검출 → 프롬프트 → Gemini →
// JSON 추출 → IndexedDB 저장.
// analyzeReply(최근 대화 스레드 + 답장 의도) / analyzeMessage(하위 호환 래퍼) / listAnalyses / removeAnalysis.

import type { AnalysisRecord, CandidateReply } from '@/lib/types';
import { uuid } from '@/lib/id';
import { buildAnalyzePrompt } from '@/lib/prompts';
import { generate, extractJson } from '@/lib/gemini';
import { getLang, t } from '@/lib/i18n';
import { parseThread, detectTarget } from '@/lib/thread';
import { analysisRepo } from '@/lib/repos/analysisRepo';
import { personaRepo } from '@/lib/repos/personaRepo';

/**
 * 최근 대화 스레드와 답장 의도를 분석해 심리 분석 + 답변 후보 3개를 생성하고 기록에 저장한다.
 * - 페르소나가 없으면 throw(화면은 발생하지 않아야 정상 — 칩 선택이 목록에서만 이뤄짐).
 * - 답장 대상(타겟)은 `targetOverride`가 있으면 그것을, 없으면 `thread`를 파싱해 자동 검출한다.
 * - LLM 응답이 JSON으로 파싱되지 않으면(`'raw' in result`) 원문을 보존하는 폴백 레코드를 만든다.
 * - 정상 파싱 시 candidates는 배열이 아니면 빈 배열로, 3개를 넘으면 앞 3개로 정규화한다.
 * - `message`에는 타겟 메시지를 넣어 구 스키마 호환을 유지한다(TRD §3.8).
 */
export async function analyzeReply(
  personaId: string,
  input: { thread: string; intent: string; targetOverride?: string },
): Promise<AnalysisRecord> {
  const persona = await personaRepo.get(personaId);
  if (!persona) {
    throw new Error('페르소나를 찾을 수 없습니다.');
  }

  const targetMessage =
    input.targetOverride?.trim() ||
    detectTarget(parseThread(input.thread, { name: persona.name, myName: persona.my_name }));

  const prompt = buildAnalyzePrompt(
    { persona, thread: input.thread, targetMessage, intent: input.intent },
    getLang(),
  );
  const text = await generate(prompt);
  const result = extractJson(text);

  let analysis: string;
  let candidates: CandidateReply[];

  if ('raw' in result) {
    // JSON 파싱 실패 폴백 — 원문을 후보 1개로 보존해 사용자가 볼 수 있게 한다.
    analysis = t('parse.failAnalysis');
    candidates = [
      {
        label: t('parse.failLabel'),
        reason: t('parse.failReason'),
        response: String(result['raw'] ?? ''),
      },
    ];
  } else {
    analysis = typeof result['analysis'] === 'string' ? (result['analysis'] as string) : '';
    candidates = Array.isArray(result['candidates'])
      ? (result['candidates'] as CandidateReply[]).slice(0, 3)
      : [];
  }

  const record: AnalysisRecord = {
    id: uuid(),
    persona_id: personaId,
    persona_name: persona.name,
    message: targetMessage,
    analysis,
    candidates,
    created_at: new Date().toISOString(),
    thread: input.thread,
    target_message: targetMessage,
    intent: input.intent,
  };

  await analysisRepo.put(record);
  return record;
}

/** 하위 호환 래퍼 — 메시지 1건을 thread이자 targetMessage로 넘긴다(의도 미지정). */
export function analyzeMessage(personaId: string, message: string): Promise<AnalysisRecord> {
  return analyzeReply(personaId, { thread: message, intent: '' });
}

/** 기록 탭용 전체 목록(created_at 내림차순). */
export function listAnalyses(): Promise<AnalysisRecord[]> {
  return analysisRepo.list();
}

export function removeAnalysis(id: string): Promise<void> {
  return analysisRepo.remove(id);
}
