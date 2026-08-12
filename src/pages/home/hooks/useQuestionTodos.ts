import { useCallback, useEffect, useRef, useState } from 'react';
import { httpClient } from '@/shared/api/http_client';
import type { ApiResponse } from '@/shared/api/types';

export type QuestionTodoStatus = '새 질문' | '새 답글' | '읽음';
export type QuestionTodoAction = '질문 보기' | '답글 보기';

export interface QuestionTodoItem {
  id: string;
  status: QuestionTodoStatus;
  title: string;
  study: string;
  author: string;
  createdAt: string;
  action: QuestionTodoAction;
  isRead: boolean;
  to: string; // 이동할 경로
}

interface QuestionInfo {
  checked: boolean;
  studyId: number;
  questionId: number;
  questionTitle: string;
  studyName: string;
  writerName: string;
  createdAt: string;
}

interface AnswerInfo {
  checked: boolean;
  studyId: number;
  questionId: number;
  answerId: number;
  questionTitle: string;
  studyName: string;
  writerName: string;
  createdAt: string;
}

interface QuestionDetailRes {
  pageInfo: { totalElements: number; hasNext: boolean };
  questions: QuestionInfo[];
}

interface AnswerDetailRes {
  pageInfo: { totalElements: number; hasNext: boolean };
  answers: AnswerInfo[];
}

export const useQuestionTodos = () => {
  const [items, setItems] = useState<QuestionTodoItem[]>([]);
  const [filter, setFilter] = useState<'전체' | '새 질문' | '새 답글'>('전체');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadItems = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setIsLoading(true);
      const [questionsRes, answersRes] = await Promise.all([
        httpClient.get<ApiResponse<QuestionDetailRes>>('/api/home/questions', {
          signal: controller.signal,
        }),
        httpClient.get<ApiResponse<AnswerDetailRes>>('/api/home/answers', {
          signal: controller.signal,
        }),
      ]);

      const qItems = questionsRes.data?.result?.questions ?? [];
      const aItems = answersRes.data?.result?.answers ?? [];

      const formatDateTime = (dateStr: string) => {
        const dateObj = new Date(dateStr);
        if (isNaN(dateObj.getTime())) return '';
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const hh = String(dateObj.getHours()).padStart(2, '0');
        const min = String(dateObj.getMinutes()).padStart(2, '0');
        return `${mm}.${dd} ${hh}:${min}`;
      };

      const mappedQuestions: QuestionTodoItem[] = qItems.map((q) => ({
        id: `q-${q.questionId}`,
        status: q.checked ? '읽음' : '새 질문',
        title: q.questionTitle,
        study: q.studyName,
        author: q.writerName,
        createdAt: formatDateTime(q.createdAt),
        action: '질문 보기',
        isRead: q.checked,
        to: `/studies/${q.studyId}/questions/${q.questionId}`,
      }));

      const mappedAnswers: QuestionTodoItem[] = aItems.map((a) => ({
        id: `a-${a.answerId}`,
        status: a.checked ? '읽음' : '새 답글',
        title: a.questionTitle,
        study: a.studyName,
        author: a.writerName,
        createdAt: formatDateTime(a.createdAt),
        action: '답글 보기',
        isRead: a.checked,
        to: `/studies/${a.studyId}/questions/${a.questionId}`,
      }));

      // 합치고 최신순 정렬 (원한다면 날짜 비교)
      const combined = [...mappedQuestions, ...mappedAnswers];
      setItems(combined);
      setError(null);
    } catch (err: unknown) {
      if ((err as { name?: string }).name !== 'CanceledError') {
        setItems([]);
        setError(err instanceof Error ? err : new Error('질문/답글 목록을 불러오지 못했습니다.'));
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadItems();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadItems]);

  // 필터에 따른 목록 반환
  const filteredItems = items.filter((item) => {
    if (filter === '전체') return true;
    return item.status === filter;
  });

  // 카운트 계산
  const totalCount = items.length;
  const newQuestionCount = items.filter((i) => i.status === '새 질문').length;
  const newReplyCount = items.filter((i) => i.status === '새 답글').length;

  // 읽음 처리 (UI 상의 낙관적 업데이트)
  const markAsRead = useCallback((targetTo: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.to === targetTo && !item.isRead) {
          return { ...item, status: '읽음', isRead: true };
        }
        return item;
      }),
    );
  }, []);

  return {
    items: filteredItems,
    filter,
    setFilter,
    counts: {
      total: totalCount,
      newQuestion: newQuestionCount,
      newReply: newReplyCount,
    },
    markAsRead,
    isLoading,
    error,
    refetch: loadItems,
  };
};
