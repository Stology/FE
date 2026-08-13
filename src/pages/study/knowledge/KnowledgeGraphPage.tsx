import { useMemo, useState } from 'react';
import { LockKeyhole, RotateCcw } from 'lucide-react';

import { mockKnowledgeGraph, mockKnowledgeGraphWeeks } from '@/shared/mocks/knowledgeGraph';
import type { KnowledgeGraph, KnowledgeNode, WeeklyRecordMaterial } from '@/shared/types/stology';
import { Button, EmptyState, ErrorMessage, Loading } from '@/shared/ui';

import { KnowledgeGraphCanvas } from './components/KnowledgeGraphCanvas';
import { KnowledgeGraphToolbar } from './components/KnowledgeGraphToolbar';
import { KnowledgeNodeInspector } from './components/KnowledgeNodeInspector';
import { useKnowledgeNodeMaterials } from './hooks';
import {
  filterConceptNodes,
  type KnowledgeActivityFilter,
  type KnowledgeWeekFilter,
} from './model/knowledge_mapper';
import { buildRelationOptions } from './model/knowledge_relations';

interface KnowledgeGraphPageProps {
  availableWeeks?: number[];
  errorMessage?: string | null;
  graph?: KnowledgeGraph;
  isLoading?: boolean;
  isReadOnly?: boolean;
  onMaterialOpen?: (material: WeeklyRecordMaterial) => void;
  onRetry?: () => void;
  /** 주어지면 선택 노드의 관련 자료를 노드 상세 API로 불러온다(그래프 목록엔 자료가 없음, 3-2 결정). */
  studyId?: string;
}

export const KnowledgeGraphPage = ({
  availableWeeks = mockKnowledgeGraphWeeks,
  errorMessage,
  graph = mockKnowledgeGraph,
  isLoading = false,
  isReadOnly = false,
  onMaterialOpen,
  onRetry,
  studyId,
}: KnowledgeGraphPageProps) => {
  const [activityFilter, setActivityFilter] = useState<KnowledgeActivityFilter>('all');
  const [weekFilter, setWeekFilter] = useState<KnowledgeWeekFilter>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
  const nodeMaterialsQuery = useKnowledgeNodeMaterials(studyId, selectedNodeId);

  const nodesById = useMemo(
    () => new Map<string, KnowledgeNode>(graph.nodes.map((node) => [node.id, node])),
    [graph.nodes],
  );

  const visibleNodes = useMemo(
    () => filterConceptNodes(graph, activityFilter, weekFilter),
    [activityFilter, graph, weekFilter],
  );

  const selectedNode = selectedNodeId
    ? graph.nodes.find(
        (node): node is Extract<KnowledgeNode, { type: 'concept' }> =>
          node.id === selectedNodeId && node.type === 'concept',
      )
    : undefined;

  const connectedIds = useMemo(() => {
    if (!selectedNode) return [];

    return buildRelationOptions(selectedNode.id, graph.edges, nodesById).flatMap((option) =>
      option.nodes.map((node) => node.id),
    );
  }, [graph.edges, nodesById, selectedNode]);

  const handleNodeSelect = (nodeId: string | undefined) => setSelectedNodeId(nodeId);

  const renderGraphContent = () => {
    if (isLoading) {
      return (
        <div aria-live="polite" role="status">
          <Loading className="min-h-40" label="지식 구조를 불러오는 중입니다" />
        </div>
      );
    }

    if (errorMessage) {
      return (
        <div className="flex min-h-40 flex-col items-center justify-center gap-4">
          <div className="w-full max-w-lg" role="alert">
            <ErrorMessage message={errorMessage} title="지식 구조를 불러오지 못했습니다" />
          </div>
          {onRetry ? (
            <Button
              leftIcon={<RotateCcw aria-hidden size={15} />}
              onClick={onRetry}
              variant="outline"
            >
              다시 시도
            </Button>
          ) : null}
        </div>
      );
    }

    if (visibleNodes.length === 0) {
      return (
        <EmptyState
          className="min-h-40"
          description="필터를 바꾸거나 자료를 업로드해 노드를 활성화해 보세요."
          title="표시할 노드가 없습니다"
        />
      );
    }

    return (
      <KnowledgeGraphCanvas
        activityFilter={activityFilter}
        connectedIds={connectedIds}
        graph={graph}
        onNodeSelect={handleNodeSelect}
        selectedNodeId={selectedNodeId}
        weekFilter={weekFilter}
      />
    );
  };

  return (
    <section
      aria-busy={isLoading}
      aria-label="지식 구조"
      className="min-h-[520px] rounded-b-lg border border-stology-border-light bg-white px-4 py-6 sm:px-6 lg:px-10 lg:pb-10 lg:pt-10"
    >
      <div className="w-full max-w-[1120px]">
        {isReadOnly ? (
          <div
            className="mb-5 flex items-start gap-2.5 border-y border-stology-border-light bg-stology-off-white px-4 py-3 text-stology-text-light"
            role="status"
          >
            <LockKeyhole aria-hidden className="mt-0.5 size-4 shrink-0" />
            <p className="text-[13px] leading-5">
              종료된 스터디입니다. 지식 구조를 읽기 전용으로 확인할 수 있습니다.
            </p>
          </div>
        ) : null}

        <KnowledgeGraphToolbar
          activityFilter={activityFilter}
          availableWeeks={availableWeeks}
          graph={graph}
          onActivityFilterChange={setActivityFilter}
          onSearchSelect={handleNodeSelect}
          onWeekFilterChange={setWeekFilter}
          weekFilter={weekFilter}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div>{renderGraphContent()}</div>
          <KnowledgeNodeInspector
            graph={graph}
            materials={studyId ? nodeMaterialsQuery.data : undefined}
            materialsError={studyId ? nodeMaterialsQuery.isError : false}
            materialsIsLoading={studyId ? nodeMaterialsQuery.isLoading : false}
            node={selectedNode}
            onMaterialOpen={onMaterialOpen}
            onMaterialsRetry={studyId ? () => nodeMaterialsQuery.refetch() : undefined}
            onNodeSelect={handleNodeSelect}
            weekFilter={weekFilter}
          />
        </div>
      </div>
    </section>
  );
};
