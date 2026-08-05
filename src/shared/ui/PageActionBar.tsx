import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

interface PageActionBarProps {
  children?: ReactNode;
  className?: string;
  left?: ReactNode;
  right?: ReactNode;
}

export const PageActionBar = ({ children, className, left, right }: PageActionBarProps) => (
  <div className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{left ?? children}</div>
    {right ? <div className="flex shrink-0 flex-wrap items-center gap-2">{right}</div> : null}
  </div>
);
