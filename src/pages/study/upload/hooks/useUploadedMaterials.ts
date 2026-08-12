import { useQuery } from '@tanstack/react-query';

import { getStudyUploadFiles } from '@/shared/api/upload';

import { mapRecentFileToMaterial } from '../model/upload_api_mapper';

export const useUploadedMaterials = (studyId: string | undefined, currentWeek: number) =>
  useQuery({
    enabled: Boolean(studyId),
    queryFn: () =>
      getStudyUploadFiles(studyId as string).then((files) =>
        files.map((file) => mapRecentFileToMaterial(file, currentWeek)),
      ),
    queryKey: ['study-upload-files', studyId],
  });
