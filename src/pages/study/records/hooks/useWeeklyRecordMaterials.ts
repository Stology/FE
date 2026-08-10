import { useQuery } from '@tanstack/react-query';

import { getWeeklyRecordNodeInfo } from '@/shared/api/weekly_records';

import { mapWeeklyRecordMaterials } from '../model/weekly_records_api_mapper';

export const useWeeklyRecordMaterials = (
  studyId: string | undefined,
  nodeId: string | undefined,
  isEnabled: boolean,
) =>
  useQuery({
    enabled: isEnabled && Boolean(studyId) && Boolean(nodeId),
    queryFn: () =>
      getWeeklyRecordNodeInfo(studyId as string, nodeId as string).then(mapWeeklyRecordMaterials),
    queryKey: ['weekly-records', 'materials', studyId, nodeId],
  });
