import { useState, useMemo } from 'react';

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

const MOCK_REPORT_TODOS: ReportTodoItem[] = [
  {
    id: 'rpt-1',
    status: '생성 완료',
    study: { id: 's-1', name: '백엔드 마스터' },
    reportName: '4주차 커버리지 리포트',
    createdAt: '07.16',
  },
  {
    id: 'rpt-2',
    status: '생성 완료',
    study: { id: 's-2', name: 'CS 스터디' },
    reportName: '2주차 커버리지 리포트',
    createdAt: '07.14',
  },
  {
    id: 'rpt-3',
    status: '생성 전',
    study: { id: 's-3', name: '알고리즘' },
    reportName: '-',
    createdAt: '-',
  },
];

export const useReportTodos = () => {
  const [items] = useState<ReportTodoItem[]>(MOCK_REPORT_TODOS);

  // 현재는 '전체 스터디' 하나의 필터만 사용하므로 items 그대로 사용 (정렬 로직 추가 가능)
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

  return {
    items: sortedItems,
    counts: {
      total: totalCount,
    },
  };
};
