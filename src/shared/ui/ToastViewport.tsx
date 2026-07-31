import { useEffect } from 'react';

import { useToastStore, type ToastItem } from '@/shared/stores/useToastStore';

import { Toast } from './Toast';

export const ToastViewport = () => {
  const dismissToast = useToastStore((state) => state.dismissToast);
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <section
      aria-label="알림 목록"
      className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6"
    >
      {toasts.map((toast) => (
        <div className="pointer-events-auto" key={toast.id}>
          <ToastEntry dismissToast={dismissToast} toast={toast} />
        </div>
      ))}
    </section>
  );
};

interface ToastEntryProps {
  dismissToast: (id: string) => void;
  toast: ToastItem;
}

const ToastEntry = ({ dismissToast, toast }: ToastEntryProps) => {
  useEffect(() => {
    if (toast.duration <= 0) return undefined;

    const timer = window.setTimeout(() => dismissToast(toast.id), toast.duration);
    return () => window.clearTimeout(timer);
  }, [dismissToast, toast.duration, toast.id]);

  return (
    <Toast
      action={toast.action}
      message={toast.message}
      onClose={() => dismissToast(toast.id)}
      title={toast.title}
      type={toast.type}
    />
  );
};
