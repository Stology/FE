export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface EngineFilters {
  /** '활성 노드만 보기' 필터. */
  activeOnly: boolean;
  week: number | null;
}

/** nodeId가 undefined면 선택 해제(빈 공간 클릭/더블탭)를 의미한다. */
export type NodeClickHandler = (nodeId: string | undefined) => void;
