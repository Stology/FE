import { useQuery } from '@tanstack/react-query';

import { getStudyUploadFiles } from '@/shared/api/upload';
import { useAuthStore } from '@/shared/stores/useAuthStore';

import { mapRecentFileToMaterial } from '../model/upload_api_mapper';

export const useUploadedMaterials = (studyId: string | undefined, currentWeek: number) => {
  const memberId = useAuthStore((state) => state.memberId);

  return useQuery({
    enabled: Boolean(studyId),
    queryFn: () =>
      getStudyUploadFiles(studyId as string).then((files) =>
        files.map((file) => mapRecentFileToMaterial(file, currentWeek, memberId)),
      ),
    queryKey: ['study-upload-files', studyId, memberId],
  });
};
