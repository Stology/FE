import type { ReactNode } from 'react';
import { create } from 'zustand';

import type { ToastType } from '@/shared/ui/Toast';

export const DEFAULT_TOAST_DURATION = 3000;

export interface ToastInput {
  action?: ReactNode;
  duration?: number;
  message: ReactNode;
  title?: ReactNode;
  type?: ToastType;
}

export interface ToastItem extends ToastInput {
  duration: number;
  id: string;
  type: ToastType;
}

interface ToastState {
  addToast: (input: ToastInput) => string;
  clearToasts: () => void;
  dismissToast: (id: string) => void;
  toasts: ToastItem[];
}

let toastSequence = 0;

function createToastId() {
  toastSequence += 1;
  return `toast-${Date.now()}-${toastSequence}`;
}

export const useToastStore = create<ToastState>((set) => ({
  addToast: (input) => {
    const id = createToastId();
    const toast: ToastItem = {
      ...input,
      duration: input.duration ?? DEFAULT_TOAST_DURATION,
      id,
      type: input.type ?? 'info',
    };

    set((state) => ({ toasts: [...state.toasts, toast] }));
    return id;
  },
  clearToasts: () => set({ toasts: [] }),
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
  toasts: [],
}));
