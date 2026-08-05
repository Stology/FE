import { useEffect, useRef } from 'react';

import type { KnowledgeGraph } from '@/shared/types/stology';

import { createGraphEngine, type GraphEngine } from '../engine/graph_engine';
import {
  filterConceptNodes,
  type KnowledgeActivityFilter,
  type KnowledgeWeekFilter,
} from '../model/knowledge_mapper';
import { KnowledgeNodeListFallback } from './KnowledgeNodeListFallback';

interface KnowledgeGraphCanvasProps {
  activityFilter: KnowledgeActivityFilter;
  connectedIds?: string[];
  graph: KnowledgeGraph;
  onNodeSelect?: (nodeId: string | undefined) => void;
  selectedNodeId?: string;
  weekFilter: KnowledgeWeekFilter;
}

/**
 * 3D WebGL 캔버스와 접근성 폴백 목록을 함께 렌더링한다.
 * 엔진은 그래프 identity가 바뀔 때만 새로 만든다 — 필터/선택 변경은 명령형 호출로만 전달해
 * 매 상호작용마다 WebGL 컨텍스트를 다시 만드는 성능 문제를 피한다.
 */
export const KnowledgeGraphCanvas = ({
  activityFilter,
  connectedIds,
  graph,
  onNodeSelect,
  selectedNodeId,
  weekFilter,
}: KnowledgeGraphCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelLayerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GraphEngine | undefined>(undefined);
  const onNodeSelectRef = useRef(onNodeSelect);
  onNodeSelectRef.current = onNodeSelect;

  useEffect(() => {
    const container = containerRef.current;
    const labelLayer = labelLayerRef.current;
    if (!container || !labelLayer) return;

    let engine: GraphEngine;
    try {
      engine = createGraphEngine({
        canvasClassName: 'stology-graph-canvas',
        container,
        graph,
        labelLayer,
        onNodeClick: (nodeId) => onNodeSelectRef.current?.(nodeId),
      });
    } catch (error) {
      // WebGL을 지원하지 않는 환경(구형 브라우저, 일부 저사양 기기, 테스트 환경)에서는
      // 3D 캔버스를 포기하고 접근성 폴백 목록만으로 동작하도록 조용히 물러난다.
      console.warn('지식 구조 3D 렌더러를 초기화하지 못했습니다.', error);
      return;
    }

    engineRef.current = engine;

    return () => {
      engineRef.current = undefined;
      engine.dispose();
    };
    // 그래프 identity 변경 시에만 엔진을 재생성한다(필터/선택 변경은 아래 effect에서 명령형으로 처리).
  }, [graph]);

  useEffect(() => {
    engineRef.current?.setSelection(selectedNodeId);
  }, [selectedNodeId]);

  useEffect(() => {
    engineRef.current?.setFilters({
      activeOnly: activityFilter === 'active',
      week: weekFilter === 'all' ? null : weekFilter,
    });
  }, [activityFilter, weekFilter]);

  const visibleConceptNodes = filterConceptNodes(graph, activityFilter, weekFilter);

  return (
    <div className="space-y-3">
      <div
        className="relative h-[520px] w-full overflow-hidden rounded-lg border border-stology-border-light bg-stology-off-white"
        ref={containerRef}
      >
        <div
          aria-hidden="true"
          className="stology-graph-label-layer pointer-events-none absolute inset-0"
          ref={labelLayerRef}
        />
      </div>
      <KnowledgeNodeListFallback
        connectedIds={connectedIds}
        nodes={visibleConceptNodes}
        onNodeSelect={onNodeSelect}
        selectedNodeId={selectedNodeId}
        weekFilter={weekFilter}
      />
    </div>
  );
};
