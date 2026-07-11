import { cn } from '@/shared/lib/cn';

type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  className?: string;
  name: string;
  size?: AvatarSize;
  src?: string;
}

const sizeClass: Record<AvatarSize, string> = {
  sm: 'size-8 text-[12px]',
  md: 'size-10 text-[14px]',
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
      'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#DBEAFE] font-bold text-stology-royal-blue ring-2 ring-white',
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
