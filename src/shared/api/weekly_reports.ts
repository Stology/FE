import { httpClient } from './http_client';
import type { ApiResponse } from './types';

export interface WeeklyReportCoreNodeRes {
  materialCount: number;
  nodeName: string;
  state: string;
}

export interface WeeklyReportRecommendationRes {
  badge: string;
  nodeName: string;
  reason: string;
}

export interface WeeklyReportMemberActivityRes {
  aiFeedback: string;
  materialUploadCount: number;
  memberName: string;
  questionCount: number;
}

export interface WeeklyReportRes {
  aiReviewContent: string | null;
  currentWeek: number;
  memberActivityStatisticsList: WeeklyReportMemberActivityRes[] | null;
  newActiveNodeCount: number;
  newActiveNodePercentage: number;
  recommendedNodeList: WeeklyReportRecommendationRes[] | null;
  reinforcedNodeCount: number;
  reinforcedNodePercentage: number;
  reportId: number;
  totalNodeCount: number;
  totalWeeks: number;
  weeklyCoreNodeList: WeeklyReportCoreNodeRes[] | null;
}

export async function getWeeklyReport(studyId: string, week?: number): Promise<WeeklyReportRes> {
  const { data } = await httpClient.get<ApiResponse<WeeklyReportRes>>(
    `/api/study/${studyId}/report/all`,
    { params: week === undefined ? undefined : { week } },
  );

  return data.result;
}
