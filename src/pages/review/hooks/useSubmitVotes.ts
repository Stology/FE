import { useMutation } from '@tanstack/react-query';

import { acceptNodes, type NodeVoteReq } from '@/shared/api/review';

export const useSubmitVotes = (studyId: string | undefined) =>
  useMutation({
    mutationFn: (votes: NodeVoteReq[]) => acceptNodes(studyId as string, votes),
  });
