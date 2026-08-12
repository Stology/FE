import { httpClient } from '@/shared/api/http_client';
import type { ApiResponse } from '@/shared/api/types';

export interface GetStudyDetailRes {
  studyId: number;
  name: string;
  currentWeek: number;
  isActive: boolean;
  isLeader: boolean;
  startDate: string;
  members: string[];
}

export interface GetReviewerCountRes {
  reviewerCount: number;
  maxReviewerCount: number;
}

export const studyApi = {
  deleteStudy: async (studyId: number): Promise<void> => {
    await httpClient.delete<ApiResponse<void>>(`/api/study/${studyId}`);
  },

  getStudyDetail: async (studyId: number): Promise<GetStudyDetailRes> => {
    const res = await httpClient.get<ApiResponse<GetStudyDetailRes>>(`/api/study/${studyId}`);
    return res.data.result;
  },

  getReviewerCount: async (studyId: number): Promise<GetReviewerCountRes> => {
    const res = await httpClient.get<ApiResponse<GetReviewerCountRes>>(
      `/api/study/${studyId}/reviewer-count`,
    );
    return res.data.result;
  },
};
