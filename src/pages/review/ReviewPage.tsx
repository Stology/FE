import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { getMockMaterialReview, mockMaterialReview } from '@/shared/mocks/materialReviews';
import type { MaterialReview, NodeCandidate, ReviewAction } from '@/shared/types/stology';
import { AppLayout, EmptyState, ErrorMessage, Loading, ProgressBar } from '@/shared/ui';

import { NodeCandidateCard } from './NodeCandidateCard';
import { ReviewActionBar } from './ReviewActionBar';

interface ReviewPageProps {
  errorMessage?: string | null;
  isLoading?: boolean;
  isReadOnly?: boolean;
  onSubmit?: (candidates: NodeCandidate[]) => void;
  review?: MaterialReview;
}

interface ReviewRouteParams extends Record<string, string | undefined> {
  materialId?: string;
}

export const ReviewPage = ({
  errorMessage,
  isLoading = false,
  isReadOnly = false,
  onSubmit,
  review,
}: ReviewPageProps) => {
  const { materialId } = useParams<ReviewRouteParams>();
  const initialReview =
    review ?? (materialId ? getMockMaterialReview(materialId) : mockMaterialReview);

  const [candidates, setCandidates] = useState<NodeCandidate[]>(initialReview?.candidates ?? []);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const reviewedCount = candidates.filter((candidate) => candidate.myAction).length;
  const isSubmittable = candidates.length > 0 && reviewedCount === candidates.length;

  const applyAction = (candidateIds: string[], action: ReviewAction) => {
    setCandidates((current) =>
      current.map((candidate) =>
        candidateIds.includes(candidate.id) ? { ...candidate, myAction: action } : candidate,
      ),
    );
    setIsSubmitted(false);
  };

  const handleSelectChange = (candidateId: string, isSelected: boolean) => {
    setSelectedIds((current) =>
      isSelected ? [...current, candidateId] : current.filter((id) => id !== candidateId),
    );
  };

  const handleBulkAction = (action: ReviewAction) => {
    applyAction(selectedIds, action);
    setSelectedIds([]);
  };

  const handleApproveAll = () => {
    applyAction(
      candidates.map((candidate) => candidate.id),
      'approved',
    );
    setSelectedIds([]);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    onSubmit?.(candidates);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div aria-live="polite" role="status">
          <Loading className="min-h-40" label="AI 후보를 불러오는 중입니다" />
        </div>
      );
    }

    if (errorMessage) {
      return (
        <div className="flex min-h-40 flex-col items-center justify-center gap-4">
          <div className="w-full max-w-lg" role="alert">
            <ErrorMessage message={errorMessage} title="AI 후보를 불러오지 못했습니다" />
          </div>
        </div>
      );
    }

    if (!initialReview) {
      return (
        <EmptyState
          className="min-h-40"
          description="자료 업로드 탭에서 검토 필요 자료를 선택해 주세요."
          title="검토할 자료를 찾을 수 없습니다"
        />
      );
    }

    if (candidates.length === 0) {
      return (
        <EmptyState
          className="min-h-40"
          description="AI가 추출한 노드 후보가 없습니다."
          title="검토할 후보가 없습니다"
        />
      );
    }

    return (
      <>
        <ul aria-label="노드 후보 목록" className="space-y-4">
          {candidates.map((candidate, index) => (
            <NodeCandidateCard
              candidate={candidate}
              index={index + 1}
              isReadOnly={isReadOnly}
              isSelected={selectedIds.includes(candidate.id)}
              key={candidate.id}
              onAction={(candidateId, action) => applyAction([candidateId], action)}
              onSelectChange={handleSelectChange}
              reviewerCount={initialReview.reviewerCount}
            />
          ))}
        </ul>

        {isSubmitted ? (
          <p
            aria-live="polite"
            className="rounded border border-stology-approve bg-stology-approve-bg px-4 py-3 text-[13px] leading-5 text-stology-text-dark"
            role="status"
          >
            검토를 제출했습니다.
          </p>
        ) : null}

        <ReviewActionBar
          isReadOnly={isReadOnly}
          isSubmittable={isSubmittable}
          onApproveAll={handleApproveAll}
          onBulkAction={handleBulkAction}
          onSubmit={handleSubmit}
          selectedCount={selectedIds.length}
        />
      </>
    );
  };

  return (
    <AppLayout className="min-h-screen bg-stology-off-white px-6">
      <section
        aria-busy={isLoading}
        aria-label="AI 후보 검토"
        className="w-full max-w-[1120px] space-y-6 py-6"
      >
        {initialReview ? (
          <header className="rounded-lg border border-stology-border-light bg-white px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-heading-1 text-stology-text-dark">
                {initialReview.material.title} / 업로더 {initialReview.material.uploaderName} /
                업로드일 {initialReview.material.uploadedAt} / {initialReview.material.week}주차
              </h2>
              <p className="text-[15px] font-bold leading-6 text-stology-text-dark">
                {reviewedCount}/{candidates.length} 검토 완료
              </p>
            </div>
            <ProgressBar
              className="mt-4 max-w-none"
              label="검토 진행률"
              max={candidates.length || 1}
              value={reviewedCount}
              variant="success"
            />
          </header>
        ) : null}

        {renderContent()}
      </section>
    </AppLayout>
  );
};
