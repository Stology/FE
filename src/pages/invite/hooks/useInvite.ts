import { useEffect, useState } from 'react';

import { httpClient } from '@/shared/api/http_client';
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

    const loadStudy = async () => {
      try {
        setIsLoading(true);
        // API 연동 전 임시로 토큰 검증 API 호출 모방
        const res = await httpClient.get<Study>(`/api/invites/${token}`);
        setStudy(res.data);
        setError(null);
      } catch {
        if (token === 'invalid-token') {
          setError(new Error('만료되었거나 유효하지 않은 초대 토큰입니다.'));
        } else {
          // 토큰이 유효한 경우 spring-study 목데이터 반환 모방
          const mockStudy = getMockStudyById('spring-study');
          if (mockStudy) {
            setStudy(mockStudy);
            setError(null);
          } else {
            setError(new Error('초대된 스터디 정보를 찾을 수 없습니다.'));
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadStudy();
  }, [token]);

  const joinStudy = async () => {
    if (!token) return false;

    try {
      setIsJoining(true);
      await httpClient.post(`/api/invites/${token}/accept`);
      setJoinError(null);
      return true;
    } catch {
      // API 연동 전 임시 성공 모방
      setJoinError(null);
      return true;
    } finally {
      setIsJoining(false);
    }
  };

  return { study, isLoading, error, joinStudy, isJoining, joinError };
};
