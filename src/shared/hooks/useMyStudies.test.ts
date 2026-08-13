// @vitest-environment jsdom

import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { httpClient } from '@/shared/api/http_client';

import { useMyStudies } from './useMyStudies';

vi.mock('@/shared/api/http_client', () => ({
  httpClient: {
    get: vi.fn(),
  },
}));

const mockedGet = vi.mocked(httpClient.get);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

interface TestWrapperProps {
  children: ReactNode;
}

const TestWrapper = ({ children }: TestWrapperProps) =>
  createElement(QueryClientProvider, { client: queryClient }, children);

function createStudiesResponse(
  studies: Array<{ studyId: number; name: string; startDate: string; isNew: boolean }>,
) {
  return {
    data: {
      code: 'STUDY200_2',
      errorDetail: null,
      message: '스터디 목록 조회에 성공했습니다.',
      result: { studies },
      success: true,
    },
  };
}

describe('useMyStudies', () => {
  beforeEach(() => {
    queryClient.clear();
    mockedGet.mockReset();
  });

  it('진행 및 종료 스터디를 각각 조회해 상태와 NEW 여부를 매핑한다', async () => {
    mockedGet.mockImplementation((_url, config) => {
      if (config?.params?.status === 'active') {
        return Promise.resolve(
          createStudiesResponse([
            { studyId: 1, name: '진행 스터디', startDate: '2026-08-13T00:00:00', isNew: true },
          ]),
        );
      }

      return Promise.resolve(
        createStudiesResponse([
          { studyId: 2, name: '종료 스터디', startDate: '2026-07-01T00:00:00', isNew: false },
        ]),
      );
    });

    const { result } = renderHook(() => useMyStudies(), { wrapper: TestWrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockedGet).toHaveBeenCalledWith(
      '/api/user/me/study',
      expect.objectContaining({ params: { status: 'active' } }),
    );
    expect(mockedGet).toHaveBeenCalledWith(
      '/api/user/me/study',
      expect.objectContaining({ params: { status: 'closed' } }),
    );
    expect(result.current.studies).toEqual([
      expect.objectContaining({ id: '1', isNew: true, status: 'active' }),
      expect.objectContaining({ id: '2', isNew: false, status: 'ended' }),
    ]);
  });

  it('목록 중 하나라도 실패하면 오류 상태를 표시한다', async () => {
    mockedGet.mockRejectedValue(new Error('목록 조회 실패'));

    const { result } = renderHook(() => useMyStudies(), { wrapper: TestWrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.studies).toEqual([]);
    expect(result.current.error).toEqual(new Error('목록 조회 실패'));
  });
});
