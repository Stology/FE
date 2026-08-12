import type { DataState, RecentFileRes } from '@/shared/api/upload';
import type { Material, MaterialStatus } from '@/shared/types/stology';

const STATUS_BY_DATA_STATE: Record<DataState, MaterialStatus> = {
  EXTRACTING: 'extracting',
  EXTRACTIONFAILED: 'extract_failed',
  NEEDREVIEW: 'needs_review',
  READY: 'confirmed',
};

/**
 * 백엔드 RecentFileRes를 화면의 Material로 변환한다.
 *
 * - isOwn: 로그인 시 받은 내 memberId(`useAuthStore`의 `memberId`, `POST /api/auth/reissue`의
 *   `userId`)와 `uploaderMemberId`를 비교해 계산한다. mock 인증 상태에서는 memberId를 알 수
 *   없어(항상 null) isOwn이 항상 false로 나온다 — 실 로그인 후에만 정확해진다.
 * - week, description: 목록 API에 없어 week는 현재 스터디 주차로 대체, description은 공란.
 */
export const mapRecentFileToMaterial = (
  dto: RecentFileRes,
  currentWeek: number,
  memberId: number | null,
): Material => ({
  id: String(dto.materialId),
  isOwn: memberId !== null && dto.uploaderMemberId === memberId,
  status: STATUS_BY_DATA_STATE[dto.dataState],
  title: dto.dataTitle,
  uploadedAt: dto.createdAt.slice(0, 10),
  uploaderName: dto.uploaderName,
  week: currentWeek,
});
