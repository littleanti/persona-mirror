// API 키를 localStorage에 저장/읽기/삭제하는 유틸리티(TRD §3.3).
// 브라우저가 Gemini를 직접 호출하므로 JS에서 읽을 수 있는 저장소가 필요하다 —
// HttpOnly 쿠키는 애초에 쓸 수 없다.

import { API_KEY_STORAGE_KEY, LEGACY_COOKIE_KEY_NAME } from '@/lib/config';

// localStorage 접근이 실패하는 환경(프라이빗 모드·저장소 비활성)에서의 세션 한정 폴백.
let memoryApiKey = '';

function readLegacyCookie(): string | null {
  const prefix = `${LEGACY_COOKIE_KEY_NAME}=`;
  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      const value = trimmed.slice(prefix.length);
      try {
        return decodeURIComponent(value) || null;
      } catch {
        return value || null;
      }
    }
  }
  return null;
}

function clearLegacyCookie(): void {
  document.cookie = `${LEGACY_COOKIE_KEY_NAME}=; max-age=0; path=/; SameSite=Lax`;
}

/**
 * API 키를 읽는다. 순서: localStorage → (없으면) 레거시 쿠키 1회 이전 → 메모리 폴백.
 * 레거시 쿠키가 있으면 localStorage로 옮기고 쿠키를 만료시킨 뒤 그 값을 반환한다 —
 * 이 이전은 브라우저당 한 번만 일어난다(다음 호출부터는 1단계에서 끝난다).
 */
export function getApiKey(): string | null {
  try {
    const stored = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (stored) return stored;
  } catch {
    if (memoryApiKey) return memoryApiKey;
  }

  const legacy = readLegacyCookie();
  if (legacy) {
    setApiKey(legacy);
    clearLegacyCookie();
    return legacy;
  }

  return memoryApiKey || null;
}

/** API 키를 localStorage에 저장하고 레거시 쿠키를 만료시킨다. */
export function setApiKey(key: string): void {
  memoryApiKey = key;
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
  } catch {
    // localStorage 비활성 환경에서는 현재 세션 메모리로만 유지한다.
  }
  clearLegacyCookie();
}

/** 저장된 API 키를 제거하고 레거시 쿠키도 함께 만료시킨다. */
export function clearApiKey(): void {
  memoryApiKey = '';
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch {
    // 무시
  }
  clearLegacyCookie();
}

/** API 키가 저장되어 있으면 true. */
export function hasApiKey(): boolean {
  return getApiKey() !== null;
}
