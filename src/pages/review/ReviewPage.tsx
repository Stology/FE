import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useStudyDetail } from '@/shared/hooks';
import type { NodeVoteReq } from '@/shared/api/review';
import type { NodeCandidate, ReviewAction } from '@/shared/types/stology';
import { AppLayout, EmptyState, ErrorMessage, Loading, ProgressBar } from '@/shared/ui';

import { useReviewCandidates, useSubmitVotes } from './hooks';
import { NodeCandidateCard } from './NodeCandidateCard';
import { ReviewActionBar } from './ReviewActionBar';

interface ReviewPageProps {
  candidates?: NodeCandidate[];
  errorMessage?: string | null;
  isLoading?: boolean;
  isReadOnly?: boolean;
  onSubmit?: (candidates: NodeCandidate[]) => void;
}

interface ReviewRouteParams extends Record<string, string | undefined> {
  studyId?: string;
}

/**
 * candidates prop이 주어지면(테스트 등) 그 값을 그대로 쓰고, 없으면 studyId 기준으로
 * 스터디 전체의 대기 중인 노드 후보를 실 API에서 불러온다(2-2: 자료별이 아니라 스터디
 * 전체 단위 검토가 맞는 것으로 확인됨).
 */
export const ReviewPage = ({
  candidates: candidatesProp,
  errorMessage: errorMessageProp,
  isLoading: isLoadingProp = false,
  isReadOnly = false,
  onSubmit,
}: ReviewPageProps) => {
  const { studyId } = useParams<ReviewRouteParams>();
  const { data: studyData } = useStudyDetail(studyId);
  const effectiveIsReadOnly = isReadOnly || (studyData && !studyData.isActive);

  const isControlled = candidatesProp !== undefined;
  const fetchResult = useReviewCandidates(studyId, { enabled: !isControlled });
  const submitVotes = useSubmitVotes(studyId);

  const [candidates, setCandidates] = useState<NodeCandidate[]>(candidatesProp ?? []);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const hasHydratedRef = useRef(false);

  // 백그라운드 refetch가 검토 중인 로컬 승인/반려 선택을 덮어쓰지 않도록, 최초 1회만 반영한다.
  useEffect(() => {
    if (isControlled || hasHydratedRef.current || !fetchResult.isReady) return;

    setCandidates(fetchResult.candidates);
    hasHydratedRef.current = true;
  }, [isControlled, fetchResult.candidates, fetchResult.isReady]);

  const reviewedCount = candidates.filter((candidate) => candidate.myAction).length;
  const isSubmittable = candidates.length > 0 && reviewedCount === candidates.length;
  const isLoading = isControlled ? isLoadingProp : fetchResult.isLoading;
  const errorMessage = isControlled ? errorMessageProp : (fetchResult.error?.message ?? null);

  const applyAction = (candidateIds: string[], action: ReviewAction) => {
    setCandidates((current) =>
      current.map((candidate) =>
        candidateIds.includes(candidate.id) ? { ...candidate, myAction: action } : candidate,
      ),
    );
    setIsSubmitted(false);
    setSubmitError(null);
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
    if (isControlled) {
      setIsSubmitted(true);
      onSubmit?.(candidates);
      return;
    }

    if (!studyId) return;

    setSubmitError(null);

    const votes: NodeVoteReq[] = [];
    let hasUnmatchedCandidate = false;

    candidates
      .filter((candidate) => candidate.myAction)
      .forEach((candidate) => {
        const studyNodeId = fetchResult.studyNodeIdByCandidateId.get(candidate.id);
        if (studyNodeId === undefined) {
          hasUnmatchedCandidate = true;
          return;
        }

        votes.push({
          nodeCandidateId: Number(candidate.id),
          studyNodeId,
          voteType: candidate.myAction === 'approved' ? 'ACCEPT' : 'DENY',
        });
      });

    if (hasUnmatchedCandidate) {
      setSubmitError('일부 후보 정보를 확인하지 못했습니다. 새로고침 후 다시 시도해 주세요.');
      return;
    }

    submitVotes.mutate(votes, {
      onError: () => setSubmitError('검토 제출에 실패했습니다. 다시 시도해 주세요.'),
      onSuccess: () => {
        setIsSubmitted(true);
        onSubmit?.(candidates);
      },
    });
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
        <header className="rounded-lg border border-stology-border-light bg-white px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-heading-1 text-stology-text-dark">AI 후보 검토</h2>
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

        <ul aria-label="노드 후보 목록" className="space-y-4">
          {candidates.map((candidate, index) => (
            <NodeCandidateCard
              candidate={candidate}
              index={index + 1}
              isReadOnly={effectiveIsReadOnly}
              isSelected={selectedIds.includes(candidate.id)}
              key={candidate.id}
              onAction={(candidateId, action) => applyAction([candidateId], action)}
              onSelectChange={handleSelectChange}
              reviewerCount={candidate.reviewerCount}
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

        {submitError ? (
          <div role="alert">
            <ErrorMessage message={submitError} title="검토 제출에 실패했습니다" />
          </div>
        ) : null}

        <ReviewActionBar
          isReadOnly={effectiveIsReadOnly}
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
        {renderContent()}
      </section>
    </AppLayout>
  );
};
