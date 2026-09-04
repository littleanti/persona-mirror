// 카카오톡 대화 파일(.txt) 말미 파서(TRD §3.15). 순수 함수 — DOM·네트워크·LLM을 쓰지 않는다.
// 페르소나 생성 시트의 첨부 버튼이 읽은 원문을 이 모듈로 잘라 textarea에 채운다.

/**
 * 카카오톡 내보내기 머리말로 보이는 선두 줄 패턴(TRD §3.15 표).
 * - "…님과의 (카카오톡 )대화"
 * - "저장한 날짜 : …" / "Date Saved : …"
 * - 양끝을 하이픈 3개 이상으로 감싼 "YYYY년 … " 날짜 구분선
 * - 머리말 사이의 빈 줄
 * 매칭되는 동안 선두 줄을 한 줄씩 떼어내고, 매칭되지 않는 첫 줄에서 멈춘다(원문 보존).
 */
function isHeaderLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true;
  // "OOO 님과 카카오톡 대화"(PC 내보내기)와 "OOO 님과의 카카오톡 대화"(모바일) 두 표기를 모두 머리말로 본다.
  if (/님과(의)? (카카오톡 )?대화$/.test(trimmed)) return true;
  if (/^저장한 날짜\s*:/.test(trimmed)) return true;
  if (/^Date Saved\s*:/i.test(trimmed)) return true;
  if (/^-{3,}.*\d{4}년.*-{3,}$/.test(trimmed)) return true;
  return false;
}

/**
 * 카카오톡 내보내기(.txt) 또는 평문 대화 텍스트를 받아, 선두 머리말을 떼고
 * 말미 maxChars 자만 잘라 돌려준다. 화자 라벨·타임스탬프는 지우지 않고 자르기만 한다.
 */
export function parseKakaoChatTail(rawText: string, maxChars: number): string {
  // 1) 줄바꿈 정규화 — CRLF/CR을 모두 LF로.
  const normalized = rawText.replace(/\r\n?/g, '\n');

  // 2) 선두 머리말 제거. 모든 줄이 머리말처럼 보이면 원문을 그대로 둔다.
  const lines = normalized.split('\n');
  let start = 0;
  while (start < lines.length && isHeaderLine(lines[start])) {
    start += 1;
  }
  const body = start >= lines.length ? normalized : lines.slice(start).join('\n');

  // 3) 말미 maxChars 컷 — 잘린 반쪽 줄은 첫 줄바꿈 이후부터 시작해 버린다.
  if (body.length <= maxChars) {
    return body.trim();
  }
  let tail = body.slice(body.length - maxChars);
  const firstBreak = tail.indexOf('\n');
  if (firstBreak >= 0) {
    tail = tail.slice(firstBreak + 1);
  }

  // 4) 앞뒤 공백 정리.
  return tail.trim();
}
