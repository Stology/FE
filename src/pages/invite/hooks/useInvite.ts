import { useEffect, useState } from 'react';

import { getMockStudyById } from '@/shared/mocks/studies';
import type { Study } from '@/shared/types/stology';

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
        // API 연동 전 임시로 토큰 검증 API 호출 모방 (네트워크 지연 모방)
        await new Promise((resolve) => setTimeout(resolve, 500));

        // 성공을 허용할 토큰 화이트리스트 (INV001-0100 피드백 반영)
        const allowedTokens = ['valid-token', 'fail-token'];

        if (!allowedTokens.includes(token)) {
          throw new Error('invalid-token');
        }

        const mockStudy = getMockStudyById('spring-study');
        if (!mockStudy) {
          throw new Error('not-found');
        }

        setStudy(mockStudy);
        setError(null);
      } catch (err: unknown) {
        if ((err as { name?: string }).name !== 'CanceledError') {
          const allowedTokens = ['valid-token', 'fail-token'];
          if (!allowedTokens.includes(token)) {
            setError(new Error('만료되었거나 유효하지 않은 초대 토큰입니다.'));
          } else {
            setError(new Error('초대된 스터디 정보를 찾을 수 없습니다.'));
          }
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

      // API 연동 전 임시로 토큰 검증 API 호출 모방 (네트워크 지연 모방)
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (token === 'fail-token') {
        throw new Error('스터디 인원이 가득 찼거나 만료되었습니다.');
      }
      // 실제 통신 부분 주석 처리 (SPA fallback 방지)
      // await httpClient.post(`/api/invites/${token}/accept`);

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
