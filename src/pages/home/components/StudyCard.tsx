import { useNavigate } from 'react-router-dom';

import { Badge } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import type { Study } from '@/shared/types/stology';

interface StudyCardProps {
  study: Study;
  hasNew?: boolean;
}

export const StudyCard = ({ hasNew = false, study }: StudyCardProps) => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/studies/${study.id}/knowledge`)}
      className={cn(
        'flex w-[185px] shrink-0 flex-col gap-2 rounded-lg border p-5 text-left transition hover:shadow-md',
        'border-stology-border-light bg-stology-off-white',
      )}
    >
      <span className="text-heading-2 text-stology-text-dark line-clamp-2">{study.name}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="week" className="text-[11px]">
          {study.currentWeek}주차
        </Badge>
        {hasNew && (
          <Badge variant="primary" className="text-[11px]">
            NEW
          </Badge>
        )}
      </div>
    </button>
  );
};

interface CreateStudyCardProps {
  onClick: () => void;
}

export const CreateStudyCard = ({ onClick }: CreateStudyCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex w-[185px] shrink-0 flex-col items-center justify-center gap-2 rounded-lg border p-5 transition hover:shadow-md',
      'border-stology-electric-blue bg-white text-stology-electric-blue',
    )}
  >
    <span className="text-3xl font-bold leading-none">+</span>
    <span className="text-[13px] font-semibold">스터디 생성</span>
  </button>
);
