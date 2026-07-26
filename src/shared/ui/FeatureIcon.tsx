import { CheckCircle2, FileText, MessageSquare, Network, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

type FeatureIconType = 'knowledge' | 'file' | 'check' | 'question';
type FeatureIconSize = 'sm' | 'md' | 'lg';

interface FeatureIconProps {
  active?: boolean;
  className?: string;
  icon?: ReactNode;
  label?: string;
  size?: FeatureIconSize;
  type?: FeatureIconType;
}

const iconMap: Record<FeatureIconType, LucideIcon> = {
  check: CheckCircle2,
  file: FileText,
  knowledge: Network,
  question: MessageSquare,
};

const sizeClass: Record<FeatureIconSize, string> = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-12',
};

const iconSize: Record<FeatureIconSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

export const FeatureIcon = ({
  active = false,
  className,
  icon,
  label,
  size = 'md',
  type = 'knowledge',
}: FeatureIconProps) => {
  const Icon = iconMap[type];

  return (
    <span
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center rounded-md transition',
        active ? 'bg-stology-deep-navy text-white' : 'bg-white text-stology-electric-blue',
        sizeClass[size],
        className,
      )}
      role={label ? 'img' : undefined}
    >
      {icon ?? <Icon size={iconSize[size]} aria-hidden={!label} />}
    </span>
  );
};
