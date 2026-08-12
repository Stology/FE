import { httpClient } from '@/shared/api/http_client';
import type { ApiResponse } from '@/shared/api/types';

export interface GetStudyDetailRes {
  studyId: number;
  name: string;
  currentWeek: number;
  isActive: boolean;
  isLeader: boolean;
}

export interface GetReviewerCountRes {
  reviewerCount: number;
  maxReviewerCount: number;
}

export interface UpdateStudyReq {
  name: string;
  description: string;
  startDate: string;
}

export interface UpdateReviewerCountReq {
  reviewerCount: number;
}

export interface GetInvitationTokenRes {
  studyId: number;
  name: string;
  leader: string;
  memberCount: number;
  token: string;
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

  updateStudy: async (studyId: number, data: UpdateStudyReq): Promise<void> => {
    await httpClient.patch<ApiResponse<void>>(`/api/study/${studyId}`, data);
  },

  updateReviewerCount: async (studyId: number, data: UpdateReviewerCountReq): Promise<void> => {
    await httpClient.patch<ApiResponse<void>>(`/api/study/${studyId}/reviewer-count`, data);
  },

  closeStudy: async (studyId: number): Promise<void> => {
    await httpClient.patch<ApiResponse<void>>(`/api/study/${studyId}/close`);
  },

  getInvitationToken: async (studyId: number): Promise<GetInvitationTokenRes> => {
    const res = await httpClient.post<ApiResponse<GetInvitationTokenRes>>(
      `/api/study/${studyId}/invitation`,
    );
    return res.data.result;
  },
};
