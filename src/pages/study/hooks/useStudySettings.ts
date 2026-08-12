import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studyApi } from '@/shared/api/study';
import type { UpdateStudyReq, UpdateReviewerCountReq } from '@/shared/api/study';

export const useStudySettings = (studyId: string | undefined) => {
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
      void queryClient.invalidateQueries({ queryKey: ['study', studyId] });
    },
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
  };
};
