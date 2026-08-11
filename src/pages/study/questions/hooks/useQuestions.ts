import { useQueries, useQuery } from '@tanstack/react-query';

import { getQuestionDetail, getQuestions } from '@/shared/api/questions';

import { mapQuestionDetail, mapQuestionList } from '../model/question_api_mapper';

export const questionKeys = {
  all: (studyId: string | undefined) => ['questions', studyId] as const,
  detail: (studyId: string | undefined, questionId: string) =>
    [...questionKeys.all(studyId), 'detail', questionId] as const,
  list: (studyId: string | undefined, page: number, size: number) =>
    [...questionKeys.all(studyId), 'list', page, size] as const,
};

export const useQuestions = (studyId: string | undefined, page: number, size: number) =>
  useQuery({
    enabled: Boolean(studyId),
    queryFn: () => getQuestions(studyId as string, page, size).then(mapQuestionList),
    queryKey: questionKeys.list(studyId, page, size),
  });

export const useQuestionDetails = (studyId: string | undefined, questionIds: string[]) =>
  useQueries({
    queries: questionIds.map((questionId) => ({
      enabled: Boolean(studyId),
      queryFn: () => getQuestionDetail(studyId as string, questionId).then(mapQuestionDetail),
      queryKey: questionKeys.detail(studyId, questionId),
    })),
  });
