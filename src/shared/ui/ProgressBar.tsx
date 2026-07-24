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
  const safeMax = max > 0 ? max : 1;
  const clampedValue = Math.min(Math.max(value, 0), safeMax);
  const percent = (clampedValue / safeMax) * 100;

  return (
    <div className={cn('flex w-full max-w-[480px] items-center gap-3', className)}>
      {label ? (
        <span className="w-[70px] shrink-0 pt-0.5 text-[11px] font-normal leading-[17.6px] text-stology-text-light">
          {label}
        </span>
      ) : null}
      <div
        aria-label={label}
        aria-valuemax={safeMax}
        aria-valuemin={0}
        aria-valuenow={clampedValue}
        className="flex h-[9px] min-w-0 flex-1 overflow-hidden rounded-full bg-stology-border-light"
        role="progressbar"
      >
        <div
          className={cn('h-full shrink-0', fillClass[variant])}
          style={{ width: `${percent}%` }}
        />
        <div className="h-full min-w-0 flex-1 bg-stology-light-blue/50" />
      </div>
      {showPercent ? (
        <span className="w-10 shrink-0 text-right text-[11px] font-normal leading-[17.6px] text-stology-text-light">
          {Math.round(percent)}%
        </span>
      ) : null}
    </div>
  );
};
