import { useState } from 'react';

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
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const hasSelection = selectedCount > 0;

  const handleBulkAction = (action: ReviewAction) => {
    onBulkAction?.(action);
    setIsBulkOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-stology-border-light bg-white px-5 py-4">
      <Button disabled={isReadOnly} onClick={onApproveAll} variant="outline">
        전체 승인
      </Button>

      <Button
        aria-expanded={isBulkOpen}
        disabled={isReadOnly || !hasSelection}
        onClick={() => setIsBulkOpen((current) => !current)}
        variant="outline"
      >
        선택 일괄 처리{hasSelection ? ` (${selectedCount})` : ''}
      </Button>

      {isBulkOpen && hasSelection ? (
        <div aria-label="선택 일괄 처리 액션" className="flex gap-2" role="group">
          <Button onClick={() => handleBulkAction('approved')} size="sm" variant="secondary">
            선택 승인
          </Button>
          <Button onClick={() => handleBulkAction('rejected')} size="sm" variant="danger">
            선택 반려
          </Button>
        </div>
      ) : null}

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
