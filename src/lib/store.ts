import { create } from 'zustand';

// P1: 토스트 큐만 둔다. apiKey(P2)·selectedPersonaId(P3)는 해당 단계에서 추가한다.
export interface ToastEntry {
  id: number;
  message: string;
  tone: 'info' | 'error' | 'success';
}

interface AppState {
  toasts: ToastEntry[];
  pushToast: (message: string, tone?: ToastEntry['tone']) => void;
  dismissToast: (id: number) => void;
}

let toastSeq = 1;

export const useApp = create<AppState>((set, get) => ({
  toasts: [],

  pushToast: (message, tone = 'info') => {
    const id = toastSeq++;
    set({ toasts: [...get().toasts, { id, message, tone }] });
    window.setTimeout(() => get().dismissToast(id), 4000);
  },

  dismissToast: (id) => {
    set({ toasts: get().toasts.filter((toast) => toast.id !== id) });
  },
}));
