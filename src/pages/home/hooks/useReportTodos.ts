import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { homeApi } from '@/shared/api/home';

export interface ReportTodoItem {
  id: string;
  status: '생성 완료' | '생성 전';
  study: {
    id: string;
    name: string;
  };
  reportName: string;
  reportWeek: number;
  createdAt: string;
  rawDate: number;
}

export function useReportTodos(activeStudyIds: readonly string[]) {
  const reportsQuery = useQuery({
    queryKey: ['home', 'reports'],
    queryFn: ({ signal }) => homeApi.getReports(undefined, signal),
  });

  const isLoading = reportsQuery.isLoading;
  const error = reportsQuery.error;

  const items = useMemo(() => {
    const activeStudyIdSet = new Set(activeStudyIds);
    const apiItems = (reportsQuery.data?.reports ?? []).filter((report) =>
      activeStudyIdSet.has(String(report.studyId)),
    );

    const mapped: ReportTodoItem[] = apiItems.map((r) => {
      const dateObj = new Date(r.createdAt);
      const isValidDate = !isNaN(dateObj.getTime());
      const formattedDate = isValidDate
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
        reportWeek: r.reportWeek,
        createdAt: r.generated ? formattedDate : '-',
        rawDate: isValidDate ? dateObj.getTime() : 0,
      };
    });

    // 생성 완료 우선, 이후 원시 타임스탬프 기준 최신순 정렬
    return mapped.sort((a, b) => {
      if (a.status === '생성 완료' && b.status === '생성 전') return -1;
      if (a.status === '생성 전' && b.status === '생성 완료') return 1;
      return b.rawDate - a.rawDate;
    });
  }, [activeStudyIds, reportsQuery.data]);

  const counts = useMemo(
    () => ({
      total: items.length,
      completed: items.filter((item) => item.status === '생성 완료').length,
    }),
    [items],
  );

  const refetch = () => {
    void reportsQuery.refetch();
  };

  return {
    items,
    counts,
    isLoading,
    error,
    refetch,
  };
}
