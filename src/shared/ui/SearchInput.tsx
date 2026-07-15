import { Search, X } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

interface SearchInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'type' | 'value'
> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  onSearch?: (value: string) => void;
}

export const SearchInput = ({
  className,
  onChange,
  onClear,
  onKeyDown,
  onSearch,
  placeholder = 'Search',
  value,
  ...props
}: SearchInputProps) => (
  <span className="relative block">
    <Search
      aria-hidden
      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stology-text-light"
    />
    <input
      className={cn(
        'h-10 w-full rounded border border-stology-border-light bg-white px-9 text-body text-stology-text-dark outline-none transition placeholder:text-stology-text-light focus:border-stology-electric-blue focus:ring-2 focus:ring-stology-light-blue disabled:cursor-not-allowed disabled:bg-stology-off-white disabled:opacity-70',
        className,
      )}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onSearch?.(event.currentTarget.value);
        onKeyDown?.(event);
      }}
      placeholder={placeholder}
      type="search"
      value={value}
      {...props}
    />
    {value ? (
      <button
        aria-label="Clear search"
        className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-stology-text-light transition hover:bg-stology-off-white hover:text-stology-text-dark"
        onClick={() => {
          onChange('');
          onClear?.();
        }}
        type="button"
      >
        <X size={14} aria-hidden />
      </button>
    ) : null}
  </span>
);
