// File → InlineImage 변환 헬퍼(TRD §3.4.1).
// 메시지 분석의 캡처 이미지 입력에서 쓴다.
// data URL 접두어(`data:image/...;base64,`)를 떼고 순수 base64만 보관한다(Gemini inlineData 계약).

import type { InlineImage } from '@/lib/types';

/** 선택한 이미지 파일을 Gemini inlineData 파트에 실을 수 있는 형태로 바꾼다. */
export function fileToInlineImage(file: File): Promise<InlineImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      const comma = result.indexOf(',');
      resolve({
        mimeType: file.type || 'image/png',
        data: comma >= 0 ? result.slice(comma + 1) : result,
      });
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
