// getThreadDraft/setThreadDraft/clearThreadDraft 단위 테스트(TRD §3.12, §9.2).
// 전역 localStorage를 인메모리 스텁으로 교체해 jsdom 없이 저장/복원/폴백을 검증한다.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearThreadDraft, getThreadDraft, setThreadDraft } from '@/lib/drafts';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

/** 모든 메서드가 예외를 던지는 스텁 — 프라이빗 모드/저장소 비활성 상황을 흉내낸다. */
class ThrowingStorage implements Storage {
  get length(): number {
    throw new Error('access denied');
  }
  clear(): void {
    throw new Error('access denied');
  }
  getItem(): string | null {
    throw new Error('access denied');
  }
  key(): string | null {
    throw new Error('access denied');
  }
  removeItem(): void {
    throw new Error('access denied');
  }
  setItem(): void {
    throw new Error('access denied');
  }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', new MemoryStorage());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getThreadDraft/setThreadDraft', () => {
  it('저장한 드래프트를 같은 personaId로 복원한다', () => {
    setThreadDraft('persona-1', '김민준: 오늘 뭐해?');
    expect(getThreadDraft('persona-1')).toBe('김민준: 오늘 뭐해?');
  });

  it('드래프트가 없으면 빈 문자열을 반환한다', () => {
    expect(getThreadDraft('persona-none')).toBe('');
  });

  it('페르소나별로 드래프트가 분리된다', () => {
    setThreadDraft('persona-1', '첫 번째 대화');
    setThreadDraft('persona-2', '두 번째 대화');
    expect(getThreadDraft('persona-1')).toBe('첫 번째 대화');
    expect(getThreadDraft('persona-2')).toBe('두 번째 대화');
  });

  it('공백만 남은 텍스트를 저장하면 키 자체가 삭제된다', () => {
    setThreadDraft('persona-1', '남길 대화');
    setThreadDraft('persona-1', '   \n  ');
    expect(getThreadDraft('persona-1')).toBe('');
    expect(localStorage.getItem('pm_thread_draft:persona-1')).toBeNull();
  });

  it('personaId가 빈 문자열이면 아무 것도 하지 않는다', () => {
    setThreadDraft('', '저장되면 안 됨');
    expect(getThreadDraft('')).toBe('');
    expect(localStorage.length).toBe(0);
  });
});

describe('clearThreadDraft', () => {
  it('저장된 드래프트를 지운다', () => {
    setThreadDraft('persona-1', '지워질 대화');
    clearThreadDraft('persona-1');
    expect(getThreadDraft('persona-1')).toBe('');
  });

  it('드래프트가 없어도 예외 없이 동작한다', () => {
    expect(() => clearThreadDraft('persona-none')).not.toThrow();
  });
});

describe('localStorage 접근 실패 시 폴백', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new ThrowingStorage());
  });

  it('getThreadDraft는 throw하지 않고 빈 문자열을 반환한다', () => {
    expect(() => getThreadDraft('persona-1')).not.toThrow();
    expect(getThreadDraft('persona-1')).toBe('');
  });

  it('setThreadDraft는 throw하지 않는다(값이 있어도, 공백이어도)', () => {
    expect(() => setThreadDraft('persona-1', '저장 시도')).not.toThrow();
    expect(() => setThreadDraft('persona-1', '   ')).not.toThrow();
  });

  it('clearThreadDraft는 throw하지 않는다', () => {
    expect(() => clearThreadDraft('persona-1')).not.toThrow();
  });
});
