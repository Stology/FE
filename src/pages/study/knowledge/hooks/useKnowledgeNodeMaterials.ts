import { useQuery } from '@tanstack/react-query';

import { getWeeklyRecordNodeInfo } from '@/shared/api/weekly_records';
import type { WeeklyRecordMaterial } from '@/shared/types/stology';

function getNodeMaterials(
  response: Awaited<ReturnType<typeof getWeeklyRecordNodeInfo>>,
): WeeklyRecordMaterial[] {
  return response.materials.map((material) => ({
    downloadUrl: material.presignedUrl,
    id: String(material.studyMaterialId),
    title: material.dataTitle,
    uploadedAt: material.createdAt.split('T')[0] || material.createdAt,
    uploaderName: material.uploaderName,
  }));
}

/**
 * 선택된 노드의 전체 원본 자료 목록. 원본 자료 API의 응답을 팝업 표시 모델로 변환한다.
 */
export const useKnowledgeNodeMaterials = (
  studyId: string | undefined,
  nodeId: string | undefined,
) =>
  useQuery({
    enabled: Boolean(studyId) && Boolean(nodeId),
    queryFn: () =>
      getWeeklyRecordNodeInfo(studyId as string, nodeId as string).then(getNodeMaterials),
    queryKey: ['knowledge-graph', 'node-materials', studyId, nodeId],
  });
