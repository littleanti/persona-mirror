// 메시지 분석 도메인 서비스. TRD §3.8.
// 분석 도메인 서비스 — 페르소나 조회 → 최근 대화 스레드 파싱·타겟 검출 → 프롬프트 → Gemini →
// JSON 추출 → IndexedDB 저장.
// analyzeReply(최근 대화 스레드 + 답장 의도) / listAnalyses / removeAnalysis.

import type { AnalysisRecord, CandidateReply, InlineImage } from '@/lib/types';
import { uuid } from '@/lib/id';
import { buildAnalyzePrompt } from '@/lib/prompts';
import { generate, extractJson } from '@/lib/gemini';
import { getLang, t } from '@/lib/i18n';
import { parseThread, detectTarget } from '@/lib/thread';
import { analysisRepo } from '@/lib/repos/analysisRepo';
import { personaRepo } from '@/lib/repos/personaRepo';

/**
 * 최근 대화 스레드(또는 캡처 이미지)와 답장 의도를 분석해 심리 분석 + 답변 후보 3개를 생성하고
 * 기록에 저장한다.
 * - 페르소나가 없으면 throw(화면은 발생하지 않아야 정상 — 칩 선택이 목록에서만 이뤄짐).
 * - `images`가 있으면 이미지 모드: `thread` 파싱·타겟 검출을 건너뛰고 모델이 캡처에서 답장 대상을
 *   직접 판별한다(TRD §3.8). 없으면 텍스트 모드 — 답장 대상(타겟)은 `targetOverride`가 있으면
 *   그것을, 없으면 `thread`를 파싱해 자동 검출한다.
 * - LLM 응답이 JSON으로 파싱되지 않으면(`'raw' in result`) 원문을 보존하는 폴백 레코드를 만든다.
 * - 정상 파싱 시 candidates는 배열이 아니면 빈 배열로, 3개를 넘으면 앞 3개로 정규화한다.
 * - `message`에는 타겟 메시지(이미지 모드는 캡처 장수 플레이스홀더)를 넣어 구 스키마 호환을 유지한다.
 */
export async function analyzeReply(
  personaId: string,
  input: { thread: string; intent: string; targetOverride?: string; images?: InlineImage[] },
): Promise<AnalysisRecord> {
  const persona = await personaRepo.get(personaId);
  if (!persona) {
    throw new Error('페르소나를 찾을 수 없습니다.');
  }

  const images = input.images;
  const useImages = !!images && images.length > 0;

  // 이미지 모드는 텍스트 thread가 없으므로 파싱·타겟 검출을 아예 호출하지 않는다.
  const targetMessage = useImages
    ? ''
    : input.targetOverride?.trim() ||
      detectTarget(parseThread(input.thread, { name: persona.name, myName: persona.my_name }));

  const prompt = buildAnalyzePrompt(
    { persona, thread: input.thread, targetMessage, intent: input.intent, useImages },
    getLang(),
  );
  const text = await generate(prompt, images);
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

  // 이미지 모드는 앱이 아는 타겟 문장이 없어 message/target_message가 비면 기록 미리보기가
  // 통째로 빈다. 캡처 장수 플레이스홀더를 저장 시점 언어로 고정해 넣는다(TRD §3.8).
  const storedTarget = useImages ? t('analyze.imagePlaceholder', { n: images!.length }) : targetMessage;

  const record: AnalysisRecord = {
    id: uuid(),
    persona_id: personaId,
    persona_name: persona.name,
    message: storedTarget,
    analysis,
    candidates,
    created_at: new Date().toISOString(),
    thread: useImages ? '' : input.thread,
    target_message: storedTarget,
    intent: input.intent,
  };

  await analysisRepo.put(record);
  return record;
}


/** 기록 탭용 전체 목록(created_at 내림차순). */
export function listAnalyses(): Promise<AnalysisRecord[]> {
  return analysisRepo.list();
}

export function removeAnalysis(id: string): Promise<void> {
  return analysisRepo.remove(id);
}
