import { useEffect, useState } from 'react';

import { httpClient } from '@/shared/api/http_client';
import { mockMyTodo, type MyTodoItem } from '../mocks';

interface UseMyTodoResult {
  items: MyTodoItem[];
  isLoading: boolean;
  error: Error | null;
}

export const useMyTodo = (): UseMyTodoResult => {
  const [items, setItems] = useState<MyTodoItem[]>(mockMyTodo);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadTodo = async () => {
      try {
        setIsLoading(true);
        const res = await httpClient.get<MyTodoItem[]>('/api/home/todo', {
          signal: controller.signal,
        });

        setItems(Array.isArray(res.data) ? res.data : mockMyTodo);
        setError(null);
      } catch (err: unknown) {
        if ((err as { name?: string }).name !== 'CanceledError') {
          setItems(mockMyTodo);
          setError(err instanceof Error ? err : new Error('할 일 목록을 불러오지 못했습니다.'));
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadTodo();

    return () => {
      controller.abort();
    };
  }, []);

  return { error, isLoading, items };
};
