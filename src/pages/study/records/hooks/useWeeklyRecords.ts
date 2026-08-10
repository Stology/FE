import { useQuery } from '@tanstack/react-query';

import { getWeeklyRecordNodes } from '@/shared/api/weekly_records';

import { mapWeeklyRecordConcepts } from '../model/weekly_records_api_mapper';

export const useWeeklyRecords = (studyId: string | undefined, week: number | undefined) =>
  useQuery({
    enabled: Boolean(studyId) && week !== undefined && week >= 1,
    queryFn: () =>
      getWeeklyRecordNodes(studyId as string, week as number).then(mapWeeklyRecordConcepts),
    queryKey: ['weekly-records', studyId, week],
  });
