// parseKakaoChatTail 단위 테스트(TRD §9.2). vitest — Node에서 순수 함수로 검증한다.

import { describe, expect, it } from 'vitest';
import { parseKakaoChatTail } from './chatFile';

describe('parseKakaoChatTail', () => {
  it('카카오톡 내보내기 머리말(대화 제목·저장한 날짜·날짜 구분선)을 제거하고 대화 첫 줄부터 남긴다', () => {
    const raw = [
      '지수님과의 카카오톡 대화',
      '저장한 날짜 : 2026-09-05 21:14:02',
      '',
      '--------------- 2026년 9월 5일 금요일 ---------------',
      '[지수] [오후 9:12] 밥 먹었어?',
      '[나] [오후 9:13] 아직',
    ].join('\n');

    const result = parseKakaoChatTail(raw, 10_000);

    expect(result).toBe('[지수] [오후 9:12] 밥 먹었어?\n[나] [오후 9:13] 아직');
  });

  it('PC 내보내기 표기("OOO 님과 카카오톡 대화", 조사 "의" 없음)도 머리말로 제거한다', () => {
    const raw = [
      '지수 님과 카카오톡 대화',
      '저장한 날짜 : 2026-09-01 22:41:03',
      '',
      '--------------- 2026년 8월 28일 목요일 ---------------',
      '[지수] [오후 7:12] 야 오늘 뭐해? 시간 돼?',
    ].join('\n');

    expect(parseKakaoChatTail(raw, 10_000)).toBe('[지수] [오후 7:12] 야 오늘 뭐해? 시간 돼?');
  });

  it('머리말 패턴이 없는 평문은 한 글자도 잘리지 않고 통과한다', () => {
    const raw = '오늘 점심 뭐 먹지\n그냥 라면 먹을까\n좋아';

    expect(parseKakaoChatTail(raw, 10_000)).toBe(raw);
  });

  it('maxChars를 넘으면 말미만 남고, 잘린 반쪽 줄은 버려 온전한 줄로 시작한다', () => {
    // 각 줄이 같은 길이(7자)라 자연스러운 컷 지점(30자)이 어떤 줄의 한가운데를 가리키게 구성했다.
    const lines = Array.from({ length: 20 }, (_, i) => `줄${String(i).padStart(2, '0')}: 내용`);
    const raw = lines.join('\n');

    const result = parseKakaoChatTail(raw, 30);

    expect(result.length).toBeLessThanOrEqual(30);
    expect(result.length).toBeGreaterThan(0);
    // 결과는 원문 말미의 연속된 부분이어야 하고(줄 중간 절단 없이),
    // 그 시작 지점 바로 앞은 줄바꿈이거나 원문의 맨 앞이어야 한다(온전한 줄 경계).
    const startIndex = raw.length - result.length;
    expect(raw.slice(startIndex)).toBe(result);
    expect(startIndex === 0 || raw[startIndex - 1] === '\n').toBe(true);
  });

  it('maxChars 이하인 짧은 입력은 컷 없이 trim만 적용해 그대로 돌려준다', () => {
    const raw = '  [상대] 안녕\n[나] 안녕  ';

    // 헤더 제거 후 남는 본문(raw 그대로) 길이와 maxChars가 정확히 같은 경계도 함께 확인한다.
    expect(parseKakaoChatTail(raw, raw.length)).toBe(raw.trim());
    expect(parseKakaoChatTail(raw, 1_000)).toBe(raw.trim());
  });

  it('CRLF/CR을 LF로 정규화한 뒤 처리한다', () => {
    const raw = '[상대] 안녕\r\n[나] 안녕\r[상대] 뭐해';

    expect(parseKakaoChatTail(raw, 10_000)).toBe('[상대] 안녕\n[나] 안녕\n[상대] 뭐해');
  });

  it('모든 줄이 머리말처럼 보이면(머리말만 있는 파일) 원문을 그대로 둔다', () => {
    const raw = ['지수님과의 카카오톡 대화', '저장한 날짜 : 2026-09-05 21:14:02', ''].join('\n');

    expect(parseKakaoChatTail(raw, 10_000)).toBe(raw.trim());
  });
});
