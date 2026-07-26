import type { HTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('rounded-lg border border-stology-border-light bg-white shadow-sm', className)}
    {...props}
  />
);
