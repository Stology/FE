import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { homeApi } from '@/shared/api/home';

export type MaterialTodoStatus = '검토 필요' | '재업로드 필요';
export type MaterialTodoFilter = '전체' | '검토' | '재업로드 필요';

export interface MaterialDetailModel {
  content: string;
  attachments: { name: string; fileType: string; downloadUrl: string }[];
  permission: 'read' | 'write' | 'admin' | 'none';
  isReadOnly: boolean;
}

export interface MaterialDetailState {
  isLoading: boolean;
  isError: boolean;
}

export interface MaterialTodoItem {
  id: string;
  status: MaterialTodoStatus;
  title: string;
  study: {
    id: string;
    name: string;
  };
  week: string;
  uploader: string;
  date: string;
  rawDate: number;
  detail?: MaterialDetailModel;
  state?: MaterialDetailState;
}

export const useMaterialTodos = () => {
  const [filter, setFilter] = useState<MaterialTodoFilter>('전체');

  const materialsQuery = useQuery({
    queryKey: ['home', 'materials'],
    queryFn: ({ signal }) => homeApi.getMaterials(undefined, signal),
  });

  const isLoading = materialsQuery.isLoading;
  const error = materialsQuery.error;

  const items = useMemo(() => {
    const apiItems = materialsQuery.data?.materials ?? [];

    const mapped: MaterialTodoItem[] = apiItems.map((s) => {
      const dateObj = new Date(s.uploadedDate);
      const isValidDate = !isNaN(dateObj.getTime());
      const formattedDate = isValidDate
        ? `${String(dateObj.getMonth() + 1).padStart(2, '0')}.${String(dateObj.getDate()).padStart(2, '0')}`
        : '';

      return {
        id: String(s.studyMaterialId),
        status: s.dataState === 'EXTRACTIONFAILED' ? '재업로드 필요' : '검토 필요',
        title: s.dataTitle,
        study: { id: String(s.studyId), name: s.studyName },
        week: `${s.week}주차`,
        uploader: s.uploaderName,
        date: formattedDate,
        rawDate: isValidDate ? dateObj.getTime() : 0,
      };
    });

    // 원시 타임스탬프 기준 최신순 정렬
    return mapped.sort((a, b) => b.rawDate - a.rawDate);
  }, [materialsQuery.data]);

  const filteredItems = useMemo(() => {
    if (filter === '전체') return items;
    return items.filter((item) => item.status === '검토 필요');
  }, [items, filter]);

  const counts = useMemo(
    () => ({
      전체: items.length,
      검토: items.filter((item) => item.status === '검토 필요').length,
      '재업로드 필요': items.filter((item) => item.status === '재업로드 필요').length,
    }),
    [items],
  );

  const refetch = () => {
    void materialsQuery.refetch();
  };

  return {
    filter,
    setFilter,
    items: filteredItems,
    counts,
    isLoading,
    error,
    refetch,
  };
};
