import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({ action, className, description, icon, title }: EmptyStateProps) => (
  <section
    className={cn(
      'flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-stology-border-light bg-stology-off-white px-6 py-8 text-center',
      className,
    )}
  >
    {icon ? <div className="mb-3 text-stology-text-light">{icon}</div> : null}
    <h2 className="text-heading-2 text-stology-text-dark">{title}</h2>
    {description ? (
      <p className="mt-2 max-w-md text-body text-stology-text-light">{description}</p>
    ) : null}
    {action ? <div className="mt-5">{action}</div> : null}
  </section>
);
