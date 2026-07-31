import { useMemo, useState } from 'react';

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
  permissionDenied: boolean;
  isReadOnly: boolean;
}

export interface MaterialTodoItem {
  id: string;
  status: MaterialTodoStatus;
  title: string;
  study: string;
  week: string;
  uploader: string;
  date: string;
  detail?: MaterialDetailModel;
  state?: MaterialDetailState;
}

export type MaterialTodoFilter = '전체' | '검토' | '재업로드 필요';

const MOCK_MATERIALS: MaterialTodoItem[] = [
  {
    id: 'mat-1',
    status: '검토 필요',
    title: 'Spring Security 인증',
    study: '백엔드 마스터',
    week: '3주차',
    uploader: '김민준',
    date: '07.16',
    detail: {
      content: 'Spring Security 인증 흐름에 대한 자료입니다.',
      attachments: [
        { name: 'security-flow.pdf', fileType: 'application/pdf', downloadUrl: '/downloads/1' },
      ],
      permission: 'read',
      isReadOnly: false,
    },
    state: { isLoading: false, isError: false, permissionDenied: false, isReadOnly: false },
  },
  {
    id: 'mat-2',
    status: '검토 필요',
    title: 'JPA 연관관계 정리',
    study: 'CS 스터디',
    week: '2주차',
    uploader: '이서연',
    date: '07.16',
    detail: {
      content: 'JPA 양방향 연관관계 정리 문서',
      attachments: [],
      permission: 'none',
      isReadOnly: false,
    },
    state: { isLoading: false, isError: false, permissionDenied: true, isReadOnly: false },
  },
  {
    id: 'mat-3',
    status: '추출 실패',
    title: '트랜잭션 격리 수준',
    study: '백엔드 마스터',
    week: '3주차',
    uploader: '김스토',
    date: '07.15',
    detail: {
      content: '트랜잭션 격리 수준 비교표',
      attachments: [
        { name: 'isolation.pdf', fileType: 'application/pdf', downloadUrl: '/downloads/3' },
      ],
      permission: 'read',
      isReadOnly: false,
    },
    state: { isLoading: false, isError: true, permissionDenied: false, isReadOnly: false },
  },
  {
    id: 'mat-4',
    status: '검토 필요',
    title: '인덱스 성능 노트',
    study: '알고리즘',
    week: '1주차',
    uploader: '박도윤',
    date: '07.15',
    detail: {
      content: 'B-Tree 인덱스 구조와 성능 비교',
      attachments: [
        {
          name: 'index-perf.xlsx',
          fileType: 'application/vnd.ms-excel',
          downloadUrl: '/downloads/4',
        },
      ],
      permission: 'read',
      isReadOnly: true,
    },
    state: { isLoading: false, isError: false, permissionDenied: false, isReadOnly: true },
  },
];

export const useMaterialTodos = () => {
  const [filter, setFilter] = useState<MaterialTodoFilter>('전체');

  const filteredItems = useMemo(() => {
    if (filter === '검토') {
      return MOCK_MATERIALS.filter((item) => item.status === '검토 필요');
    }
    if (filter === '재업로드 필요') {
      return MOCK_MATERIALS.filter((item) => item.status === '추출 실패');
    }
    return MOCK_MATERIALS;
  }, [filter]);

  const counts = useMemo(() => {
    const reviewCount = MOCK_MATERIALS.filter((item) => item.status === '검토 필요').length;
    const reuploadCount = MOCK_MATERIALS.filter((item) => item.status === '추출 실패').length;
    return {
      전체: MOCK_MATERIALS.length,
      검토: reviewCount,
      '재업로드 필요': reuploadCount,
    };
  }, []);

  return {
    filter,
    setFilter,
    items: filteredItems,
    counts,
  };
};
