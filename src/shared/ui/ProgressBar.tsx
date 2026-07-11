import { cn } from '@/shared/lib/cn';

type ProgressBarVariant = 'primary' | 'success' | 'danger' | 'neutral';

interface ProgressBarProps {
  className?: string;
  label?: string;
  max?: number;
  showPercent?: boolean;
  value: number;
  variant?: ProgressBarVariant;
}

const fillClass: Record<ProgressBarVariant, string> = {
  primary: 'bg-stology-electric-blue',
  success: 'bg-stology-approve',
  danger: 'bg-stology-reject',
  neutral: 'bg-stology-text-light',
};

export const ProgressBar = ({
  className,
  label,
  max = 100,
  showPercent = true,
  value,
  variant = 'primary',
}: ProgressBarProps) => {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('grid grid-cols-[auto_1fr_auto] items-center gap-4', className)}>
      {label ? <span className="min-w-12 text-body text-stology-text-light">{label}</span> : null}
      <div
        aria-label={label}
        aria-valuemax={max}
        aria-valuemin={0}
        aria-valuenow={value}
        className="h-3 overflow-hidden rounded-full bg-stology-light-blue/50"
        role="progressbar"
      >
        <div
          className={cn('h-full rounded-full', fillClass[variant])}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showPercent ? (
        <span className="min-w-10 text-right text-body text-stology-text-light">
          {Math.round(percent)}%
        </span>
      ) : null}
    </div>
  );
};
