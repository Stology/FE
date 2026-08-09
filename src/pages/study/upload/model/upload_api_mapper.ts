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
 * 백엔드에 없는 값은 다음과 같이 근사한다(1-2/1-6 답변 대기 — 데이터 생기면 교체):
 * - isOwn: "내 memberId"를 로그인 시 받기로 확정됐지만(1-6) 로그인 자체가 아직 mock이라
 *   프론트가 아직 들고 있지 않음 → 당분간 항상 false로 둠. NEEDREVIEW는 항상 "검토 필요"로만
 *   표시되고, 본인 자료의 "검토 대기"/자료 수정 액션은 로그인 연동 후에나 나타남.
 * - week, description: 목록 API에 없어 week는 현재 스터디 주차로 대체, description은 공란.
 */
export const mapRecentFileToMaterial = (dto: RecentFileRes, currentWeek: number): Material => ({
  id: String(dto.materialId),
  isOwn: false,
  status: STATUS_BY_DATA_STATE[dto.dataState],
  title: dto.dataTitle,
  uploadedAt: dto.createdAt.slice(0, 10),
  uploaderName: dto.uploaderName,
  week: currentWeek,
});
