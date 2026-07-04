import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';

export interface TabItem {
  id: string;
  label: ReactNode;
  to: string;
}

interface TabsProps {
  items: TabItem[];
  className?: string;
}

export const Tabs = ({ className, items }: TabsProps) => (
  <nav className={cn('flex flex-wrap gap-8 border-b border-stology-border-light', className)}>
    {items.map((item) => (
      <NavLink
        className={({ isActive }) =>
          cn(
            '-mb-px inline-flex min-h-10 items-center border-b-2 px-1 text-[14px] font-semibold leading-5 transition',
            isActive
              ? 'border-stology-electric-blue text-stology-electric-blue'
              : 'border-transparent text-stology-text-light hover:text-stology-text-dark',
          )
        }
        key={item.id}
        to={item.to}
      >
        {item.label}
      </NavLink>
    ))}
  </nav>
);
