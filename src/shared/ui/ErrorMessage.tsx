import { AlertCircle } from 'lucide-react';

import { cn } from '@/shared/lib/cn';

interface ErrorMessageProps {
  title?: string;
  message: string;
  className?: string;
}

export const ErrorMessage = ({
  className,
  message,
  title = '문제가 발생했습니다',
}: ErrorMessageProps) => (
  <div
    className={cn(
      'rounded-lg border border-stology-reject bg-stology-reject-bg px-4 py-3 text-stology-reject',
      className,
    )}
  >
    <div className="flex gap-3">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div>
        <p className="text-label">{title}</p>
        <p className="mt-1 text-body">{message}</p>
      </div>
    </div>
  </div>
);
