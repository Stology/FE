import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createAnswer,
  createQuestion,
  deleteAnswer,
  deleteQuestion,
  updateAnswer,
  updateQuestion,
  type AnswerMutationReq,
  type QuestionMutationReq,
} from '@/shared/api/questions';
import { toast } from '@/shared/hooks/useToast';

import { questionKeys } from './useQuestions';

interface QuestionMutationInput extends QuestionMutationReq {
  questionId: string;
}

interface CreateAnswerMutationInput extends AnswerMutationReq {
  questionId: string;
}

interface ExistingAnswerMutationInput extends CreateAnswerMutationInput {
  answerId: string;
}

export function useQuestionMutations(studyId: string | undefined) {
  const queryClient = useQueryClient();

  function invalidateQuestions() {
    return queryClient.invalidateQueries({ queryKey: questionKeys.all(studyId) });
  }

  const createQuestionMutation = useMutation({
    mutationFn: (request: QuestionMutationReq) => createQuestion(studyId as string, request),
    onError: () => toast.error('질문 작성에 실패했습니다.'),
    onSuccess: () => {
      toast.success('질문을 작성했습니다.');
      return invalidateQuestions();
    },
  });
  const updateQuestionMutation = useMutation({
    mutationFn: ({ questionId, ...request }: QuestionMutationInput) =>
      updateQuestion(studyId as string, questionId, request),
    onError: () => toast.error('질문 수정에 실패했습니다.'),
    onSuccess: () => {
      toast.success('질문을 수정했습니다.');
      return invalidateQuestions();
    },
  });
  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId: string) => deleteQuestion(studyId as string, questionId),
    onError: () => toast.error('질문 삭제에 실패했습니다.'),
    onSuccess: () => {
      toast.success('질문을 삭제했습니다.');
      return invalidateQuestions();
    },
  });
  const createAnswerMutation = useMutation({
    mutationFn: ({ questionId, ...request }: CreateAnswerMutationInput) =>
      createAnswer(studyId as string, questionId, request),
    onError: () => toast.error('답글 작성에 실패했습니다.'),
    onSuccess: () => {
      toast.success('답글을 작성했습니다.');
      return invalidateQuestions();
    },
  });
  const updateAnswerMutation = useMutation({
    mutationFn: ({ answerId, questionId, ...request }: ExistingAnswerMutationInput) =>
      updateAnswer(studyId as string, questionId, answerId, request),
    onError: () => toast.error('답글 수정에 실패했습니다.'),
    onSuccess: () => {
      toast.success('답글을 수정했습니다.');
      return invalidateQuestions();
    },
  });
  const deleteAnswerMutation = useMutation({
    mutationFn: ({
      answerId,
      questionId,
    }: Pick<ExistingAnswerMutationInput, 'answerId' | 'questionId'>) =>
      deleteAnswer(studyId as string, questionId, answerId),
    onError: () => toast.error('답글 삭제에 실패했습니다.'),
    onSuccess: () => {
      toast.success('답글을 삭제했습니다.');
      return invalidateQuestions();
    },
  });

  return {
    createAnswerMutation,
    createQuestionMutation,
    deleteAnswerMutation,
    deleteQuestionMutation,
    updateAnswerMutation,
    updateQuestionMutation,
  };
}
