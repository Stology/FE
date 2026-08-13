import { useQuery } from '@tanstack/react-query';

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

interface GetStudiesResponse {
  studies: StudyFromApi[];
}

interface UseMyStudiesResult {
  studies: Study[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const MILLISECONDS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

function calculateCurrentWeek(startDate: string, now = new Date()): number {
  const startedAt = new Date(startDate);

  if (Number.isNaN(startedAt.getTime()) || startedAt.getTime() > now.getTime()) {
    return 0;
  }

  return Math.floor((now.getTime() - startedAt.getTime()) / MILLISECONDS_PER_WEEK) + 1;
}

function mapStudy(study: StudyFromApi, status: Study['status']): Study {
  return {
    id: String(study.studyId),
    name: study.name,
    currentWeek: calculateCurrentWeek(study.startDate),
    isNew: study.isNew,
    memberCount: 0,
    members: [],
    startedAt: study.startDate,
    status,
  };
}

async function getMyStudies(signal: AbortSignal): Promise<Study[]> {
  const [activeResponse, closedResponse] = await Promise.all([
    httpClient.get<ApiResponse<GetStudiesResponse>>('/api/user/me/study', {
      params: { status: 'active' },
      signal,
    }),
    httpClient.get<ApiResponse<GetStudiesResponse>>('/api/user/me/study', {
      params: { status: 'closed' },
      signal,
    }),
  ]);

  const activeStudies = activeResponse.data?.result?.studies ?? [];
  const closedStudies = closedResponse.data?.result?.studies ?? [];

  return [
    ...activeStudies.map((study) => mapStudy(study, 'active')),
    ...closedStudies.map((study) => mapStudy(study, 'ended')),
  ];
}

export function useMyStudies(): UseMyStudiesResult {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['myStudies'],
    queryFn: ({ signal }) => getMyStudies(signal),
  });

  function refetchStudies() {
    void refetch();
  }

  return { error, isLoading, studies: data ?? [], refetch: refetchStudies };
}
