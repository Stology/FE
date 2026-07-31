import { useCallback } from 'react';

import { type ToastInput, useToastStore } from '@/shared/stores/useToastStore';
import type { ToastType } from '@/shared/ui/Toast';

export type ToastOptions = Omit<ToastInput, 'message' | 'type'>;

function addTypedToast(type: ToastType, message: ToastInput['message'], options?: ToastOptions) {
  return useToastStore.getState().addToast({ ...options, message, type });
}

export const toast = {
  clear: () => useToastStore.getState().clearToasts(),
  dismiss: (id: string) => useToastStore.getState().dismissToast(id),
  error: (message: ToastInput['message'], options?: ToastOptions) =>
    addTypedToast('error', message, options),
  info: (message: ToastInput['message'], options?: ToastOptions) =>
    addTypedToast('info', message, options),
  show: (input: ToastInput) => useToastStore.getState().addToast(input),
  success: (message: ToastInput['message'], options?: ToastOptions) =>
    addTypedToast('success', message, options),
  warning: (message: ToastInput['message'], options?: ToastOptions) =>
    addTypedToast('warning', message, options),
};

export function useToast() {
  const addToast = useToastStore((state) => state.addToast);
  const clearToasts = useToastStore((state) => state.clearToasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  const showToast = useCallback((input: ToastInput) => addToast(input), [addToast]);

  return {
    clearToasts,
    dismissToast,
    error: useCallback(
      (message: ToastInput['message'], options?: ToastOptions) =>
        addToast({ ...options, message, type: 'error' }),
      [addToast],
    ),
    info: useCallback(
      (message: ToastInput['message'], options?: ToastOptions) =>
        addToast({ ...options, message, type: 'info' }),
      [addToast],
    ),
    showToast,
    success: useCallback(
      (message: ToastInput['message'], options?: ToastOptions) =>
        addToast({ ...options, message, type: 'success' }),
      [addToast],
    ),
    warning: useCallback(
      (message: ToastInput['message'], options?: ToastOptions) =>
        addToast({ ...options, message, type: 'warning' }),
      [addToast],
    ),
  };
}
