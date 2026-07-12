import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  action?: ReactNode;
  className?: string;
  message: ReactNode;
  onClose?: () => void;
  title?: ReactNode;
  type?: ToastType;
}

const typeClass: Record<ToastType, string> = {
  error: 'border-stology-reject-bg bg-white text-stology-reject',
  info: 'border-[#DBEAFE] bg-white text-stology-electric-blue',
  success: 'border-stology-approve-bg bg-white text-stology-approve',
  warning: 'border-[#FEF3C7] bg-white text-[#92400E]',
};

const iconMap: Record<ToastType, ReactNode> = {
  error: <XCircle size={18} aria-hidden />,
  info: <Info size={18} aria-hidden />,
  success: <CheckCircle2 size={18} aria-hidden />,
  warning: <AlertCircle size={18} aria-hidden />,
};

export const Toast = ({
  action,
  className,
  message,
  onClose,
  title,
  type = 'info',
}: ToastProps) => (
  <div
    className={cn(
      'flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-[0_12px_32px_rgba(10,25,47,0.14)]',
      typeClass[type],
      className,
    )}
    aria-atomic="true"
    aria-live={type === 'error' ? 'assertive' : 'polite'}
    role={type === 'error' ? 'alert' : 'status'}
  >
    <span className="mt-0.5 shrink-0">{iconMap[type]}</span>
    <div className="min-w-0 flex-1">
      {title ? <p className="text-label text-stology-text-dark">{title}</p> : null}
      <p className="text-body text-stology-text-light">{message}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
    {onClose ? (
      <button
        aria-label="Close notification"
        className="shrink-0 rounded p-1 text-stology-text-light transition hover:bg-stology-off-white hover:text-stology-text-dark"
        onClick={onClose}
        type="button"
      >
        <X size={16} aria-hidden />
      </button>
    ) : null}
  </div>
);
