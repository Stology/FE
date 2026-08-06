import { useState } from 'react';

import type { KnowledgeGraph } from '@/shared/types/stology';
import { SearchInput, Select } from '@/shared/ui';

import {
  searchConceptNodes,
  type KnowledgeActivityFilter,
  type KnowledgeWeekFilter,
} from '../model/knowledge_mapper';

interface KnowledgeGraphToolbarProps {
  activityFilter: KnowledgeActivityFilter;
  availableWeeks: number[];
  graph: KnowledgeGraph;
  onActivityFilterChange: (filter: KnowledgeActivityFilter) => void;
  onSearchSelect: (nodeId: string) => void;
  onWeekFilterChange: (filter: KnowledgeWeekFilter) => void;
  weekFilter: KnowledgeWeekFilter;
}

export const KnowledgeGraphToolbar = ({
  activityFilter,
  availableWeeks,
  graph,
  onActivityFilterChange,
  onSearchSelect,
  onWeekFilterChange,
  weekFilter,
}: KnowledgeGraphToolbarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const searchResults = searchConceptNodes(graph, searchTerm);

  return (
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
                  onClick={() => {
                    onSearchSelect(node.id);
                    setSearchTerm('');
                  }}
                  type="button"
                >
                  {node.label}
                  {node.state === 'inactive' ? (
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
        onChange={(event) => onActivityFilterChange(event.target.value as KnowledgeActivityFilter)}
        value={activityFilter}
      >
        <option value="all">전체 노드 보기</option>
        <option value="active">활성 노드만 보기</option>
      </Select>

      <Select
        className="w-40"
        label="주차별 필터"
        onChange={(event) =>
          onWeekFilterChange(event.target.value === 'all' ? 'all' : Number(event.target.value))
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
  );
};
