import { PencilLine } from 'lucide-react';

import { materialStatusLabel } from '@/shared/mocks/materials';
import type { Material, MaterialStatus } from '@/shared/types/stology';
import { Badge, Button } from '@/shared/ui';

interface PendingMaterialItemProps {
  isReadOnly?: boolean;
  material: Material;
  onEdit?: (material: Material) => void;
  onReview?: (material: Material) => void;
}

type BadgeVariant = 'danger' | 'neutral' | 'primary' | 'success' | 'warning';

const statusVariant: Record<MaterialStatus, BadgeVariant> = {
  extracting: 'warning',
  extract_failed: 'danger',
  needs_review: 'primary',
  editable: 'neutral',
  confirmed: 'success',
};

export const PendingMaterialItem = ({
  isReadOnly = false,
  material,
  onEdit,
  onReview,
}: PendingMaterialItemProps) => {
  const isReviewable = material.status === 'needs_review';
  const isEditable = material.status === 'editable' && material.isOwn;

  return (
    <li className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-stology-border-light px-1 py-4 last:border-b-0">
      <time className="w-24 shrink-0 text-[13px] leading-5 text-stology-text-light">
        {material.uploadedAt}
      </time>

      <span className="min-w-0 flex-1 text-[13px] font-semibold leading-5 text-stology-text-dark">
        {isReviewable && !isReadOnly ? (
          <button
            className="rounded text-left underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stology-electric-blue"
            onClick={() => onReview?.(material)}
            type="button"
          >
            {material.title}
          </button>
        ) : (
          material.title
        )}
      </span>

      <span className="w-20 shrink-0 text-[13px] leading-5 text-stology-text-light">
        {material.uploaderName}
      </span>

      <span className="flex w-64 shrink-0 items-center gap-2">
        <Badge
          className={material.status === 'editable' ? 'border border-stology-border-light' : ''}
          variant={statusVariant[material.status]}
        >
          {materialStatusLabel[material.status]}
        </Badge>
        {material.status === 'extract_failed' ? (
          <span className="text-caption text-stology-text-light">1일 후 자동 삭제</span>
        ) : null}
      </span>

      <span className="w-24 shrink-0 text-right">
        {isEditable && !isReadOnly ? (
          <Button
            leftIcon={<PencilLine aria-hidden size={14} />}
            onClick={() => onEdit?.(material)}
            size="sm"
            variant="outline"
          >
            자료 수정
          </Button>
        ) : null}
      </span>
    </li>
  );
};
