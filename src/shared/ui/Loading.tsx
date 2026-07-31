import { cn } from '@/shared/lib/cn';

type LoadingSize = 'sm' | 'md' | 'lg';

interface LoadingProps {
  className?: string;
  label?: string;
  size?: LoadingSize;
}

const sizeClass: Record<LoadingSize, string> = {
  sm: 'size-4 border-2',
  md: 'size-6 border-2',
  lg: 'size-8 border-[3px]',
};

export const Loading = ({ className, label, size = 'md' }: LoadingProps) => (
  <div className={cn('flex items-center justify-center gap-3 text-stology-text-light', className)}>
    <span
      aria-hidden
      className={cn(
        'shrink-0 animate-spin rounded-full border-current border-t-transparent',
        sizeClass[size],
      )}
    />
    {label ? (
      <span className="text-body">{label}</span>
    ) : (
      <span className="sr-only">불러오는 중입니다</span>
    )}
  </div>
);
