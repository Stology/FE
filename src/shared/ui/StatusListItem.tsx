import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

interface StatusListItemProps {
  actions?: ReactNode;
  className?: string;
  description?: ReactNode;
  leading?: ReactNode;
  status?: ReactNode;
  title: ReactNode;
}

export const StatusListItem = ({
  actions,
  className,
  description,
  leading,
  status,
  title,
}: StatusListItemProps) => (
  <div
    className={cn(
      'flex items-center justify-between gap-4 rounded-lg border border-stology-border-light bg-white px-4 py-3',
      className,
    )}
  >
    <div className="flex min-w-0 items-center gap-3">
      {leading ? <div className="shrink-0 text-stology-electric-blue">{leading}</div> : null}
      <div className="min-w-0">
        <p className="truncate text-label text-stology-text-dark">{title}</p>
        {description ? (
          <p className="mt-1 truncate text-caption text-stology-text-light">{description}</p>
        ) : null}
      </div>
    </div>
    <div className="flex shrink-0 items-center gap-2">
      {status}
      {actions}
    </div>
  </div>
);
