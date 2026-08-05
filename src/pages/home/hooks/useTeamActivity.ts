import { useEffect, useState } from 'react';

import { httpClient } from '@/shared/api/http_client';
import { mockTeamActivity, type TeamActivityItem } from '../mocks';

interface UseTeamActivityResult {
  items: TeamActivityItem[];
  isLoading: boolean;
  error: Error | null;
  removeItem: (id: string) => void;
}

export const useTeamActivity = (studyId?: string): UseTeamActivityResult => {
  const [items, setItems] = useState<TeamActivityItem[]>(mockTeamActivity);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadActivity = async () => {
      try {
        setIsLoading(true);
        const res = await httpClient.get<TeamActivityItem[]>('/api/home/activity', {
          params: studyId && studyId !== 'all' ? { studyId } : undefined,
          signal: controller.signal,
        });

        setItems(Array.isArray(res.data) ? res.data : mockTeamActivity);
        setError(null);
      } catch (err: unknown) {
        if ((err as { name?: string }).name !== 'CanceledError') {
          setItems(mockTeamActivity);
          setError(err instanceof Error ? err : new Error('팀 활동을 불러오지 못했습니다.'));
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadActivity();

    return () => {
      controller.abort();
    };
  }, [studyId]);

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return { error, isLoading, items, removeItem };
};
