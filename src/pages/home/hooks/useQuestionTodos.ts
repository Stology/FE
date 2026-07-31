import { useState, useCallback } from 'react';

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

const initialMockData: QuestionTodoItem[] = [
  {
    id: 'q1',
    status: '새 질문',
    title: 'Spring Bean 생명주기는?',
    study: '백엔드 마스터',
    author: '김민준',
    createdAt: '07.16 14:32',
    action: '질문 보기',
    isRead: false,
    to: '/studies/backend-master/questions/q1',
  },
  {
    id: 'q2',
    status: '새 답글',
    title: '전파 정책 차이가 궁금해요',
    study: '백엔드 마스터',
    author: '이서연',
    createdAt: '07.16 13:20',
    action: '답글 보기',
    isRead: false,
    to: '/studies/backend-master/questions/q2',
  },
  {
    id: 'q3',
    status: '새 답글',
    title: '전파 정책 차이가 궁금해요',
    study: '백엔드 마스터',
    author: '박도윤',
    createdAt: '07.16 12:56',
    action: '답글 보기',
    isRead: false,
    to: '/studies/backend-master/questions/q2',
  },
  {
    id: 'q4',
    status: '읽음',
    title: '격리 수준은 언제 사용하나요?',
    study: 'CS 스터디',
    author: '김민준',
    createdAt: '07.15 18:10',
    action: '질문 보기',
    isRead: true,
    to: '/studies/cs-study/questions/q4',
  },
];

export const useQuestionTodos = () => {
  const [items, setItems] = useState<QuestionTodoItem[]>(initialMockData);
  const [filter, setFilter] = useState<'전체' | '새 질문' | '새 답글'>('전체');

  // 필터에 따른 목록 반환
  const filteredItems = items.filter((item) => {
    if (filter === '전체') return true;
    return item.status === filter;
  });

  // 카운트 계산
  const totalCount = items.length;
  const newQuestionCount = items.filter((i) => i.status === '새 질문').length;
  const newReplyCount = items.filter((i) => i.status === '새 답글').length;

  // 읽음 처리: 같은 'to'(동일 질문)를 가진 알림을 모두 읽음 처리
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
  };
};
