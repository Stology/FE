import type {
  KnowledgeConceptNode,
  KnowledgeGraph,
  WeeklyRecordMaterial,
  WeeklyRecordStatus,
} from '@/shared/types/stology';

export type KnowledgeActivityFilter = 'all' | 'active';
export type KnowledgeWeekFilter = 'all' | number;

const conceptNodes = (graph: KnowledgeGraph): KnowledgeConceptNode[] =>
  graph.nodes.filter((node): node is KnowledgeConceptNode => node.type === 'concept');

/**
 * 선택한 주차 기준 배지 상태를 계산한다.
 * 'all'이면 노드가 가장 최근에 겪은 이벤트(보강 > 신규 활성) 기준, 특정 주차면 그 주차의 이벤트 기준.
 */
export const deriveWeekStatus = (
  node: KnowledgeConceptNode,
  week: KnowledgeWeekFilter,
): WeeklyRecordStatus | undefined => {
  if (week === 'all') {
    if (node.reinforcedWeeks.length > 0) return 'reinforced';
    if (node.activatedWeek !== undefined) return 'newly_activated';
    return undefined;
  }

  if (node.activatedWeek === week) return 'newly_activated';
  if (node.reinforcedWeeks.includes(week)) return 'reinforced';
  return undefined;
};

/** 활동/주차 필터를 함께 만족하는 concept 노드만 남긴다. */
export const filterConceptNodes = (
  graph: KnowledgeGraph,
  activityFilter: KnowledgeActivityFilter,
  weekFilter: KnowledgeWeekFilter,
): KnowledgeConceptNode[] =>
  conceptNodes(graph).filter((node) => {
    if (activityFilter === 'active' && node.state !== 'active') return false;
    if (weekFilter !== 'all' && deriveWeekStatus(node, weekFilter) === undefined) return false;
    return true;
  });

/** 노드명 검색은 필터와 무관하게 전체 concept 노드를 대상으로 한다. */
export const searchConceptNodes = (
  graph: KnowledgeGraph,
  keyword: string,
): KnowledgeConceptNode[] => {
  const normalized = keyword.trim().toLowerCase();
  if (normalized === '') return [];

  return conceptNodes(graph).filter(
    (node) =>
      node.label.toLowerCase().includes(normalized) ||
      node.aliases.some((alias) => alias.toLowerCase().includes(normalized)),
  );
};

/** 노드에 evidence로 연결된 자료를 최신 업로드순으로 반환한다. */
export const getNodeMaterials = (nodeId: string, graph: KnowledgeGraph): WeeklyRecordMaterial[] =>
  graph.edges
    .filter(
      (edge) => edge.kind === 'evidence' && (edge.source === nodeId || edge.target === nodeId),
    )
    .map((edge) =>
      graph.nodes.find((node) => node.id === (edge.source === nodeId ? edge.target : edge.source)),
    )
    .filter(
      (node): node is Extract<KnowledgeGraph['nodes'][number], { type: 'material' }> =>
        node?.type === 'material',
    )
    .map((node) => node.material)
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
