import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { homeApi } from '@/shared/api/home';
import { useHomeTodoStore } from '../store/useHomeTodoStore';

export type QuestionTodoStatus = '새 질문' | '새 답글' | '읽음';
export type QuestionTodoAction = '질문 보기' | '답글 보기';

export interface QuestionTodoItem {
  id: string;
  status: QuestionTodoStatus;
  title: string;
  study: string;
  author: string;
  createdAt: string;
  rawDate: number;
  action: QuestionTodoAction;
  isRead: boolean;
  to: string;
}

const formatDateTime = (dateStr: string) => {
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return '';
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const hh = String(dateObj.getHours()).padStart(2, '0');
  const min = String(dateObj.getMinutes()).padStart(2, '0');
  return `${mm}.${dd} ${hh}:${min}`;
};

export const useQuestionTodos = () => {
  const [filter, setFilter] = useState<'전체' | '새 질문' | '새 답글'>('전체');
  const { readItemIds, markAsRead } = useHomeTodoStore();

  const questionsQuery = useQuery({
    queryKey: ['home', 'questions'],
    queryFn: ({ signal }) => homeApi.getQuestions(undefined, signal),
  });

  const answersQuery = useQuery({
    queryKey: ['home', 'answers'],
    queryFn: ({ signal }) => homeApi.getAnswers(undefined, signal),
  });

  const isLoading = questionsQuery.isLoading || answersQuery.isLoading;
  const error = questionsQuery.error ?? answersQuery.error;

  const items = useMemo(() => {
    const qItems = questionsQuery.data?.questions ?? [];
    const aItems = answersQuery.data?.answers ?? [];

    const mappedQuestions: QuestionTodoItem[] = qItems.map((q) => {
      const id = `q-${q.questionId}`;
      const isRead = q.checked || readItemIds.includes(id);
      return {
        id,
        status: isRead ? '읽음' : '새 질문',
        title: q.questionTitle,
        study: q.studyName,
        author: q.writerName,
        createdAt: formatDateTime(q.createdAt),
        rawDate: new Date(q.createdAt).getTime(),
        action: '질문 보기',
        isRead,
        to: `/studies/${q.studyId}/questions/${q.questionId}`,
      };
    });

    const mappedAnswers: QuestionTodoItem[] = aItems.map((a) => {
      const id = `a-${a.answerId}`;
      const isRead = a.checked || readItemIds.includes(id);
      return {
        id,
        status: isRead ? '읽음' : '새 답글',
        title: a.questionTitle,
        study: a.studyName,
        author: a.writerName,
        createdAt: formatDateTime(a.createdAt),
        rawDate: new Date(a.createdAt).getTime(),
        action: '답글 보기',
        isRead,
        to: `/studies/${a.studyId}/questions/${a.questionId}`,
      };
    });

    // 원시 타임스탬프 기준 최신순 정렬
    return [...mappedQuestions, ...mappedAnswers].sort((a, b) => b.rawDate - a.rawDate);
  }, [questionsQuery.data, answersQuery.data, readItemIds]);

  const filteredItems = useMemo(() => {
    if (filter === '전체') return items;
    return items.filter((item) => item.status === filter);
  }, [items, filter]);

  const counts = useMemo(
    () => ({
      total: items.length,
      newQuestion: items.filter((i) => i.status === '새 질문').length,
      newReply: items.filter((i) => i.status === '새 답글').length,
    }),
    [items],
  );

  const refetch = () => {
    void questionsQuery.refetch();
    void answersQuery.refetch();
  };

  return {
    items: filteredItems,
    filter,
    setFilter,
    counts,
    markAsRead,
    isLoading,
    error,
    refetch,
  };
};
