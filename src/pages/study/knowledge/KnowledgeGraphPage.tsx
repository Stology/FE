import { useMemo, useState } from 'react';
import { LockKeyhole, RotateCcw } from 'lucide-react';

import { mockConceptGraph, mockConceptGraphWeeks } from '@/shared/mocks/conceptGraph';
import type {
  ConceptGraph,
  ConceptNode,
  ConceptRelationType,
  WeeklyRecordMaterial,
} from '@/shared/types/stology';
import { Button, EmptyState, ErrorMessage, Loading, SearchInput, Select } from '@/shared/ui';

import { ConceptGraphCanvas } from './ConceptGraphCanvas';
import { ConceptNodePanel } from './ConceptNodePanel';

interface KnowledgeGraphPageProps {
  availableWeeks?: number[];
  errorMessage?: string | null;
  graph?: ConceptGraph;
  isLoading?: boolean;
  isReadOnly?: boolean;
  onMaterialOpen?: (material: WeeklyRecordMaterial) => void;
  onRetry?: () => void;
}

type ActivityFilter = 'all' | 'active';

const emptyConnections: Record<ConceptRelationType, ConceptNode[]> = {
  base: [],
  context: [],
  extension: [],
  contrast: [],
};

export const KnowledgeGraphPage = ({
  availableWeeks = mockConceptGraphWeeks,
  errorMessage,
  graph = mockConceptGraph,
  isLoading = false,
  isReadOnly = false,
  onMaterialOpen,
  onRetry,
}: KnowledgeGraphPageProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [weekFilter, setWeekFilter] = useState<'all' | number>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();

  const visibleNodes = useMemo(
    () =>
      graph.nodes.filter((node) => {
        if (activityFilter === 'active' && !node.isActive) return false;
        if (weekFilter !== 'all' && node.weekStatus === undefined) return false;
        return true;
      }),
    [activityFilter, graph.nodes, weekFilter],
  );

  const visibleIds = useMemo(() => new Set(visibleNodes.map((node) => node.id)), [visibleNodes]);

  const visibleRelations = useMemo(
    () =>
      graph.relations.filter(
        (relation) => visibleIds.has(relation.fromId) && visibleIds.has(relation.toId),
      ),
    [graph.relations, visibleIds],
  );

  /** 검색은 필터와 무관하게 전체 온톨로지 노드를 대상으로 한다. */
  const searchResults = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (keyword === '') return [];
    return graph.nodes.filter((node) => node.name.toLowerCase().includes(keyword));
  }, [graph.nodes, searchTerm]);

  const selectedNode = graph.nodes.find((node) => node.id === selectedNodeId);

  const connectedNodes = useMemo(() => {
    if (!selectedNode) return emptyConnections;

    return graph.relations.reduce<Record<ConceptRelationType, ConceptNode[]>>(
      (accumulator, relation) => {
        const counterpartId =
          relation.fromId === selectedNode.id
            ? relation.toId
            : relation.toId === selectedNode.id
              ? relation.fromId
              : undefined;

        if (counterpartId === undefined) return accumulator;

        const counterpart = graph.nodes.find((node) => node.id === counterpartId);
        if (counterpart) accumulator[relation.type].push(counterpart);

        return accumulator;
      },
      { base: [], context: [], extension: [], contrast: [] },
    );
  }, [graph.nodes, graph.relations, selectedNode]);

  const connectedIds = useMemo(
    () =>
      Object.values(connectedNodes)
        .flat()
        .map((node) => node.id),
    [connectedNodes],
  );

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSearchTerm('');
  };

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
      <>
        <ConceptGraphCanvas
          connectedIds={connectedIds}
          nodes={visibleNodes}
          onNodeSelect={handleNodeSelect}
          relations={visibleRelations}
          selectedNodeId={selectedNodeId}
        />
        <p className="mt-3 text-caption text-stology-text-light">
          선택 노드/연결 노드 강조 · 신규 활성/보강 구분 · 자료 수가 많을수록 진한 색
        </p>
      </>
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

        <div className="mb-5 flex flex-wrap items-end gap-4">
          <div className="relative min-w-[240px] flex-1">
            <SearchInput
              aria-label="노드 검색"
              onChange={setSearchTerm}
              placeholder="노드명을 검색하세요"
              value={searchTerm}
            />
            {searchResults.length > 0 ? (
              <ul
                aria-label="노드 검색 결과"
                className="absolute z-10 mt-1 w-full overflow-hidden rounded border border-stology-border-light bg-white shadow-sm"
              >
                {searchResults.map((node) => (
                  <li key={node.id}>
                    <button
                      className="block w-full px-3 py-2 text-left text-[13px] leading-5 text-stology-text-dark transition hover:bg-stology-off-white"
                      onClick={() => handleNodeSelect(node.id)}
                      type="button"
                    >
                      {node.name}
                      {!node.isActive ? (
                        <span className="ml-2 text-caption text-stology-text-light">비활성</span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <Select
            className="w-48"
            label="필터"
            onChange={(event) => setActivityFilter(event.target.value as ActivityFilter)}
            value={activityFilter}
          >
            <option value="all">전체 노드 보기</option>
            <option value="active">활성 노드만 보기</option>
          </Select>

          <Select
            className="w-40"
            label="주차별 필터"
            onChange={(event) =>
              setWeekFilter(event.target.value === 'all' ? 'all' : Number(event.target.value))
            }
            value={weekFilter}
          >
            <option value="all">전체 주차</option>
            {availableWeeks.map((week) => (
              <option key={week} value={week}>
                {week}주차
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div>{renderGraphContent()}</div>
          <ConceptNodePanel
            connectedNodes={connectedNodes}
            node={selectedNode}
            onConnectedNodeSelect={handleNodeSelect}
            onMaterialOpen={onMaterialOpen}
          />
        </div>
      </div>
    </section>
  );
};
