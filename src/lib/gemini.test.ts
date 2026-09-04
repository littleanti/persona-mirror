// extractJson 단위 테스트(TRD §3.4, §9.2) — 펜스 제거 / 첫 균형 블록 / 전체 파싱 / { raw } 폴백 4경로.

import { describe, expect, it } from 'vitest';
import { extractJson } from '@/lib/gemini';

describe('extractJson', () => {
  it('```json 펜스를 제거하고 파싱한다', () => {
    const text = '```json\n{"analysis": "괜찮아 보여요"}\n```';
    expect(extractJson(text)).toEqual({ analysis: '괜찮아 보여요' });
  });

  it('순수 JSON 문자열을 그대로 파싱한다', () => {
    expect(extractJson('{"a": 1, "b": [1, 2, 3]}')).toEqual({ a: 1, b: [1, 2, 3] });
  });

  it('앞뒤 잡음 속에서 첫 균형 잡힌 {…} 블록을 찾아 파싱한다', () => {
    const text = '여기 결과입니다:\n{"analysis": "값"} 이상입니다.';
    expect(extractJson(text)).toEqual({ analysis: '값' });
  });

  it('비JSON 텍스트는 { raw } 로 원문을 보존한다', () => {
    expect(extractJson('이것은 JSON이 아닙니다.')).toEqual({ raw: '이것은 JSON이 아닙니다.' });
  });
});
