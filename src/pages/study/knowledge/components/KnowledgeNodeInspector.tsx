import { useEffect, useMemo, useState } from 'react';

import type {
  ConceptRelationKind,
  KnowledgeConceptNode,
  KnowledgeGraph,
  KnowledgeNode,
  WeeklyRecordMaterial,
} from '@/shared/types/stology';
import { Badge, Button, EmptyState } from '@/shared/ui';

import {
  deriveWeekStatus,
  getNodeMaterials,
  type KnowledgeWeekFilter,
} from '../model/knowledge_mapper';
import { buildRelationOptions, RELATION_ORDER } from '../model/knowledge_relations';
import { KnowledgeRelationToggle } from './KnowledgeRelationToggle';

interface KnowledgeNodeInspectorProps {
  graph: KnowledgeGraph;
  node?: KnowledgeConceptNode;
  onMaterialOpen?: (material: WeeklyRecordMaterial) => void;
  onNodeSelect?: (nodeId: string) => void;
  weekFilter: KnowledgeWeekFilter;
}

const VISIBLE_CONNECTION_COUNT = 3;

export const KnowledgeNodeInspector = ({
  graph,
  node,
  onMaterialOpen,
  onNodeSelect,
  weekFilter,
}: KnowledgeNodeInspectorProps) => {
  const [relationKind, setRelationKind] = useState<ConceptRelationKind>(RELATION_ORDER[0]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setRelationKind(RELATION_ORDER[0]);
    setIsExpanded(false);
  }, [node?.id]);

  const nodesById = useMemo(
    () => new Map<string, KnowledgeNode>(graph.nodes.map((n) => [n.id, n])),
    [graph.nodes],
  );

  if (!node) {
    return (
      <EmptyState
        className="min-h-[500px]"
        description="그래프에서 노드를 선택하면 정의와 관련 자료를 볼 수 있습니다."
        title="노드를 선택해 주세요"
      />
    );
  }

  const status = deriveWeekStatus(node, weekFilter);
  const materials = getNodeMaterials(node.id, graph);
  const relationOptions = buildRelationOptions(node.id, graph.edges, nodesById);
  const relatedNodes = relationOptions.find((option) => option.kind === relationKind)?.nodes ?? [];
  const visibleNodes = isExpanded ? relatedNodes : relatedNodes.slice(0, VISIBLE_CONNECTION_COUNT);
  const relationLabel = relationOptions.find((option) => option.kind === relationKind)?.label ?? '';

  return (
    <aside
      aria-label={`${node.label} 노드 상세`}
      className="flex min-h-[500px] flex-col rounded-lg border border-stology-border-light bg-white p-5"
    >
      <div className="flex items-center gap-2">
        <h3 className="text-heading-1 text-stology-text-dark">{node.label}</h3>
        {status === 'newly_activated' ? <Badge variant="success">신규 활성</Badge> : null}
        {status === 'reinforced' ? <Badge variant="week">보강</Badge> : null}
        {node.state === 'inactive' ? <Badge variant="neutral">비활성</Badge> : null}
      </div>

      <p className="mt-2 text-[13px] leading-5 text-stology-text-light">정의: {node.definition}</p>

      <h4 className="mt-6 text-label text-stology-text-dark">
        관련 자료 {materials.length}개 · 최신순
      </h4>
      {materials.length === 0 ? (
        <p className="mt-2 text-caption text-stology-text-light">아직 연결된 자료가 없습니다.</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {materials.map((material) => (
            <li key={material.id}>
              <button
                className="w-full rounded text-left text-[13px] leading-5 text-stology-text-dark underline-offset-2 transition hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stology-electric-blue"
                onClick={() => onMaterialOpen?.(material)}
                type="button"
              >
                {material.title} · {material.uploaderName} · {material.uploadedAt}
              </button>
            </li>
          ))}
        </ul>
      )}

      <h4 className="mt-6 text-label text-stology-text-dark">연결 관계</h4>
      <KnowledgeRelationToggle
        onChange={(kind) => {
          setRelationKind(kind);
          setIsExpanded(false);
        }}
        value={relationKind}
      />

      {relatedNodes.length === 0 ? (
        <p className="mt-3 text-caption text-stology-text-light">
          {relationLabel} 관계의 연결 노드가 없습니다.
        </p>
      ) : (
        <>
          <ul className="mt-3 space-y-1.5">
            {visibleNodes.map((connectedNode) => (
              <li key={connectedNode.id}>
                <button
                  className="rounded text-[13px] font-semibold leading-5 text-stology-royal-blue underline-offset-2 transition hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stology-electric-blue"
                  onClick={() => onNodeSelect?.(connectedNode.id)}
                  type="button"
                >
                  {connectedNode.label}
                </button>
              </li>
            ))}
          </ul>
          {!isExpanded && relatedNodes.length > VISIBLE_CONNECTION_COUNT ? (
            <div className="mt-3">
              <Button onClick={() => setIsExpanded(true)} size="sm" variant="ghost">
                더보기
              </Button>
            </div>
          ) : null}
        </>
      )}
    </aside>
  );
};
