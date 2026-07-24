import { useEffect, useState } from 'react';

import { httpClient } from '@/shared/api/http_client';
import type { MyTodoItem } from '../mocks';

interface UseMyTodoResult {
  items: MyTodoItem[];
  isLoading: boolean;
  error: Error | null;
}

export const useMyTodo = (): UseMyTodoResult => {
  const [items, setItems] = useState<MyTodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    httpClient
      .get<MyTodoItem[]>('/api/home/todo', { signal: controller.signal })
      .then((res) => {
        setItems(res.data);
        setError(null);
      })
      .catch((err: unknown) => {
        if ((err as { name?: string }).name !== 'CanceledError') {
          setError(err instanceof Error ? err : new Error('할 일 목록을 불러오지 못했습니다.'));
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, []);

  return { error, isLoading, items };
};
