import type { SelectHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = ({ children, className, error, id, label, ...props }: SelectProps) => {
  const selectId = id ?? props.name;

  return (
    <label className="block">
      {label ? <span className="mb-2 block text-label text-stology-text-dark">{label}</span> : null}
      <select
        className={cn(
          'h-10 w-full rounded border border-stology-border-light bg-white px-3 text-body text-stology-text-dark outline-none transition focus:border-stology-electric-blue focus:ring-2 focus:ring-stology-light-blue',
          error && 'border-stology-reject focus:border-stology-reject focus:ring-stology-reject-bg',
          className,
        )}
        id={selectId}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="mt-1 block text-caption text-stology-reject">{error}</span> : null}
    </label>
  );
};
