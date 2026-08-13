import { httpClient } from './http_client';
import type { ApiResponse } from './types';

export interface KnowledgeGraphNodeRes {
  activationWeek: number;
  activeLevel: number;
  description: string | null;
  id: number;
  recommendWeek: number;
  title: string;
}

export interface KnowledgeGraphEdgeRes {
  relation: string;
  source: number;
  target: number;
}

export interface KnowledgeGraphRes {
  edges: KnowledgeGraphEdgeRes[];
  nodes: KnowledgeGraphNodeRes[];
}

export interface ConnectedNodeRes {
  activeLevel: number;
  nodeId: number;
  title: string;
}

export interface NodeMaterialRes {
  createdAt: string;
  id: number;
  memberName: string;
  title: string;
}

export interface NodeDetailRes {
  activeLevel: number;
  definition: string;
  isActive: boolean;
  materialCount: number;
  nodeId: number;
  recentMaterials: NodeMaterialRes[];
  relations: Record<string, ConnectedNodeRes[]>;
  title: string;
}

/** 그래프 전체 목록. 노드 크기·색 진하기는 activeLevel로 매핑한다(기용님 3-1 답변). */
export const getKnowledgeGraph = async (studyId: string): Promise<KnowledgeGraphRes> => {
  const { data } = await httpClient.get<ApiResponse<KnowledgeGraphRes>>(
    `/api/study/${studyId}/knowledge-graph`,
  );
  return data.result;
};

export const getKnowledgeGraphNode = async (
  studyId: string,
  nodeId: number,
): Promise<NodeDetailRes> => {
  const { data } = await httpClient.get<ApiResponse<NodeDetailRes>>(
    `/api/study/${studyId}/knowledge-graph/nodes/${nodeId}`,
  );
  return data.result;
};
