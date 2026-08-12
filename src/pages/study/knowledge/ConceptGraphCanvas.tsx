import { cn } from '@/shared/lib/cn';
import type { ConceptNode, ConceptRelation } from '@/shared/types/stology';

interface ConceptGraphCanvasProps {
  connectedIds?: string[];
  nodes: ConceptNode[];
  onNodeSelect?: (nodeId: string) => void;
  relations: ConceptRelation[];
  selectedNodeId?: string;
}

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 500;
const NODE_RADIUS = 32;

/** 자료 수가 많을수록 활성 노드 색을 진하게 표현한다. */
const activeFillOpacity = (materialCount: number) => Math.min(0.4 + materialCount * 0.2, 1);

export const ConceptGraphCanvas = ({
  connectedIds = [],
  nodes,
  onNodeSelect,
  relations,
  selectedNodeId,
}: ConceptGraphCanvasProps) => {
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const hasSelection = selectedNodeId !== undefined;

  return (
    <svg
      aria-label="지식 구조 그래프"
      className="h-auto w-full rounded-lg border border-stology-border-light bg-stology-off-white"
      role="group"
      viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
    >
      {relations.map((relation) => {
        const from = nodeById.get(relation.fromId);
        const to = nodeById.get(relation.toId);

        if (!from || !to) return null;

        const isHighlighted =
          hasSelection && (relation.fromId === selectedNodeId || relation.toId === selectedNodeId);

        return (
          <line
            className={cn(
              'transition',
              isHighlighted ? 'stroke-stology-electric-blue' : 'stroke-stology-border-light',
            )}
            key={`${relation.fromId}-${relation.toId}-${relation.type}`}
            strokeWidth={isHighlighted ? 4 : 2}
            x1={from.x}
            x2={to.x}
            y1={from.y}
            y2={to.y}
          />
        );
      })}

      {nodes.map((node) => {
        const isSelected = node.id === selectedNodeId;
        const isConnected = connectedIds.includes(node.id);
        const isDimmed = hasSelection && !isSelected && !isConnected;

        return (
          <g
            aria-label={`${node.name} 노드`}
            className="cursor-pointer focus:outline-none"
            key={node.id}
            onClick={() => onNodeSelect?.(node.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onNodeSelect?.(node.id);
              }
            }}
            opacity={isDimmed ? 0.35 : 1}
            role="button"
            tabIndex={0}
          >
            <circle
              className={cn(
                node.isActive ? 'fill-stology-electric-blue' : 'fill-white',
                isSelected
                  ? 'stroke-stology-deep-navy'
                  : isConnected
                    ? 'stroke-stology-electric-blue'
                    : 'stroke-stology-border-light',
              )}
              cx={node.x}
              cy={node.y}
              fillOpacity={node.isActive ? activeFillOpacity(node.materials.length) : 1}
              r={NODE_RADIUS}
              strokeWidth={isSelected ? 4 : 2}
            />
            {node.weekStatus === 'newly_activated' ? (
              <circle
                className="fill-stology-approve"
                cx={node.x + NODE_RADIUS - 6}
                cy={node.y - NODE_RADIUS + 6}
                r={6}
              />
            ) : null}
            {node.weekStatus === 'reinforced' ? (
              <rect
                className="fill-stology-royal-blue"
                height={10}
                rx={2}
                width={10}
                x={node.x + NODE_RADIUS - 11}
                y={node.y - NODE_RADIUS + 1}
              />
            ) : null}
            <text
              className={cn(
                'pointer-events-none text-[12px] font-bold',
                node.isActive ? 'fill-white' : 'fill-stology-text-dark',
              )}
              dominantBaseline="middle"
              textAnchor="middle"
              x={node.x}
              y={node.y}
            >
              {node.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
