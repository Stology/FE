import type { TextareaHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = ({ className, error, id, label, ...props }: TextareaProps) => {
  const textareaId = id ?? props.name;

  return (
    <label className="block">
      {label ? <span className="mb-2 block text-label text-stology-text-dark">{label}</span> : null}
      <textarea
        className={cn(
          'min-h-28 w-full resize-y rounded border border-stology-border-light bg-white px-3 py-2 text-[13px] font-medium leading-[20.8px] text-stology-text-dark outline-none transition placeholder:text-stology-text-light focus:border-stology-electric-blue focus:ring-2 focus:ring-stology-light-blue',
          error && 'border-stology-reject focus:border-stology-reject focus:ring-stology-reject-bg',
          className,
        )}
        id={textareaId}
        {...props}
      />
      {error ? <span className="mt-1 block text-caption text-stology-reject">{error}</span> : null}
    </label>
  );
};
