import { UploadCloud, X } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

interface FileUploaderProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'type' | 'value'
> {
  className?: string;
  files?: File[];
  helperText?: string;
  label?: string;
  onChange: (files: File[]) => void;
  onRemove?: (file: File) => void;
}

export const FileUploader = ({
  className,
  files = [],
  helperText,
  label = 'Upload files',
  multiple = false,
  onChange,
  onRemove,
  ...props
}: FileUploaderProps) => (
  <div className={cn('space-y-3', className)}>
    <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-stology-border-light bg-white px-6 py-8 text-center transition hover:border-stology-light-blue hover:bg-stology-off-white">
      <UploadCloud className="size-8 text-stology-electric-blue" aria-hidden />
      <span className="mt-3 text-label text-stology-text-dark">{label}</span>
      {helperText ? (
        <span className="mt-1 text-caption text-stology-text-light">{helperText}</span>
      ) : null}
      <input
        className="sr-only"
        multiple={multiple}
        onChange={(event) => onChange(Array.from(event.target.files ?? []))}
        type="file"
        {...props}
      />
    </label>
    {files.length > 0 ? (
      <ul className="space-y-2">
        {files.map((file) => (
          <li
            className="flex items-center justify-between gap-3 rounded border border-stology-border-light bg-white px-3 py-2 text-body"
            key={`${file.name}-${file.size}`}
          >
            <span className="truncate text-stology-text-dark">{file.name}</span>
            {onRemove ? (
              <button
                aria-label={`Remove ${file.name}`}
                className="shrink-0 rounded p-1 text-stology-text-light transition hover:bg-stology-off-white hover:text-stology-reject"
                onClick={() => onRemove(file)}
                type="button"
              >
                <X size={16} aria-hidden />
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    ) : null}
  </div>
);
