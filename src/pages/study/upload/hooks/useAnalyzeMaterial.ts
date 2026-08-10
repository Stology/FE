import { useMutation, useQueryClient } from '@tanstack/react-query';

import { analyzeMaterial } from '@/shared/api/upload';
import { toast } from '@/shared/hooks/useToast';

export const useAnalyzeMaterial = (studyId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (materialId: number) => analyzeMaterial(studyId as string, materialId),
    onError: () => {
      toast.error('재분석 요청에 실패했습니다.');
    },
    onSuccess: () => {
      toast.success('재분석을 요청했습니다.');
      queryClient.invalidateQueries({ queryKey: ['study-upload-files', studyId] });
    },
  });
};
