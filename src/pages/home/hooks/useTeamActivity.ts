import { useEffect, useState } from 'react';

import { httpClient } from '@/shared/api/http_client';
import type { TeamActivityItem } from '../mocks';

interface UseTeamActivityResult {
  items: TeamActivityItem[];
  isLoading: boolean;
  error: Error | null;
}

export const useTeamActivity = (studyId?: string): UseTeamActivityResult => {
  const [items, setItems] = useState<TeamActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    httpClient
      .get<TeamActivityItem[]>('/api/home/activity', {
        params: studyId && studyId !== 'all' ? { studyId } : undefined,
        signal: controller.signal,
      })
      .then((res) => {
        setItems(res.data);
        setError(null);
      })
      .catch((err: unknown) => {
        if ((err as { name?: string }).name !== 'CanceledError') {
          setError(err instanceof Error ? err : new Error('팀 활동을 불러오지 못했습니다.'));
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [studyId]);

  return { error, isLoading, items };
};
