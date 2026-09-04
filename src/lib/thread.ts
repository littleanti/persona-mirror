// 붙여넣은 최근 대화 스레드 파서(순수 함수, DOM·네트워크·LLM 미사용). TRD §3.11.
// parseThread: 카카오톡 내보내기식 "[이름] [시간] 내용"을 1차로, "이름: 내용"을 2차 폴백으로 파싱하고,
// 화자를 페르소나의 name(상대)/my_name(나)에 매칭해 me/other/unknown으로 분류한다.
// detectTarget: 답장할 대상 = 상대(other)의 마지막 발화, 없으면 마지막 비어 있지 않은 줄로 폴백.

export type Speaker = 'me' | 'other' | 'unknown';

export interface ThreadLine {
  speaker: Speaker;
  label: string; // 원본 화자 라벨(없으면 '')
  text: string;
}

export interface ParsedThread {
  lines: ThreadLine[];
}

// "[이름] [시간] 내용" — 시간 토큰은 선택. 이름 안에 ']'가 없다고 가정한다.
const KAKAO_RE = /^\s*\[([^\]]+)\]\s*(?:\[[^\]]*\]\s*)?(.*)$/;
// "이름: 내용" — 콜론 앞이 너무 길면(문장일 가능성) 화자로 보지 않는다.
const COLON_RE = /^\s*([^:：]{1,20})\s*[:：]\s*(.+)$/;
// 날짜 구분선 등 노이즈 라인.
const SEPARATOR_RE = /^\s*-{3,}.*-{3,}\s*$/;

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, '');
}

/** 라벨을 name/my_name과 비교해 화자를 분류한다. 양방향 부분 일치로 약간의 표기 차이를 흡수한다. */
function classify(label: string, name: string, myName: string): Speaker {
  const l = norm(label);
  if (!l) return 'unknown';
  const n = norm(name);
  const m = norm(myName);
  // 나를 먼저 판정한다(my_name이 비어 있으면 me 판정 자체가 불가능하다).
  if (m && (l === m || l.includes(m) || m.includes(l))) return 'me';
  if (n && (l === n || l.includes(n) || n.includes(l))) return 'other';
  return 'unknown';
}

/**
 * 붙여넣은 스레드를 화자별 라인으로 파싱한다.
 * - 접두 라벨이 없는 줄은 직전 발화의 연속(멀티라인)으로 이어 붙인다.
 * - 직전이 없거나 직전도 unknown이면 별개의 unknown 라인으로 둔다.
 */
export function parseThread(thread: string, persona: { name: string; myName: string }): ParsedThread {
  const rawLines = thread.replace(/\r\n/g, '\n').split('\n');
  const lines: ThreadLine[] = [];

  for (const raw of rawLines) {
    const line = raw.trimEnd();
    if (!line.trim()) continue;
    if (SEPARATOR_RE.test(line)) continue;

    const kakao = line.match(KAKAO_RE);
    if (kakao) {
      const label = kakao[1]!.trim();
      const text = (kakao[2] ?? '').trim();
      lines.push({ speaker: classify(label, persona.name, persona.myName), label, text });
      continue;
    }

    const colon = line.match(COLON_RE);
    if (colon) {
      const label = colon[1]!.trim();
      const text = (colon[2] ?? '').trim();
      const speaker = classify(label, persona.name, persona.myName);
      // 라벨이 화자로 인식될 때만 화자 라인으로 채택한다. 아니면 연속 텍스트로 본다.
      if (speaker !== 'unknown') {
        lines.push({ speaker, label, text });
        continue;
      }
    }

    // 라벨 없는 줄: 직전이 화자 있는 줄이면 그 발화의 연속(멀티라인)으로 합친다.
    // 직전이 없거나 직전도 unknown이면 별개의 unknown 라인으로 둔다 — 라벨이 전혀 없는
    // 스레드에서도 줄마다 보존돼야 마지막 줄 폴백(detectTarget)이 동작한다.
    const prev = lines[lines.length - 1];
    if (prev && prev.speaker !== 'unknown') {
      prev.text = prev.text ? `${prev.text}\n${line.trim()}` : line.trim();
    } else {
      lines.push({ speaker: 'unknown', label: '', text: line.trim() });
    }
  }

  return { lines };
}

/**
 * 답장할 대상 메시지를 고른다.
 * 1순위: 마지막 'other'(상대) 발화. 폴백: 마지막 비어 있지 않은 라인(라벨 없는 스레드 대응).
 */
export function detectTarget(parsed: ParsedThread): string {
  for (let i = parsed.lines.length - 1; i >= 0; i--) {
    const ln = parsed.lines[i]!;
    if (ln.speaker === 'other' && ln.text.trim()) return ln.text.trim();
  }
  for (let i = parsed.lines.length - 1; i >= 0; i--) {
    const ln = parsed.lines[i]!;
    if (ln.text.trim()) return ln.text.trim();
  }
  return '';
}
