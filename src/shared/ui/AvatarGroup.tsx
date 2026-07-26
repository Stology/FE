import { cn } from '@/shared/lib/cn';

import { Avatar } from './Avatar';

type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarUser {
  id: string;
  name: string;
  src?: string;
}

interface AvatarGroupProps {
  className?: string;
  max?: number;
  size?: AvatarSize;
  users: AvatarUser[];
}

const sizeClass: Record<AvatarSize, string> = {
  sm: 'size-7 text-[10px] leading-4',
  md: 'size-9 text-[11px] leading-[17.6px]',
  lg: 'size-12 text-[16px]',
};

export const AvatarGroup = ({ className, max = 2, size = 'md', users }: AvatarGroupProps) => {
  const visibleUsers = users.slice(0, max);
  const restCount = Math.max(users.length - visibleUsers.length, 0);

  return (
    <div className={cn('flex items-center -space-x-2', className)}>
      {visibleUsers.map((user) => (
        <Avatar
          className="border-2 border-white"
          key={user.id}
          name={user.name}
          size={size}
          src={user.src}
        />
      ))}
      {restCount > 0 ? (
        <span
          className={cn(
            'inline-flex shrink-0 items-center justify-center rounded-full border-2 border-white bg-stology-deep-navy font-semibold text-white',
            sizeClass[size],
          )}
          title={`${restCount} more`}
        >
          +{restCount}
        </span>
      ) : null}
    </div>
  );
};
