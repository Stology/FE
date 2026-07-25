import { useState } from 'react';
import { LockKeyhole, RotateCcw } from 'lucide-react';

import { mockMaterials } from '@/shared/mocks/materials';
import type { Material, MaterialDraft } from '@/shared/types/stology';
import { Button, EmptyState, ErrorMessage, Loading } from '@/shared/ui';

import { MaterialUploadForm } from './MaterialUploadForm';
import { PendingMaterialItem } from './PendingMaterialItem';

interface MaterialUploadPageProps {
  currentWeek?: number;
  errorMessage?: string | null;
  isLoading?: boolean;
  isReadOnly?: boolean;
  isSubmitting?: boolean;
  materials?: Material[];
  onMaterialEdit?: (material: Material) => void;
  onMaterialReview?: (material: Material) => void;
  onRetry?: () => void;
  onSubmit?: (draft: MaterialDraft) => void;
}

export const MaterialUploadPage = ({
  currentWeek,
  errorMessage,
  isLoading = false,
  isReadOnly = false,
  isSubmitting = false,
  materials = mockMaterials,
  onMaterialEdit,
  onMaterialReview,
  onRetry,
  onSubmit,
}: MaterialUploadPageProps) => {
  const [submittedTitle, setSubmittedTitle] = useState<string | null>(null);

  const handleSubmit = (draft: MaterialDraft) => {
    setSubmittedTitle(draft.title);
    onSubmit?.(draft);
  };

  const renderPendingContent = () => {
    if (isLoading) {
      return (
        <div aria-live="polite" role="status">
          <Loading className="min-h-40" label="대기 중인 자료를 불러오는 중입니다" />
        </div>
      );
    }

    if (errorMessage) {
      return (
        <div className="flex min-h-40 flex-col items-center justify-center gap-4">
          <div className="w-full max-w-lg" role="alert">
            <ErrorMessage message={errorMessage} title="대기 중인 자료를 불러오지 못했습니다" />
          </div>
          {onRetry ? (
            <Button
              leftIcon={<RotateCcw aria-hidden size={15} />}
              onClick={onRetry}
              variant="outline"
            >
              다시 시도
            </Button>
          ) : null}
        </div>
      );
    }

    if (materials.length === 0) {
      return (
        <EmptyState
          className="min-h-40"
          description="자료를 등록하면 AI 추출이 시작됩니다."
          title="대기 중인 자료가 없습니다"
        />
      );
    }

    return (
      <ul aria-label="대기 중인 자료 목록" className="border-t border-stology-border-light">
        {materials.map((material) => (
          <PendingMaterialItem
            isReadOnly={isReadOnly}
            key={material.id}
            material={material}
            onEdit={onMaterialEdit}
            onReview={onMaterialReview}
          />
        ))}
      </ul>
    );
  };

  return (
    <section
      aria-busy={isLoading}
      aria-label="자료 업로드"
      className="min-h-[520px] rounded-b-lg border border-stology-border-light bg-white px-4 py-6 sm:px-6 lg:px-10 lg:pb-10 lg:pt-10"
    >
      <div className="w-full max-w-[1120px] space-y-6">
        {isReadOnly ? (
          <div
            className="flex items-start gap-2.5 border-y border-stology-border-light bg-stology-off-white px-4 py-3 text-stology-text-light"
            role="status"
          >
            <LockKeyhole aria-hidden className="mt-0.5 size-4 shrink-0" />
            <p className="text-[13px] leading-5">
              종료된 스터디입니다. 자료를 등록하거나 수정할 수 없습니다.
            </p>
          </div>
        ) : (
          <MaterialUploadForm
            currentWeek={currentWeek}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        )}

        {submittedTitle ? (
          <p
            aria-live="polite"
            className="rounded border border-stology-approve bg-stology-approve-bg px-4 py-3 text-[13px] leading-5 text-stology-text-dark"
            role="status"
          >
            &lsquo;{submittedTitle}&rsquo; 자료를 등록했습니다. AI 추출이 시작됩니다.
          </p>
        ) : null}

        <div className="rounded-lg border border-stology-border-light bg-white p-6">
          <h3 className="mb-4 text-heading-2 text-stology-text-dark">대기 중인 자료</h3>
          {renderPendingContent()}
        </div>
      </div>
    </section>
  );
};
