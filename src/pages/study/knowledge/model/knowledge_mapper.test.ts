import { describe, expect, it } from 'vitest';

import type {
  KnowledgeConceptNode,
  KnowledgeGraph,
  KnowledgeMaterialNode,
} from '@/shared/types/stology';

import {
  deriveWeekStatus,
  filterConceptNodes,
  getNodeMaterials,
  searchConceptNodes,
} from './knowledge_mapper';

const concept = (
  overrides: Partial<KnowledgeConceptNode> & { id: string; label: string },
): KnowledgeConceptNode => ({
  aliases: [],
  clusterId: 'cluster-1',
  definition: `${overrides.label} 정의`,
  degree: 0,
  importance: 3,
  isRoot: false,
  materialCount: 0,
  reinforcedWeeks: [],
  state: 'inactive',
  type: 'concept',
  week: 1,
  ...overrides,
});

const material = (
  id: string,
  label: string,
  week: number,
  uploadedAt: string,
): KnowledgeMaterialNode => ({
  clusterId: 'cluster-1',
  degree: 1,
  id,
  importance: 1,
  isRoot: false,
  label,
  material: { id, title: label, uploadedAt, uploaderName: '김철수' },
  type: 'material',
  week,
});

const jwt = concept({
  activatedWeek: 1,
  id: 'jwt',
  label: 'JWT',
  materialCount: 2,
  reinforcedWeeks: [3],
  state: 'active',
});
const auth = concept({
  activatedWeek: 2,
  id: 'auth',
  label: 'Auth',
  materialCount: 1,
  state: 'active',
});
const session = concept({ id: 'session', label: 'Session' });

const graph: KnowledgeGraph = {
  clusters: [{ accent: 'accent-1', id: 'cluster-1', label: '인증' }],
  edges: [
    { kind: 'evidence', source: 'mat-1', target: 'jwt' },
    { kind: 'evidence', source: 'mat-2', target: 'jwt' },
    { kind: 'evidence', source: 'mat-3', target: 'auth' },
  ],
  nodes: [
    jwt,
    auth,
    session,
    material('mat-1', 'JWT 정리 노트', 1, '2026-03-13'),
    material('mat-2', '토큰 재발급', 3, '2026-03-15'),
    material('mat-3', '인증 흐름', 2, '2026-03-10'),
  ],
};

describe('deriveWeekStatus', () => {
  it("week가 'all'이면 보강 이력이 있는 노드를 reinforced로 본다", () => {
    expect(deriveWeekStatus(jwt, 'all')).toBe('reinforced');
    expect(deriveWeekStatus(auth, 'all')).toBe('newly_activated');
    expect(deriveWeekStatus(session, 'all')).toBeUndefined();
  });

  it('특정 주차가 activatedWeek와 같으면 newly_activated, reinforcedWeeks에 포함되면 reinforced를 반환한다', () => {
    expect(deriveWeekStatus(jwt, 1)).toBe('newly_activated');
    expect(deriveWeekStatus(jwt, 3)).toBe('reinforced');
    expect(deriveWeekStatus(jwt, 2)).toBeUndefined();
  });
});

describe('filterConceptNodes', () => {
  it("activityFilter가 'active'면 비활성 노드를 제외한다", () => {
    const result = filterConceptNodes(graph, 'active', 'all');

    expect(result.map((node) => node.id).sort()).toEqual(['auth', 'jwt']);
  });

  it('weekFilter가 특정 주차면 그 주차에 활동이 없는 노드를 제외한다', () => {
    const result = filterConceptNodes(graph, 'all', 3);

    expect(result.map((node) => node.id)).toEqual(['jwt']);
  });
});

describe('searchConceptNodes', () => {
  it('필터와 무관하게 라벨 부분 일치로 검색한다', () => {
    expect(searchConceptNodes(graph, 'sess').map((node) => node.id)).toEqual(['session']);
  });

  it('빈 검색어는 빈 배열을 반환한다', () => {
    expect(searchConceptNodes(graph, '  ')).toEqual([]);
  });
});

describe('getNodeMaterials', () => {
  it('evidence로 연결된 자료를 최신 업로드순으로 반환한다', () => {
    const materials = getNodeMaterials('jwt', graph);

    expect(materials.map((item) => item.id)).toEqual(['mat-2', 'mat-1']);
  });

  it('연결된 자료가 없으면 빈 배열을 반환한다', () => {
    expect(getNodeMaterials('session', graph)).toEqual([]);
  });
});
