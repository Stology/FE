import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

interface SectionTitleProps {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

const DefaultIcon = () => (
  <span aria-hidden className="grid size-5 rotate-45 grid-cols-2 grid-rows-2 gap-0.5">
    <span className="rounded-[1px] bg-[#7C3AED]" />
    <span className="rounded-[1px] bg-[#8B5CF6]" />
    <span className="rounded-[1px] bg-[#6D28D9]" />
    <span className="rounded-[1px] bg-[#A78BFA]" />
  </span>
);

export const SectionTitle = ({ actions, children, className, icon }: SectionTitleProps) => (
  <div className={cn('flex items-center justify-between gap-4', className)}>
    <div className="flex items-center gap-3">
      {icon ?? <DefaultIcon />}
      <h2 className="text-heading-1 text-[#7C3AED]">{children}</h2>
    </div>
    {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
  </div>
);
