import { useEffect, useState } from 'react';

import { httpClient } from '@/shared/api/http_client';
import { mockStudies } from '@/shared/mocks/studies';
import type { Study } from '@/shared/types/stology';

interface UseMyStudiesResult {
  studies: Study[];
  isLoading: boolean;
  error: Error | null;
}

const fallbackStudies = mockStudies.filter((study) => study.status === 'active');

export const useMyStudies = (): UseMyStudiesResult => {
  const [studies, setStudies] = useState<Study[]>(fallbackStudies);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadStudies = async () => {
      try {
        setIsLoading(true);
        const res = await httpClient.get<Study[]>('/api/studies', {
          params: { status: 'active' },
          signal: controller.signal,
        });

        const nextStudies = Array.isArray(res.data) ? res.data : fallbackStudies;
        setStudies(nextStudies.filter((study) => study.status === 'active'));
        setError(null);
      } catch (err: unknown) {
        if ((err as { name?: string }).name !== 'CanceledError') {
          setStudies(fallbackStudies);
          setError(err instanceof Error ? err : new Error('스터디 목록을 불러오지 못했습니다.'));
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadStudies();

    return () => {
      controller.abort();
    };
  }, []);

  return { error, isLoading, studies };
};
