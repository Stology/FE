import { cn } from '@/shared/lib/cn';
import type { NodeCandidate, ReviewAction } from '@/shared/types/stology';
import { Button, Checkbox } from '@/shared/ui';

interface NodeCandidateCardProps {
  candidate: NodeCandidate;
  index: number;
  isReadOnly?: boolean;
  isSelected?: boolean;
  onAction?: (candidateId: string, action: ReviewAction) => void;
  onSelectChange?: (candidateId: string, isSelected: boolean) => void;
  reviewerCount: number;
}

type CandidateState = 'approved' | 'rejected' | 'pending';

const cardClass: Record<CandidateState, string> = {
  approved: 'bg-stology-approve-bg',
  rejected: 'bg-stology-reject-bg',
  pending: 'bg-white',
};

const stripClass: Record<CandidateState, string> = {
  approved: 'bg-stology-approve',
  rejected: 'bg-stology-reject',
  pending: 'bg-stology-border-light',
};

export const NodeCandidateCard = ({
  candidate,
  index,
  isReadOnly = false,
  isSelected = false,
  onAction,
  onSelectChange,
  reviewerCount,
}: NodeCandidateCardProps) => {
  const state: CandidateState = candidate.myAction ?? 'pending';
  const hasRejection = candidate.rejecterNames.length > 0;

  return (
    <li
      className={cn(
        'relative flex flex-wrap items-center gap-x-6 gap-y-4 overflow-hidden rounded-lg border border-stology-border-light py-5 pl-8 pr-5',
        cardClass[state],
      )}
    >
      <span aria-hidden className={cn('absolute inset-y-0 left-0 w-2', stripClass[state])} />

      <Checkbox
        aria-label={`${candidate.name} 후보 선택`}
        checked={isSelected}
        disabled={isReadOnly}
        onChange={(event) => onSelectChange?.(candidate.id, event.target.checked)}
      />

      <div className="min-w-0 flex-1">
        <h3 className="text-heading-2 text-stology-text-dark">
          노드 후보 {index}: {candidate.name}
        </h3>
        <p className="mt-1.5 text-[13px] leading-5 text-stology-text-light">
          {candidate.matchReason}
        </p>
      </div>

      <div className="w-56 shrink-0">
        <p
          className={cn(
            'text-[14px] font-semibold leading-5',
            hasRejection ? 'text-stology-reject' : 'text-stology-text-dark',
          )}
        >
          {hasRejection
            ? '반려 있음'
            : `현재 상태: ${candidate.approverNames.length}/${reviewerCount}명 승인`}
        </p>
        <p className="mt-2 text-caption text-stology-text-light">
          승인자: {candidate.approverNames.length > 0 ? candidate.approverNames.join(', ') : '-'}
        </p>
        <p className="text-caption text-stology-text-light">
          반려자: {candidate.rejecterNames.length > 0 ? candidate.rejecterNames.join(', ') : '-'}
        </p>
      </div>

      <div className="flex shrink-0 gap-2.5">
        <Button
          aria-pressed={candidate.myAction === 'approved'}
          className={
            candidate.myAction === 'approved'
              ? 'bg-stology-deep-navy hover:bg-stology-royal-blue'
              : ''
          }
          disabled={isReadOnly}
          onClick={() => onAction?.(candidate.id, 'approved')}
          variant={candidate.myAction === 'approved' ? 'primary' : 'outline'}
        >
          승인
        </Button>
        <Button
          aria-pressed={candidate.myAction === 'rejected'}
          disabled={isReadOnly}
          onClick={() => onAction?.(candidate.id, 'rejected')}
          variant={candidate.myAction === 'rejected' ? 'danger' : 'outline'}
        >
          반려
        </Button>
      </div>
    </li>
  );
};
