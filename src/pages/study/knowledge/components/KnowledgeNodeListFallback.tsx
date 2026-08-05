import { cn } from '@/shared/lib/cn';
import type { KnowledgeConceptNode } from '@/shared/types/stology';
import { Badge } from '@/shared/ui';

import { deriveWeekStatus, type KnowledgeWeekFilter } from '../model/knowledge_mapper';

interface KnowledgeNodeListFallbackProps {
  connectedIds?: string[];
  nodes: KnowledgeConceptNode[];
  onNodeSelect?: (nodeId: string) => void;
  selectedNodeId?: string;
  weekFilter: KnowledgeWeekFilter;
}

/**
 * WebGL 그래프의 접근성/폴백 표현. 노드를 텍스트 목록으로 보여주며,
 * Phase A에서는 실제 3D 렌더러 도입 전까지 이 목록이 곧 캔버스 역할을 한다.
 */
export const KnowledgeNodeListFallback = ({
  connectedIds = [],
  nodes,
  onNodeSelect,
  selectedNodeId,
  weekFilter,
}: KnowledgeNodeListFallbackProps) => {
  const hasSelection = selectedNodeId !== undefined;

  return (
    <ul
      aria-label="지식 구조 노드 목록"
      className="grid grid-cols-1 gap-2 rounded-lg border border-stology-border-light bg-stology-off-white p-4 sm:grid-cols-2"
    >
      {nodes.map((node) => {
        const status = deriveWeekStatus(node, weekFilter);
        const isSelected = node.id === selectedNodeId;
        const isConnected = connectedIds.includes(node.id);
        const isDimmed = hasSelection && !isSelected && !isConnected;

        return (
          <li key={node.id}>
            <button
              aria-label={`${node.label} 노드`}
              aria-pressed={isSelected}
              className={cn(
                'flex w-full flex-wrap items-center gap-1.5 rounded-md border bg-white px-3 py-2 text-left text-[13px] font-semibold leading-5 transition',
                node.state === 'active' ? 'text-stology-text-dark' : 'text-stology-text-light',
                isSelected
                  ? 'border-stology-deep-navy ring-2 ring-stology-deep-navy'
                  : isConnected
                    ? 'border-stology-electric-blue'
                    : 'border-stology-border-light',
                isDimmed && 'opacity-40',
              )}
              onClick={() => onNodeSelect?.(node.id)}
              type="button"
            >
              <span>{node.label}</span>
              {status === 'newly_activated' ? <Badge variant="success">신규 활성</Badge> : null}
              {status === 'reinforced' ? <Badge variant="week">보강</Badge> : null}
              {node.state === 'inactive' ? <Badge variant="neutral">비활성</Badge> : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
};
