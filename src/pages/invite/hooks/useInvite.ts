import { useEffect, useState } from 'react';

import { httpClient } from '@/shared/api/http_client';
import type { ApiResponse } from '@/shared/api/types';
import type { Study } from '@/shared/types/stology';

// 스웨거 GET /api/study/invitation/{token} 응답 형태
interface GetInvitationTokenRes {
  studyId: number;
  name: string;
  leader: string;
  memberCount: number;
}

export const useInvite = (token?: string) => {
  const [study, setStudy] = useState<Study | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<Error | null>(null);

  useEffect(() => {
    if (!token) {
      setError(new Error('유효하지 않은 초대 토큰입니다.'));
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadStudy = async () => {
      try {
        setIsLoading(true);
        const res = await httpClient.get<ApiResponse<GetInvitationTokenRes>>(
          `/api/study/invitation/${token}`,
          { signal: controller.signal },
        );

        const data = res.data.result;
        setStudy({
          id: String(data.studyId),
          name: data.name,
          currentWeek: 0,
          memberCount: data.memberCount,
          startedAt: '',
          status: 'active',
        });
        setError(null);
      } catch (err: unknown) {
        if ((err as { name?: string }).name !== 'CanceledError') {
          setError(new Error('만료되었거나 유효하지 않은 초대 링크입니다.'));
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadStudy();

    return () => {
      controller.abort();
    };
  }, [token]);

  const joinStudy = async () => {
    if (!token) return false;

    try {
      setIsJoining(true);
      await httpClient.post<ApiResponse<void>>(`/api/study/invitation/${token}/accept`);
      setJoinError(null);
      return true;
    } catch (err) {
      setJoinError(err instanceof Error ? err : new Error('스터디 참여에 실패했습니다.'));
      return false;
    } finally {
      setIsJoining(false);
    }
  };

  return { study, isLoading, error, joinStudy, isJoining, joinError };
};
