import { httpClient } from './http_client';
import type { ApiResponse } from './types';

export interface QuestionSummaryRes {
  answerCount: number;
  authorName: string;
  createdAt: string;
  hasImage: boolean;
  isMine: boolean;
  questionId: number;
  title: string;
}

export interface QuestionListRes {
  currentPage: number;
  isFirst: boolean;
  isLast: boolean;
  listSize: number;
  questionList: QuestionSummaryRes[];
  studyEnded: boolean;
  totalElements: number;
  totalPage: number;
}

export interface QuestionImageRes {
  imageId: number;
  imageUrl: string;
}

export interface QuestionAnswerRes {
  answerId: number;
  authorName: string;
  content: string;
  createdAt: string;
  images: QuestionImageRes[] | null;
  isMine: boolean;
}

export interface QuestionDetailRes {
  answerList: QuestionAnswerRes[] | null;
  authorName: string;
  content: string;
  createdAt: string;
  images: QuestionImageRes[] | null;
  isMine: boolean;
  questionId: number;
  studyEnded: boolean;
  title: string;
}

export async function getQuestions(
  studyId: string,
  page: number,
  size: number,
): Promise<QuestionListRes> {
  const { data } = await httpClient.get<ApiResponse<QuestionListRes>>(
    `/api/study/${studyId}/question`,
    { params: { page, size } },
  );

  return data.result;
}

export async function getQuestionDetail(
  studyId: string,
  questionId: string,
): Promise<QuestionDetailRes> {
  const { data } = await httpClient.get<ApiResponse<QuestionDetailRes>>(
    `/api/study/${studyId}/question/${questionId}`,
  );

  return data.result;
}
