// parseThread/detectTarget 단위 테스트(TRD §3.11, §9.2). 순수 함수라 DOM·네트워크 없이 검증한다.

import { describe, expect, it } from 'vitest';
import { parseThread, detectTarget } from '@/lib/thread';

const persona = { name: '김민준', myName: '지수' };

describe('parseThread', () => {
  it('카카오톡 내보내기 형식 "[이름] [시간] 내용"을 파싱한다', () => {
    const thread = '[김민준] [오후 3:12] 오늘 뭐해?\n[지수] [오후 3:13] 집에 있어';
    const { lines } = parseThread(thread, persona);
    expect(lines).toEqual([
      { speaker: 'other', label: '김민준', text: '오늘 뭐해?' },
      { speaker: 'me', label: '지수', text: '집에 있어' },
    ]);
  });

  it('시간 토큰이 없는 "[이름] 내용"도 파싱한다', () => {
    const { lines } = parseThread('[김민준] 오늘 뭐해?', persona);
    expect(lines).toEqual([{ speaker: 'other', label: '김민준', text: '오늘 뭐해?' }]);
  });

  it('"이름: 내용" 형식을 폴백으로 파싱한다', () => {
    const thread = '김민준: 오늘 뭐해?\n지수: 집에 있어';
    const { lines } = parseThread(thread, persona);
    expect(lines).toEqual([
      { speaker: 'other', label: '김민준', text: '오늘 뭐해?' },
      { speaker: 'me', label: '지수', text: '집에 있어' },
    ]);
  });

  it('콜론 앞이 20자를 넘는 문장은 화자 라벨로 보지 않고 이어 붙인다', () => {
    const thread = '김민준: 오늘 뭐해?\n그래서 나는 이렇게 하기로 했다는 거지: 진짜 그렇게 됐어';
    const { lines } = parseThread(thread, persona);
    expect(lines).toHaveLength(1);
    expect(lines[0]!.speaker).toBe('other');
    expect(lines[0]!.text).toBe('오늘 뭐해?\n그래서 나는 이렇게 하기로 했다는 거지: 진짜 그렇게 됐어');
  });

  it('라벨 없는 줄은 직전 화자 발화의 연속(멀티라인)으로 이어 붙인다', () => {
    const thread = '김민준: 아 그냥\n오늘 약속 있나 해서';
    const { lines } = parseThread(thread, persona);
    expect(lines).toEqual([{ speaker: 'other', label: '김민준', text: '아 그냥\n오늘 약속 있나 해서' }]);
  });

  it('라벨이 전혀 없으면 줄마다 별개의 unknown 라인으로 보존한다', () => {
    const thread = '오늘 뭐해?\n집에 있어';
    const { lines } = parseThread(thread, persona);
    expect(lines).toEqual([
      { speaker: 'unknown', label: '', text: '오늘 뭐해?' },
      { speaker: 'unknown', label: '', text: '집에 있어' },
    ]);
  });

  it('my_name이 비어 있으면 상대/미상만 나오고 me는 판정되지 않는다', () => {
    const { lines } = parseThread('[김민준] 오늘 뭐해?\n[지수] 집에 있어', { name: '김민준', myName: '' });
    expect(lines[0]!.speaker).toBe('other');
    expect(lines[1]!.speaker).toBe('unknown');
  });

  it('빈 줄과 날짜 구분선은 건너뛴다', () => {
    const thread = '--------- 2026년 9월 5일 ---------\n\n김민준: 오늘 뭐해?';
    const { lines } = parseThread(thread, persona);
    expect(lines).toEqual([{ speaker: 'other', label: '김민준', text: '오늘 뭐해?' }]);
  });

  it('빈 입력은 빈 라인 목록을 반환한다', () => {
    expect(parseThread('', persona)).toEqual({ lines: [] });
  });
});

describe('detectTarget', () => {
  it('마지막 상대(other) 발화를 답장 대상으로 고른다', () => {
    const parsed = parseThread('김민준: 오늘 뭐해?\n지수: 집에 있어\n김민준: 그럼 이따 볼래?', persona);
    expect(detectTarget(parsed)).toBe('그럼 이따 볼래?');
  });

  it('상대 발화가 없으면 마지막 비어 있지 않은 줄로 폴백한다', () => {
    const parsed = parseThread('오늘 뭐해?\n집에 있어', persona);
    expect(detectTarget(parsed)).toBe('집에 있어');
  });

  it('빈 스레드는 빈 문자열을 반환한다', () => {
    expect(detectTarget({ lines: [] })).toBe('');
  });
});
