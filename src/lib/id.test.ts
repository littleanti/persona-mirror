// uuid() 단위 테스트(TRD §3.9 — randomUUID → getRandomValues → Math.random 폴백 순서).
// 전역 crypto를 vi.stubGlobal로 갈아 끼워 각 폴백 경로가 실제로 타는지 확인한다.

import { afterEach, describe, expect, it, vi } from 'vitest';
import { uuid } from '@/lib/id';

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function fillWithMathRandom(bytes: Uint8Array): Uint8Array {
  for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return bytes;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('uuid', () => {
  it('현재 실행 환경(randomUUID 사용 가능)에서 v4 형식 문자열을 반환한다', () => {
    expect(uuid()).toMatch(UUID_V4_RE);
  });

  it('randomUUID가 없고 getRandomValues만 있으면 그것으로 v4 형식을 만든다', () => {
    vi.stubGlobal('crypto', {
      getRandomValues: (arr: Uint8Array) => fillWithMathRandom(arr),
    });
    expect(uuid()).toMatch(UUID_V4_RE);
  });

  it('randomUUID·getRandomValues 둘 다 없으면 Math.random 폴백도 v4 형식을 만든다', () => {
    vi.stubGlobal('crypto', undefined);
    expect(uuid()).toMatch(UUID_V4_RE);
  });

  it('연속 호출 100회 동안 중복이 없다', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) ids.add(uuid());
    expect(ids.size).toBe(100);
  });
});
