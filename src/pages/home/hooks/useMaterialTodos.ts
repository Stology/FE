import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { httpClient } from '@/shared/api/http_client';
import type { ApiResponse } from '@/shared/api/types';

export type MaterialTodoStatus = '검토 필요' | '추출 실패';

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
  detail?: MaterialDetailModel;
  state?: MaterialDetailState;
}

export type MaterialTodoFilter = '전체' | '검토' | '재업로드 필요';

interface MaterialInfo {
  studyMaterialId: number;
  dataTitle: string;
  presignedUrl: string;
  uploaderName: string;
  createdAt: string;
  updatedAt: string;
}

interface MaterialDetailRes {
  pageInfo: {
    totalElements: number;
    hasNext: boolean;
  };
  materials: MaterialInfo[];
}

export const useMaterialTodos = () => {
  const [filter, setFilter] = useState<MaterialTodoFilter>('전체');
  const [items, setItems] = useState<MaterialTodoItem[]>([]);
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
      const res = await httpClient.get<ApiResponse<MaterialDetailRes>>('/api/home/materials', {
        signal: controller.signal,
      });

      const apiItems = res.data?.result?.materials ?? [];
      const mapped: MaterialTodoItem[] = apiItems.map((s) => {
        // 날짜 포맷 (예: 07.16)
        const dateObj = new Date(s.createdAt);
        const formattedDate = !isNaN(dateObj.getTime())
          ? `${String(dateObj.getMonth() + 1).padStart(2, '0')}.${String(dateObj.getDate()).padStart(2, '0')}`
          : '';

        return {
          id: String(s.studyMaterialId),
          status: '검토 필요', // API에 상태 필드가 없어 기본값 부여
          title: s.dataTitle,
          study: { id: '', name: '-' }, // API에 스터디 정보가 없음
          week: '-',
          uploader: s.uploaderName,
          date: formattedDate,
        };
      });

      setItems(mapped);
      setError(null);
    } catch (err: unknown) {
      if ((err as { name?: string }).name !== 'CanceledError') {
        setItems([]);
        setError(err instanceof Error ? err : new Error('자료 목록을 불러오지 못했습니다.'));
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

  const filteredItems = useMemo(() => {
    if (filter === '검토') {
      return items.filter((item) => item.status === '검토 필요');
    }
    if (filter === '재업로드 필요') {
      return items.filter((item) => item.status === '추출 실패');
    }
    return items;
  }, [filter, items]);

  const counts = useMemo(() => {
    const reviewCount = items.filter((item) => item.status === '검토 필요').length;
    const reuploadCount = items.filter((item) => item.status === '추출 실패').length;
    return {
      전체: items.length,
      검토: reviewCount,
      '재업로드 필요': reuploadCount,
    };
  }, [items]);

  return {
    filter,
    setFilter,
    items: filteredItems,
    counts,
    isLoading,
    error,
    refetch: loadItems,
  };
};
