import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

import { Card } from './Card';

interface PagePlaceholderProps {
  code: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const PagePlaceholder = ({
  action,
  className,
  code,
  description = '아직 구현 전인 화면입니다.',
  title,
}: PagePlaceholderProps) => (
  <section className={cn('flex min-h-[calc(100vh-56px)] items-center justify-center', className)}>
    <Card className="w-full max-w-xl p-8 text-center">
      <p className="text-label text-stology-electric-blue">{code}</p>
      <h1 className="mt-2 text-heading-1 text-stology-text-dark">{title}</h1>
      <p className="mt-3 text-body text-stology-text-light">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </Card>
  </section>
);
