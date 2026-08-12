import { useCallback, useEffect, useRef, useState } from 'react';

import { httpClient } from '@/shared/api/http_client';
import type { ApiResponse } from '@/shared/api/types';
import type { Study } from '@/shared/types/stology';

// Swagger /api/user/me/study 응답 형태
interface StudyFromApi {
  studyId: number;
  name: string;
  startDate: string;
  isNew: boolean;
}

interface GetStudyRes {
  studies: StudyFromApi[];
}

interface UseMyStudiesResult {
  studies: Study[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useMyStudies = (): UseMyStudiesResult => {
  const [studies, setStudies] = useState<Study[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadStudies = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setIsLoading(true);
      const res = await httpClient.get<ApiResponse<GetStudyRes>>('/api/user/me/study', {
        params: { status: 'active' },
        signal: controller.signal,
      });

      const apiStudies = res.data?.result?.studies ?? [];
      const mapped: Study[] = apiStudies.map((s) => ({
        id: String(s.studyId),
        name: s.name,
        currentWeek: 0,
        memberCount: 0,
        members: [],
        startedAt: s.startDate,
        status: 'active' as const,
      }));
      setStudies(mapped);
      setError(null);
    } catch (err: unknown) {
      if ((err as { name?: string }).name !== 'CanceledError') {
        setStudies([]);
        setError(err instanceof Error ? err : new Error('스터디 목록을 불러오지 못했습니다.'));
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadStudies();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadStudies]);

  return { error, isLoading, studies, refetch: loadStudies };
};
