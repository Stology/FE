import { cn } from '@/shared/lib/cn';

import { ProgressBar } from './ProgressBar';

export interface WeeklyProgressItem {
  id: string;
  label: string;
  value: number;
}

interface WeeklyProgressListProps {
  className?: string;
  items: WeeklyProgressItem[];
  showPercent?: boolean;
}

export const WeeklyProgressList = ({
  className,
  items,
  showPercent = true,
}: WeeklyProgressListProps) => (
  <div className={cn('flex flex-col gap-2', className)}>
    {items.map((item) => (
      <ProgressBar key={item.id} label={item.label} showPercent={showPercent} value={item.value} />
    ))}
  </div>
);
