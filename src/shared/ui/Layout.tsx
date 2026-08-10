import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import { useMyStudies } from '@/shared/hooks';

import { Sidebar, type SidebarSection } from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
  sidebarSections?: SidebarSection[];
  className?: string;
}

export const AppLayout = ({ children, className, sidebarSections }: AppLayoutProps) => {
  const { studies } = useMyStudies();

  const activeStudies = studies.filter((s) => s.status === 'active');
  const endedStudies = studies.filter((s) => s.status === 'ended');

  const defaultSections: SidebarSection[] = [
    {
      items: [{ label: '홈', to: '/' }],
    },
    {
      title: '진행 중 스터디',
      items: activeStudies.map((study) => ({
        label: study.name,
        to: `/studies/${study.id}/knowledge`,
        activePattern: `/studies/${study.id}/*`,
      })),
    },
    {
      title: '지난 활동',
      items: endedStudies.map((study) => ({
        label: study.name,
        to: `/studies/${study.id}/knowledge`,
        activePattern: `/studies/${study.id}/*`,
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-stology-off-white text-stology-text-dark">
      <div className="flex min-h-screen">
        <Sidebar sections={sidebarSections ?? defaultSections} />
        <main className={cn('min-w-0 flex-1 px-8 py-7', className)}>{children}</main>
      </div>
    </div>
  );
};
