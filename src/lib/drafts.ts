// 페르소나별 최근 대화 스레드 드래프트(localStorage). TRD §3.12.
// AnalyzePage가 페르소나 전환 시 복원하고 입력마다 저장하는 임시 입력값이며, 도메인 계층은
// 이 드래프트의 존재를 알지 못한다. 아직 레코드가 아닌 값이라 IndexedDB가 아니라 localStorage를 쓴다.

const PREFIX = 'pm_thread_draft:';

/** 저장된 드래프트를 읽는다. 없거나 저장소 접근이 실패하면 빈 문자열을 반환한다(throw 없음). */
export function getThreadDraft(personaId: string): string {
  if (!personaId) return '';
  try {
    return localStorage.getItem(PREFIX + personaId) ?? '';
  } catch {
    return '';
  }
}

/**
 * 드래프트를 저장한다. 공백만 남으면 빈 문자열을 저장하는 대신 키 자체를 지운다 —
 * 그래야 "드래프트가 있다"와 "비어 있다"를 구분할 수 있다. 접근 실패는 조용히 무시한다.
 */
export function setThreadDraft(personaId: string, text: string): void {
  if (!personaId) return;
  try {
    if (text.trim()) {
      localStorage.setItem(PREFIX + personaId, text);
    } else {
      localStorage.removeItem(PREFIX + personaId);
    }
  } catch {
    // 저장 실패는 무시 — 드래프트는 편의 기능이라 분석 자체는 그대로 동작해야 한다.
  }
}

/** 드래프트를 명시적으로 지운다. 접근 실패는 조용히 무시한다. */
export function clearThreadDraft(personaId: string): void {
  if (!personaId) return;
  try {
    localStorage.removeItem(PREFIX + personaId);
  } catch {
    // 무시
  }
}
