import { useEffect, useState } from 'react';

import { httpClient } from '@/shared/api/http_client';
import type { Study } from '@/shared/types/stology';

interface UseMyStudiesResult {
  studies: Study[];
  isLoading: boolean;
  error: Error | null;
}

export const useMyStudies = (): UseMyStudiesResult => {
  const [studies, setStudies] = useState<Study[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    httpClient
      .get<Study[]>('/api/studies', {
        params: { status: 'active' },
        signal: controller.signal,
      })
      .then((res) => {
        setStudies(res.data);
        setError(null);
      })
      .catch((err: unknown) => {
        if ((err as { name?: string }).name !== 'CanceledError') {
          setError(err instanceof Error ? err : new Error('스터디 목록을 불러오지 못했습니다.'));
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, []);

  return { error, isLoading, studies };
};
