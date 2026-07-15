import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-stology-electric-blue text-white hover:bg-stology-royal-blue',
  secondary:
    'border border-stology-electric-blue bg-white text-stology-electric-blue hover:bg-stology-off-white',
  outline:
    'border border-stology-border-light bg-white text-stology-royal-blue hover:bg-stology-off-white',
  ghost: 'text-stology-electric-blue hover:bg-stology-off-white',
  success:
    'border border-stology-approve bg-stology-approve text-white hover:bg-stology-royal-blue',
  danger: 'border border-stology-reject bg-stology-reject text-white hover:bg-red-600',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'h-6 rounded-[4.5px] px-2.5 py-[3px] text-[13px] font-semibold leading-none',
  md: 'h-9 rounded-[4.5px] px-5 py-2 text-[13px] font-semibold leading-none',
  lg: 'h-11 rounded-[4.5px] px-5 py-2 text-base font-bold leading-6',
  icon: 'size-9 p-0',
};

export const Button = ({
  children,
  className,
  disabled,
  isLoading = false,
  leftIcon,
  rightIcon,
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) => (
  <button
    className={cn(
      'inline-flex shrink-0 items-center justify-center gap-2 rounded transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stology-electric-blue disabled:cursor-not-allowed disabled:opacity-55',
      sizeClass[size],
      variantClass[variant],
      className,
    )}
    disabled={disabled || isLoading}
    type={type}
    {...props}
  >
    {isLoading ? (
      <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
    ) : (
      leftIcon
    )}
    {children}
    {!isLoading ? rightIcon : null}
  </button>
);
