import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { homeApi } from '@/shared/api/home';
import { type MyTodoItem } from '../mocks';

interface UseMyTodoResult {
  items: MyTodoItem[];
  isLoading: boolean;
  error: Error | null;
  removeItem: (section: string) => void;
}

export const useMyTodo = (): UseMyTodoResult => {
  const [removedSections, setRemovedSections] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = useQuery({
    queryKey: ['myTodos'],
    queryFn: homeApi.getMyTodos,
  });

  const items = useMemo(() => {
    if (!data) return [];

    const mappedItems: MyTodoItem[] = [];

    if (data.reviewCount > 0 || data.reUploadCount > 0) {
      mappedItems.push({
        section: '자료',
        summary: `검토 ${data.reviewCount} · 재업로드 ${data.reUploadCount}`,
        to: '/studies/upload', // ToDo: Need actual route logic if study context is needed
      });
    }

    if (data.questionCount > 0 || data.answerCount > 0) {
      mappedItems.push({
        section: '질문함',
        summary: `질문 ${data.questionCount} · 답글 ${data.answerCount}`,
        to: '/studies/questions', // ToDo: Need actual route logic
      });
    }

    if (data.studyCount > 0) {
      mappedItems.push({
        section: '리포트',
        summary: `${data.studyCount}개 스터디의 최신 리포트`,
        to: '/studies/reports', // ToDo: Need actual route logic
      });
    }

    return mappedItems.filter((item) => !removedSections.has(item.section));
  }, [data, removedSections]);

  const removeItem = (section: string) => {
    setRemovedSections((prev) => {
      const next = new Set(prev);
      next.add(section);
      return next;
    });
  };

  return {
    error:
      error instanceof Error ? error : error ? new Error('알 수 없는 오류가 발생했습니다.') : null,
    isLoading,
    items,
    removeItem,
  };
};
