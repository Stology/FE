import type { ReviewAction } from '@/shared/types/stology';
import { Button } from '@/shared/ui';

interface ReviewActionBarProps {
  isReadOnly?: boolean;
  isSubmittable?: boolean;
  onApproveAll?: () => void;
  onBulkAction?: (action: ReviewAction) => void;
  onSubmit?: () => void;
  selectedCount?: number;
}

export const ReviewActionBar = ({
  isReadOnly = false,
  isSubmittable = false,
  onApproveAll,
  onBulkAction,
  onSubmit,
  selectedCount = 0,
}: ReviewActionBarProps) => {
  const hasSelection = selectedCount > 0;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-stology-border-light bg-white px-5 py-4">
      <p className="text-[15px] font-bold leading-[22px] text-stology-text-dark">
        선택된 후보 {selectedCount}개
      </p>

      <Button disabled={isReadOnly} onClick={onApproveAll} variant="outline">
        전체 승인
      </Button>
      <Button
        disabled={isReadOnly || !hasSelection}
        onClick={() => onBulkAction?.('approved')}
        variant="outline"
      >
        선택 승인
      </Button>
      <Button
        disabled={isReadOnly || !hasSelection}
        onClick={() => onBulkAction?.('rejected')}
        variant="outline"
      >
        선택 반려
      </Button>

      <div className="ml-auto flex items-center gap-3">
        {!isSubmittable && !isReadOnly ? (
          <p className="text-caption text-stology-text-light">
            모든 후보를 검토하면 제출할 수 있습니다
          </p>
        ) : null}
        <Button
          className="bg-stology-deep-navy hover:bg-stology-royal-blue"
          disabled={isReadOnly || !isSubmittable}
          onClick={onSubmit}
        >
          검토 마치기
        </Button>
      </div>
    </div>
  );
};
