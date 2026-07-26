import { cn } from '@/shared/lib/cn';

type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  className?: string;
  name: string;
  size?: AvatarSize;
  src?: string;
}

const sizeClass: Record<AvatarSize, string> = {
  sm: 'size-7 text-[10px] leading-4',
  md: 'size-9 text-[11px] leading-[17.6px]',
  lg: 'size-12 text-[16px]',
};

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const Avatar = ({ className, name, size = 'md', src }: AvatarProps) => (
  <span
    className={cn(
      'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-stology-border-light bg-[#DBEAFE] font-semibold text-stology-royal-blue',
      sizeClass[size],
      className,
    )}
    title={name}
  >
    {src ? (
      <img alt="" className="size-full object-cover" src={src} />
    ) : (
      <span aria-hidden>{getInitials(name)}</span>
    )}
    <span className="sr-only">{name}</span>
  </span>
);
