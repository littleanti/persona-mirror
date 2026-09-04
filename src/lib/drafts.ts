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

// ── 설정 탭의 백업·전체 삭제가 쓰는 일괄 조회/복원/삭제(TRD §3.12) ──
// 접두 상수(PREFIX)는 이 모듈 안에만 있고, dataManagement.ts는 키 형식을 알지 못한 채
// 이 세 함수만 호출한다.

/** 저장된 모든 드래프트를 personaId → 본문 맵으로 반환한다. 접근 실패는 빈 객체로 폴백한다. */
export function listThreadDrafts(): Record<string, string> {
  const drafts: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(PREFIX)) continue;
      const personaId = key.slice(PREFIX.length);
      const value = localStorage.getItem(key);
      if (personaId && value) drafts[personaId] = value;
    }
  } catch {
    // 무시
  }
  return drafts;
}

/** 백업에서 드래프트를 복원한다. 문자열 값만 setThreadDraft로 반영하고 나머지는 건너뛴다. */
export function importThreadDrafts(drafts: Record<string, unknown>): void {
  Object.entries(drafts).forEach(([personaId, value]) => {
    if (typeof value === 'string') setThreadDraft(personaId, value);
  });
}

/** 접두가 붙은 드래프트 키를 전부 삭제한다. 접근 실패는 조용히 무시한다. */
export function clearAllThreadDrafts(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(PREFIX)) keys.push(key);
    }
    keys.forEach((key) => localStorage.removeItem(key));
  } catch {
    // 무시
  }
}
