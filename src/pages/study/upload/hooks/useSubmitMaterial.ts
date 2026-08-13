import { useMutation, useQueryClient } from '@tanstack/react-query';

import { uploadMaterial } from '@/shared/api/upload';
import type { MaterialDraft } from '@/shared/types/stology';

/**
 * 백엔드 업로드 API는 파일(binary)만 받고 텍스트 필드가 없어(UploadReq: title/description/file),
 * '텍스트 직접 입력' 모드는 입력한 본문을 .md 파일로 감싸 동일한 파일 업로드로 보낸다.
 */
const toUploadFile = (draft: MaterialDraft): File => {
  if (draft.mode === 'file' && draft.file) return draft.file;

  return new File([draft.content ?? ''], `${draft.fileName ?? `${draft.title}.md`}`, {
    type: 'text/markdown',
  });
};

export const useSubmitMaterial = (studyId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draft: MaterialDraft) =>
      uploadMaterial(studyId as string, {
        description: draft.description,
        file: toUploadFile(draft),
        title: draft.title,
        week: draft.week,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-upload-files', studyId] });
    },
  });
};
