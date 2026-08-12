import { useEffect, useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { conceptRelationLabel, conceptRelationTypes } from '@/shared/mocks/conceptGraph';
import type {
  ConceptNode,
  ConceptRelationType,
  WeeklyRecordMaterial,
} from '@/shared/types/stology';
import { Badge, Button, EmptyState } from '@/shared/ui';

interface ConceptNodePanelProps {
  connectedNodes: Record<ConceptRelationType, ConceptNode[]>;
  node?: ConceptNode;
  onConnectedNodeSelect?: (nodeId: string) => void;
  onMaterialOpen?: (material: WeeklyRecordMaterial) => void;
}

const VISIBLE_CONNECTION_COUNT = 3;

const segmentClass = (isSelected: boolean) =>
  cn(
    'h-[30px] flex-1 border text-[12px] font-semibold leading-none transition first:rounded-l-md last:rounded-r-md',
    isSelected
      ? 'border-stology-deep-navy bg-stology-deep-navy text-white'
      : 'border-stology-border-light bg-white text-stology-text-dark hover:bg-stology-off-white',
  );

export const ConceptNodePanel = ({
  connectedNodes,
  node,
  onConnectedNodeSelect,
  onMaterialOpen,
}: ConceptNodePanelProps) => {
  const [relationType, setRelationType] = useState<ConceptRelationType>('base');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setRelationType('base');
    setIsExpanded(false);
  }, [node?.id]);

  if (!node) {
    return (
      <EmptyState
        className="min-h-[500px]"
        description="그래프에서 노드를 선택하면 정의와 관련 자료를 볼 수 있습니다."
        title="노드를 선택해 주세요"
      />
    );
  }

  const relatedNodes = connectedNodes[relationType] ?? [];
  const visibleNodes = isExpanded ? relatedNodes : relatedNodes.slice(0, VISIBLE_CONNECTION_COUNT);

  return (
    <aside
      aria-label={`${node.name} 노드 상세`}
      className="flex min-h-[500px] flex-col rounded-lg border border-stology-border-light bg-white p-5"
    >
      <div className="flex items-center gap-2">
        <h3 className="text-heading-1 text-stology-text-dark">{node.name}</h3>
        {node.weekStatus === 'newly_activated' ? <Badge variant="success">신규 활성</Badge> : null}
        {node.weekStatus === 'reinforced' ? <Badge variant="week">보강</Badge> : null}
        {!node.isActive ? <Badge variant="neutral">비활성</Badge> : null}
      </div>

      <p className="mt-2 text-[13px] leading-5 text-stology-text-light">정의: {node.definition}</p>

      <h4 className="mt-6 text-label text-stology-text-dark">
        관련 자료 {node.materials.length}개 · 최신순
      </h4>
      {node.materials.length === 0 ? (
        <p className="mt-2 text-caption text-stology-text-light">아직 연결된 자료가 없습니다.</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {node.materials.map((material) => (
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
      <div aria-label="연결 관계 유형" className="mt-2 flex" role="group">
        {conceptRelationTypes.map((type) => (
          <button
            aria-pressed={relationType === type}
            className={segmentClass(relationType === type)}
            key={type}
            onClick={() => {
              setRelationType(type);
              setIsExpanded(false);
            }}
            type="button"
          >
            {conceptRelationLabel[type]}
          </button>
        ))}
      </div>

      {relatedNodes.length === 0 ? (
        <p className="mt-3 text-caption text-stology-text-light">
          {conceptRelationLabel[relationType]} 관계의 연결 노드가 없습니다.
        </p>
      ) : (
        <>
          <ul className="mt-3 space-y-1.5">
            {visibleNodes.map((connectedNode) => (
              <li key={connectedNode.id}>
                <button
                  className="rounded text-[13px] font-semibold leading-5 text-stology-royal-blue underline-offset-2 transition hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stology-electric-blue"
                  onClick={() => onConnectedNodeSelect?.(connectedNode.id)}
                  type="button"
                >
                  {connectedNode.name}
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
