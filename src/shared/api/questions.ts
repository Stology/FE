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

export interface QuestionMutationReq {
  content: string;
  images: File[];
  title: string;
}

export interface AnswerMutationReq {
  content: string;
  images: File[];
}

interface WriteQuestionResult {
  questionId: number;
}

interface WriteAnswerResult {
  answerId: number;
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

export async function createQuestion(
  studyId: string,
  request: QuestionMutationReq,
): Promise<WriteQuestionResult> {
  const { data } = await httpClient.post<ApiResponse<WriteQuestionResult>>(
    `/api/study/${studyId}/question`,
    createQuestionFormData(request),
  );

  return data.result;
}

export async function updateQuestion(
  studyId: string,
  questionId: string,
  request: QuestionMutationReq,
): Promise<WriteQuestionResult> {
  const { data } = await httpClient.patch<ApiResponse<WriteQuestionResult>>(
    `/api/study/${studyId}/question/${questionId}`,
    createQuestionFormData(request),
  );

  return data.result;
}

export async function deleteQuestion(studyId: string, questionId: string): Promise<void> {
  await httpClient.delete<ApiResponse<void>>(`/api/study/${studyId}/question/${questionId}`);
}

export async function createAnswer(
  studyId: string,
  questionId: string,
  request: AnswerMutationReq,
): Promise<WriteAnswerResult> {
  const { data } = await httpClient.post<ApiResponse<WriteAnswerResult>>(
    `/api/study/${studyId}/question/${questionId}/answer`,
    createAnswerFormData(request),
  );

  return data.result;
}

export async function updateAnswer(
  studyId: string,
  questionId: string,
  answerId: string,
  request: AnswerMutationReq,
): Promise<WriteAnswerResult> {
  const { data } = await httpClient.patch<ApiResponse<WriteAnswerResult>>(
    `/api/study/${studyId}/question/${questionId}/answer/${answerId}`,
    createAnswerFormData(request),
  );

  return data.result;
}

export async function deleteAnswer(
  studyId: string,
  questionId: string,
  answerId: string,
): Promise<void> {
  await httpClient.delete<ApiResponse<void>>(
    `/api/study/${studyId}/question/${questionId}/answer/${answerId}`,
  );
}

function createQuestionFormData(request: QuestionMutationReq): FormData {
  const formData = createContentFormData(request.content, request.images);
  formData.append('title', request.title);
  return formData;
}

function createAnswerFormData(request: AnswerMutationReq): FormData {
  return createContentFormData(request.content, request.images);
}

function createContentFormData(content: string, images: File[]): FormData {
  const formData = new FormData();
  formData.append('content', content);
  images.forEach((image) => formData.append('images', image));
  return formData;
}
