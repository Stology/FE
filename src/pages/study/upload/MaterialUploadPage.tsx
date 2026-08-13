import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

import { mockMaterials } from '@/shared/mocks/materials';
import type { Material, MaterialDraft } from '@/shared/types/stology';
import { Button, EmptyState, ErrorMessage, Loading } from '@/shared/ui';

import { MaterialEditModal, type MaterialEditPayload } from './MaterialEditModal';
import { MaterialUploadForm } from './MaterialUploadForm';
import { PendingMaterialItem } from './PendingMaterialItem';

interface MaterialUploadPageProps {
  currentWeek?: number;
  errorMessage?: string | null;
  isEditSubmitting?: boolean;
  isLoading?: boolean;
  isReadOnly?: boolean;
  isSubmitting?: boolean;
  materials?: Material[];
  onMaterialEdit?: (material: Material, payload: MaterialEditPayload) => void | Promise<void>;
  onMaterialReanalyze?: (material: Material) => void;
  onMaterialReview?: (material: Material) => void;
  onRetry?: () => void;
  onSubmit?: (draft: MaterialDraft) => void | Promise<void>;
}

export const MaterialUploadPage = ({
  currentWeek,
  errorMessage,
  isEditSubmitting = false,
  isLoading = false,
  isReadOnly = false,
  isSubmitting = false,
  materials = mockMaterials,
  onMaterialEdit,
  onMaterialReanalyze,
  onMaterialReview,
  onRetry,
  onSubmit,
}: MaterialUploadPageProps) => {
  const [submittedTitle, setSubmittedTitle] = useState<string | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  async function handleSubmit(draft: MaterialDraft) {
    await onSubmit?.(draft);
    setSubmittedTitle(draft.title);
  }

  async function handleEditSubmit(payload: MaterialEditPayload) {
    if (!editingMaterial) return;
    await onMaterialEdit?.(editingMaterial, payload);
    setEditingMaterial(null);
  }

  function renderPendingContent() {
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
      return <EmptyState className="min-h-40" title="검토 대기 중인 자료가 없습니다." />;
    }

    return (
      <ul aria-label="대기 중인 자료 목록" className="border-t border-stology-border-light">
        {materials.map((material) => (
          <PendingMaterialItem
            isReadOnly={isReadOnly}
            key={material.id}
            material={material}
            onEdit={setEditingMaterial}
            onReanalyze={onMaterialReanalyze}
            onReview={onMaterialReview}
          />
        ))}
      </ul>
    );
  }

  return (
    <section
      aria-busy={isLoading}
      aria-label="자료 업로드"
      className="min-h-[520px] rounded-b-lg border border-stology-border-light bg-white px-4 py-6 sm:px-6 lg:px-10 lg:pb-10 lg:pt-10"
    >
      <div className="w-full space-y-5">
        {isReadOnly ? (
          <div
            className="flex min-h-[86px] items-center justify-center rounded-lg border border-stology-border-light bg-stology-off-white px-4 py-5 text-center text-stology-text-dark"
            role="status"
          >
            <p className="text-[14px] font-semibold leading-5">
              종료된 스터디에서는 자료 업로드와 검토가 불가능합니다.
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

        <div className="min-h-[300px] rounded-lg border border-stology-border-light bg-white p-6">
          <h3 className="mb-4 text-heading-2 text-stology-text-dark">등록된 자료</h3>
          {renderPendingContent()}
        </div>
      </div>

      <MaterialEditModal
        isOpen={editingMaterial !== null}
        isSubmitting={isEditSubmitting}
        material={editingMaterial}
        onClose={() => setEditingMaterial(null)}
        onSubmit={handleEditSubmit}
      />
    </section>
  );
};
