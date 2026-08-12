import { useId, type ReactNode } from 'react';

type TooltipPlacement = 'bottom' | 'top';

interface TooltipProps {
  children: ReactNode;
  className?: string;
  content: ReactNode;
  placement?: TooltipPlacement;
}

export const Tooltip = ({ children, className = '', content, placement = 'top' }: TooltipProps) => {
  const tooltipId = useId();
  const placementClass =
    placement === 'top'
      ? 'bottom-full left-1/2 mb-2 -translate-x-1/2'
      : 'left-1/2 top-full mt-2 -translate-x-1/2';

  return (
    <span
      aria-describedby={tooltipId}
      className={`group relative inline-flex ${className}`}
      tabIndex={0}
    >
      {children}
      <span
        className={`pointer-events-none invisible absolute z-50 w-max max-w-64 rounded-[4px] bg-stology-deep-navy px-2.5 py-1.5 text-center text-caption text-white opacity-0 shadow-sm transition-opacity group-hover:visible group-hover:opacity-100 group-focus:visible group-focus:opacity-100 group-focus-within:visible group-focus-within:opacity-100 ${placementClass}`}
        id={tooltipId}
        role="tooltip"
      >
        {content}
      </span>
    </span>
  );
};

export type { TooltipPlacement, TooltipProps };
