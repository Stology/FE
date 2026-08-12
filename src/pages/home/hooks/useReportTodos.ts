import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { httpClient } from '@/shared/api/http_client';
import type { ApiResponse } from '@/shared/api/types';

export interface ReportTodoItem {
  id: string;
  status: '생성 완료' | '생성 전';
  study: {
    id: string;
    name: string;
  };
  reportName: string;
  createdAt: string;
}

interface ReportInfo {
  studyId: number;
  studyName: string;
  reportId: number;
  reportWeek: number;
  createdAt: string;
  generated: boolean;
}

interface ReportDetailRes {
  pageInfo: {
    totalElements: number;
    hasNext: boolean;
  };
  reports: ReportInfo[];
}

export const useReportTodos = () => {
  const [items, setItems] = useState<ReportTodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadItems = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setIsLoading(true);
      const res = await httpClient.get<ApiResponse<ReportDetailRes>>('/api/home/reports', {
        signal: controller.signal,
      });

      const apiItems = res.data?.result?.reports ?? [];

      const mapped: ReportTodoItem[] = apiItems.map((r) => {
        const dateObj = new Date(r.createdAt);
        const formattedDate = !isNaN(dateObj.getTime())
          ? `${String(dateObj.getMonth() + 1).padStart(2, '0')}.${String(dateObj.getDate()).padStart(2, '0')}`
          : '-';

        return {
          id: String(r.reportId),
          status: r.generated ? '생성 완료' : '생성 전',
          study: {
            id: String(r.studyId),
            name: r.studyName,
          },
          reportName: r.generated ? `${r.reportWeek}주차 커버리지 리포트` : '-',
          createdAt: r.generated ? formattedDate : '-',
        };
      });

      setItems(mapped);
      setError(null);
    } catch (err: unknown) {
      if ((err as { name?: string }).name !== 'CanceledError') {
        setItems([]);
        setError(err instanceof Error ? err : new Error('리포트 목록을 불러오지 못했습니다.'));
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadItems();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadItems]);

  // 생성 완료가 먼저 오고, 생성일 최신순으로 정렬
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.status === '생성 완료' && b.status === '생성 전') return -1;
      if (a.status === '생성 전' && b.status === '생성 완료') return 1;

      // 둘 다 생성 완료면 날짜 최신순
      if (a.status === '생성 완료' && b.status === '생성 완료') {
        // MM.DD 형식 비교 (단순 문자열 역순 비교)
        return b.createdAt.localeCompare(a.createdAt);
      }
      return 0;
    });
  }, [items]);

  const totalCount = items.length;
  const completedCount = items.filter((item) => item.status === '생성 완료').length;

  return {
    items: sortedItems,
    counts: {
      total: totalCount,
      completed: completedCount,
    },
    isLoading,
    error,
    refetch: loadItems,
  };
};
