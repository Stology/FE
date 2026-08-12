import type { MaterialReview } from '@/shared/types/stology';

const matchReason = 'AI 매칭 근거: 자료 원문에서 해당 개념과 관계를 추출함';

export const mockMaterialReview: MaterialReview = {
  material: {
    id: 'jwt-note',
    isOwn: false,
    status: 'needs_review',
    title: 'JWT 정리 노트',
    uploadedAt: '2026-03-15',
    uploaderName: '김철수',
    week: 3,
  },
  reviewerCount: 4,
  candidates: [
    {
      approverNames: ['김철수', '이영희'],
      id: 'jwt',
      matchReason,
      name: 'JWT',
      rejecterNames: [],
    },
    {
      approverNames: ['김철수', '이영희'],
      id: 'refresh-token',
      matchReason,
      myAction: 'approved',
      name: 'Refresh Token',
      rejecterNames: [],
    },
    {
      approverNames: ['김철수', '이영희'],
      id: 'session',
      matchReason,
      myAction: 'rejected',
      name: 'Session',
      rejecterNames: ['박민수'],
    },
  ],
};

export const getMockMaterialReview = (materialId: string) =>
  mockMaterialReview.material.id === materialId ? mockMaterialReview : undefined;
