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
  <nav className={cn('flex border-b border-stology-border-light', className)}>
    {items.map((item) => (
      <NavLink
        className={({ isActive }) =>
          cn(
            '-mb-px inline-flex min-h-10 shrink-0 items-center whitespace-nowrap rounded-t-[2.5px] border-b-2 px-[23px] text-[13px] font-medium leading-[20.8px] transition',
            isActive
              ? 'border-stology-electric-blue text-stology-electric-blue drop-shadow-[0_4px_7px_rgba(59,130,246,0.25)]'
              : 'border-transparent text-stology-text-light hover:text-stology-text-dark',
          )
        }
        end
        key={item.id}
        to={item.to}
      >
        {item.label}
      </NavLink>
    ))}
  </nav>
);
