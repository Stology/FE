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
  <div className={cn('flex w-full max-w-[480px] flex-col -space-y-[3px] pt-4', className)}>
    {items.map((item) => (
      <ProgressBar key={item.id} label={item.label} showPercent={showPercent} value={item.value} />
    ))}
  </div>
);
