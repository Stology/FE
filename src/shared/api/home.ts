import { httpClient } from './http_client';
import type { ApiResponse } from './types';

export interface MyTodoRes {
  reviewCount: number;
  reUploadCount: number;
  questionCount: number;
  answerCount: number;
  studyCount: number;
}

export interface PageInfoString {
  nextCursor: string;
  size: number;
  hasNext: boolean;
}

export interface PageInfoLong {
  nextCursor: number;
  size: number;
  hasNext: boolean;
}

export interface TeamActivityInfo {
  activityType: 'NODE' | 'ANSWER';
  studyId: number;
  studyName: string;
  targetId: number;
  event: string;
  occurredAt: string;
}

export interface TeamActivityRes {
  pageInfo: PageInfoString;
  activities: TeamActivityInfo[];
}

export interface QuestionInfo {
  checked: boolean;
  studyId: number;
  questionId: number;
  questionTitle: string;
  studyName: string;
  writerName: string;
  createdAt: string;
}

export interface QuestionDetailRes {
  pageInfo: PageInfoLong;
  questions: QuestionInfo[];
}

export interface AnswerInfo {
  checked: boolean;
  studyId: number;
  questionId: number;
  answerId: number;
  questionTitle: string;
  studyName: string;
  writerName: string;
  createdAt: string;
}

export interface AnswerDetailRes {
  pageInfo: PageInfoLong;
  answers: AnswerInfo[];
}

export interface MaterialInfo {
  studyMaterialId: number;
  studyId: number;
  dataState: 'READY' | 'NEEDREVIEW' | 'EXTRACTIONFAILED' | 'EXTRACTING';
  dataTitle: string;
  studyName: string;
  week: number;
  uploaderName: string;
  uploadedDate: string;
}

export interface MaterialDetailRes {
  pageInfo: PageInfoLong;
  materials: MaterialInfo[];
}

export interface ReportInfo {
  studyId: number;
  studyName: string;
  reportId: number;
  reportWeek: number;
  createdAt: string;
  generated: boolean;
}

export interface ReportDetailRes {
  pageInfo: PageInfoLong;
  reports: ReportInfo[];
}

export const homeApi = {
  getMyTodos: async (signal?: AbortSignal): Promise<MyTodoRes> => {
    const res = await httpClient.get<ApiResponse<MyTodoRes>>('/api/home/todo/me', { signal });
    return res.data.result;
  },

  getTeamTodos: async (
    studyId: number,
    cursor?: string,
    signal?: AbortSignal,
  ): Promise<TeamActivityRes> => {
    const params = cursor ? { cursor } : {};
    const res = await httpClient.get<ApiResponse<TeamActivityRes>>(
      `/api/home/studies/${studyId}/actives`,
      { params, signal },
    );
    return res.data.result;
  },

  getQuestions: async (cursor?: number, signal?: AbortSignal): Promise<QuestionDetailRes> => {
    const params = cursor ? { cursor } : {};
    const res = await httpClient.get<ApiResponse<QuestionDetailRes>>('/api/home/questions', {
      params,
      signal,
    });
    return res.data.result;
  },

  getAnswers: async (cursor?: number, signal?: AbortSignal): Promise<AnswerDetailRes> => {
    const params = cursor ? { cursor } : {};
    const res = await httpClient.get<ApiResponse<AnswerDetailRes>>('/api/home/answers', {
      params,
      signal,
    });
    return res.data.result;
  },

  getMaterials: async (cursor?: number, signal?: AbortSignal): Promise<MaterialDetailRes> => {
    const params = cursor ? { cursor } : {};
    const res = await httpClient.get<ApiResponse<MaterialDetailRes>>('/api/home/materials', {
      params,
      signal,
    });
    return res.data.result;
  },

  getReports: async (cursor?: number, signal?: AbortSignal): Promise<ReportDetailRes> => {
    const params = cursor ? { cursor } : {};
    const res = await httpClient.get<ApiResponse<ReportDetailRes>>('/api/home/reports', {
      params,
      signal,
    });
    return res.data.result;
  },
};
