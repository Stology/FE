import { useQuery } from '@tanstack/react-query';

import { getWeeklyReport } from '@/shared/api/weekly_reports';

import { mapWeeklyReport } from '../model/weekly_report_api_mapper';

export const useWeeklyReport = (studyId: string | undefined, week: number | undefined) =>
  useQuery({
    enabled: Boolean(studyId) && (week === undefined || week >= 1),
    queryFn: () => getWeeklyReport(studyId as string, week).then(mapWeeklyReport),
    queryKey: ['weekly-report', studyId, week],
  });
