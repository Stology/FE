import type { Material, MaterialStatus } from '@/shared/types/stology';

export const materialStatusLabel: Record<MaterialStatus, string> = {
  extracting: '추출 중',
  extract_failed: '추출 실패',
  needs_review: '검토 필요',
  editable: '검토 대기',
  confirmed: '확정 완료',
};

export const mockMaterials: Material[] = [
  {
    id: 'jwt-note',
    isOwn: false,
    status: 'needs_review',
    title: 'JWT 정리',
    uploadedAt: '2026-03-15',
    uploaderName: '김철수',
    week: 3,
  },
  {
    id: 'cache-strategy',
    isOwn: false,
    status: 'extract_failed',
    title: '캐시 전략',
    uploadedAt: '2026-03-14',
    uploaderName: '이영희',
    week: 3,
  },
  {
    id: 'auth-flow',
    isOwn: false,
    status: 'extracting',
    title: '인증 흐름',
    uploadedAt: '2026-03-14',
    uploaderName: '박민수',
    week: 3,
  },
  {
    id: 'token-reissue',
    isOwn: true,
    status: 'editable',
    title: '토큰 재발급',
    uploadedAt: '2026-03-13',
    uploaderName: '김철수',
    week: 3,
  },
];
