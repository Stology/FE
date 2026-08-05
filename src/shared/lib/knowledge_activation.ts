import type { KnowledgeEdge } from '@/shared/types/stology';

export interface ActivationResult {
  activatedWeek?: number;
  materialCount: number;
  reinforcedWeeks: number[];
  state: 'active' | 'inactive';
}

/** evidence 엣지로 연결된 자료 주차로부터 concept 노드의 활성 상태를 계산한다. */
export const deriveActivation = (
  conceptId: string,
  edges: KnowledgeEdge[],
  materialWeekById: ReadonlyMap<string, number>,
): ActivationResult => {
  const linkedMaterialIds = edges
    .filter((edge) => edge.kind === 'evidence')
    .filter((edge) => edge.source === conceptId || edge.target === conceptId)
    .map((edge) => (edge.source === conceptId ? edge.target : edge.source));

  if (linkedMaterialIds.length === 0) {
    return { materialCount: 0, reinforcedWeeks: [], state: 'inactive' };
  }

  const weeks = linkedMaterialIds
    .map((materialId) => materialWeekById.get(materialId))
    .filter((week): week is number => week !== undefined);

  const activatedWeek = Math.min(...weeks);
  const reinforcedWeeks = Array.from(new Set(weeks.filter((week) => week > activatedWeek))).sort(
    (a, b) => a - b,
  );

  return {
    activatedWeek,
    materialCount: linkedMaterialIds.length,
    reinforcedWeeks,
    state: 'active',
  };
};

/** 노드에 연결된 전체 엣지 수(관계 + evidence)를 계산한다. */
export const computeDegree = (nodeId: string, edges: KnowledgeEdge[]): number =>
  edges.filter((edge) => edge.source === nodeId || edge.target === nodeId).length;
