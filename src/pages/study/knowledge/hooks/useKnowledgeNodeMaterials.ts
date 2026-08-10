import { useQuery } from '@tanstack/react-query';

import { getKnowledgeGraphNode } from '@/shared/api/knowledge';

import { mapNodeDetailMaterials } from '../model/knowledge_api_mapper';

/**
 * 선택된 노드의 관련 자료 목록. 그래프 목록 API엔 자료가 없어(3-2 결정) 노드
 * 상세 API를 따로 불러야 한다. relations/definition은 그래프 목록 edges/description으로
 * 이미 충분해서 여기선 recentMaterials만 쓴다.
 */
export const useKnowledgeNodeMaterials = (
  studyId: string | undefined,
  nodeId: string | undefined,
) =>
  useQuery({
    enabled: Boolean(studyId) && Boolean(nodeId),
    queryFn: () =>
      getKnowledgeGraphNode(studyId as string, Number(nodeId)).then(mapNodeDetailMaterials),
    queryKey: ['knowledge-graph', 'node-materials', studyId, nodeId],
  });
