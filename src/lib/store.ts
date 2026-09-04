import { create } from 'zustand';
import { getApiKey, setApiKey as persistApiKey, clearApiKey as clearPersistedApiKey } from '@/lib/repos/settingsRepo';

// apiKey 미러(쿠키 settingsRepo와 동기화) · selectedPersonaId(페르소나 탭 → 분석 탭 전달값) · toasts (TRD §3.9).
export interface ToastEntry {
  id: number;
  message: string;
  tone: 'info' | 'error' | 'success';
}

interface AppState {
  apiKey: string;
  selectedPersonaId: string | null;
  toasts: ToastEntry[];
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  refreshApiKey: () => void;
  setSelectedPersonaId: (id: string | null) => void;
  pushToast: (message: string, tone?: ToastEntry['tone']) => void;
  dismissToast: (id: number) => void;
}

let toastSeq = 1;

export const useApp = create<AppState>((set, get) => ({
  apiKey: getApiKey() ?? '',
  selectedPersonaId: null,
  toasts: [],

  setApiKey: (key) => {
    persistApiKey(key);
    set({ apiKey: key });
  },

  clearApiKey: () => {
    clearPersistedApiKey();
    set({ apiKey: '' });
  },

  refreshApiKey: () => {
    set({ apiKey: getApiKey() ?? '' });
  },

  setSelectedPersonaId: (id) => set({ selectedPersonaId: id }),

  pushToast: (message, tone = 'info') => {
    const id = toastSeq++;
    set({ toasts: [...get().toasts, { id, message, tone }] });
    window.setTimeout(() => get().dismissToast(id), 4000);
  },

  dismissToast: (id) => {
    set({ toasts: get().toasts.filter((toast) => toast.id !== id) });
  },
}));

/** React 트리 밖(prompts.ts/analysis.ts 등)에서 키 존재 여부를 확인할 때 사용 (TRD §3.9). */
export function hasApiKey(): boolean {
  return useApp.getState().apiKey.trim().length > 0;
}
