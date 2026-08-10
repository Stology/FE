import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from '@/shared/hooks/useToast';
import { updateMaterial, type UpdateMaterialReq } from '@/shared/api/upload';

interface UpdateMaterialInput extends UpdateMaterialReq {
  materialId: number;
}

export const useUpdateMaterial = (studyId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ materialId, ...req }: UpdateMaterialInput) =>
      updateMaterial(studyId as string, materialId, req),
    onError: () => {
      toast.error('자료 수정에 실패했습니다.');
    },
    onSuccess: () => {
      toast.success('자료를 수정했습니다.');
      queryClient.invalidateQueries({ queryKey: ['study-upload-files', studyId] });
    },
  });
};
