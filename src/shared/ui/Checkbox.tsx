import type { InputHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  error?: string;
}

export const Checkbox = ({ className, error, id, label, ...props }: CheckboxProps) => {
  const checkboxId = id ?? props.name;

  return (
    <label className="inline-flex items-start gap-2 text-body text-stology-text-dark">
      <input
        className={cn(
          'mt-0.5 size-4 rounded border-stology-border-light accent-stology-electric-blue focus:ring-2 focus:ring-stology-light-blue disabled:cursor-not-allowed disabled:opacity-55',
          className,
        )}
        id={checkboxId}
        type="checkbox"
        {...props}
      />
      {label ? (
        <span>
          {label}
          {error ? (
            <span className="mt-1 block text-caption text-stology-reject">{error}</span>
          ) : null}
        </span>
      ) : null}
    </label>
  );
};
