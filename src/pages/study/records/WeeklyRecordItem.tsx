import { ChevronRight } from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import type { WeeklyRecordConcept } from '@/shared/types/stology';

interface WeeklyRecordItemProps {
  concept: WeeklyRecordConcept;
}

const statusLabel = {
  newly_activated: '신규 활성',
  reinforced: '보강',
} as const;

export const WeeklyRecordItem = ({ concept }: WeeklyRecordItemProps) => (
  <div className="flex min-h-14 items-center gap-2.5 border-b border-stology-border-light px-1 py-4">
    <ChevronRight aria-hidden className="size-3.5 shrink-0 text-stology-text-light" />
    <span className="text-[15px] font-semibold leading-[22.5px] text-stology-text-dark">
      {concept.name}
    </span>
    <span
      className={cn(
        'pl-1 text-xs font-semibold leading-[18px]',
        concept.status === 'newly_activated'
          ? 'text-stology-electric-blue'
          : 'text-stology-text-light',
      )}
    >
      {statusLabel[concept.status]}
    </span>
  </div>
);
