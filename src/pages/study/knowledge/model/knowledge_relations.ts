import type {
  ConceptRelationKind,
  KnowledgeConceptNode,
  KnowledgeEdge,
  KnowledgeNode,
} from '@/shared/types/stology';

export const RELATION_ORDER: ConceptRelationKind[] = [
  'based-on',
  'associated-with',
  'advanced-from',
  'contrasted-with',
];

export const relationLabel: Record<ConceptRelationKind, string> = {
  'based-on': '기반',
  'associated-with': '맥락',
  'advanced-from': '확장',
  'contrasted-with': '대조',
};

export interface RelationOption {
  kind: ConceptRelationKind;
  label: string;
  nodes: KnowledgeConceptNode[];
}

const isConceptNode = (node: KnowledgeNode | undefined): node is KnowledgeConceptNode =>
  node?.type === 'concept';

/** 선택한 노드와 특정 관계 종류로 연결된 concept 노드 목록을 반환한다. */
export const getRelationNodes = (
  nodeId: string,
  kind: ConceptRelationKind,
  edges: KnowledgeEdge[],
  nodesById: ReadonlyMap<string, KnowledgeNode>,
): KnowledgeConceptNode[] =>
  edges
    .filter((edge) => edge.kind === kind && (edge.source === nodeId || edge.target === nodeId))
    .map((edge) => nodesById.get(edge.source === nodeId ? edge.target : edge.source))
    .filter(isConceptNode);

/** 4종 관계를 고정 순서로, 연결 노드가 없는 종류도 빈 배열로 포함해 반환한다. */
export const buildRelationOptions = (
  nodeId: string,
  edges: KnowledgeEdge[],
  nodesById: ReadonlyMap<string, KnowledgeNode>,
): RelationOption[] =>
  RELATION_ORDER.map((kind) => ({
    kind,
    label: relationLabel[kind],
    nodes: getRelationNodes(nodeId, kind, edges, nodesById),
  }));
