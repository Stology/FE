import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studyApi } from '@/shared/api/study';
import type { UpdateStudyReq, UpdateReviewerCountReq } from '@/shared/api/study';

export function useStudySettings(studyId: string | undefined, isReviewerCountEnabled = false) {
  const queryClient = useQueryClient();
  const parsedStudyId = studyId ? Number(studyId) : 0;

  const updateStudyMutation = useMutation({
    mutationFn: (data: UpdateStudyReq) => studyApi.updateStudy(parsedStudyId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['study', studyId] });
      void queryClient.invalidateQueries({ queryKey: ['studies'] });
    },
  });

  const updateReviewerCountMutation = useMutation({
    mutationFn: (data: UpdateReviewerCountReq) => studyApi.updateReviewerCount(parsedStudyId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['study', studyId, 'reviewer-count'] });
    },
  });

  const reviewerCountQuery = useQuery({
    enabled: parsedStudyId > 0 && isReviewerCountEnabled,
    queryFn: () => studyApi.getReviewerCount(parsedStudyId),
    queryKey: ['study', studyId, 'reviewer-count'],
    retry: false,
  });

  const closeStudyMutation = useMutation({
    mutationFn: () => studyApi.closeStudy(parsedStudyId),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['study', studyId] }),
        queryClient.invalidateQueries({ queryKey: ['studies'] }),
      ]),
  });

  const getInvitationTokenMutation = useMutation({
    mutationFn: () => studyApi.getInvitationToken(parsedStudyId),
  });

  return {
    updateStudyMutation,
    updateReviewerCountMutation,
    closeStudyMutation,
    getInvitationTokenMutation,
    reviewerCountQuery,
  };
}
