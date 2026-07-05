import type { InputHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = ({
  className,
  error,
  id,
  label,
  leftIcon,
  rightIcon,
  ...props
}: InputProps) => {
  const inputId = id ?? props.name;

  return (
    <label className="block">
      {label ? <span className="mb-2 block text-label text-stology-text-dark">{label}</span> : null}
      <span className="relative block">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stology-text-light">
            {leftIcon}
          </span>
        ) : null}
        <input
          className={cn(
            'h-10 w-full rounded border border-stology-border-light bg-white px-3 text-body text-stology-text-dark outline-none transition placeholder:text-stology-text-light focus:border-stology-electric-blue focus:ring-2 focus:ring-stology-light-blue',
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            error &&
              'border-stology-reject focus:border-stology-reject focus:ring-stology-reject-bg',
            className,
          )}
          id={inputId}
          {...props}
        />
        {rightIcon ? (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stology-text-light">
            {rightIcon}
          </span>
        ) : null}
      </span>
      {error ? <span className="mt-1 block text-caption text-stology-reject">{error}</span> : null}
    </label>
  );
};
