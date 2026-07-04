import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

type BadgeVariant =
  | 'primary'
  | 'navy'
  | 'week'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'blue'
  | 'green'
  | 'red'
  | 'pending';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  leftIcon?: ReactNode;
}

const badgeClass: Record<BadgeVariant, string> = {
  primary: 'bg-stology-electric-blue text-white',
  navy: 'bg-stology-deep-navy text-white',
  week: 'bg-[#DBEAFE] text-stology-royal-blue',
  neutral: 'bg-white text-stology-text-dark',
  success: 'bg-[#D1FAE5] text-[#065F46]',
  warning: 'bg-[#FEF3C7] text-[#92400E]',
  danger: 'bg-stology-reject-bg text-stology-reject',
  blue: 'bg-stology-electric-blue text-white',
  green: 'bg-[#D1FAE5] text-[#065F46]',
  red: 'bg-stology-reject-bg text-stology-reject',
  pending: 'bg-white text-stology-text-dark',
};

export const Badge = ({
  children,
  className,
  leftIcon,
  variant = 'primary',
  ...props
}: BadgeProps) => (
  <span
    className={cn(
      'inline-flex h-6 items-center justify-center gap-1.5 rounded-full px-2.5 py-[3px] [font-size:14px] font-semibold [line-height:18px]',
      badgeClass[variant],
      className,
    )}
    {...props}
  >
    {leftIcon ? (
      <span className="flex size-4 shrink-0 items-center justify-center">{leftIcon}</span>
    ) : null}
    {children}
  </span>
);
