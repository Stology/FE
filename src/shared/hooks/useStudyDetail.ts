import { useQuery } from '@tanstack/react-query';

import { studyApi } from '@/shared/api/study';

export const useStudyDetail = (studyId?: string) => {
  return useQuery({
    queryKey: ['study', studyId],
    queryFn: () => {
      if (!studyId) throw new Error('스터디 ID가 없습니다.');
      return studyApi.getStudyDetail(Number(studyId));
    },
    enabled: !!studyId,
  });
};
