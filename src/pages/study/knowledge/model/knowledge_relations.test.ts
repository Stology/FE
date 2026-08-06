import { describe, expect, it } from 'vitest';

import type { KnowledgeConceptNode, KnowledgeEdge, KnowledgeNode } from '@/shared/types/stology';

import { buildRelationOptions, getRelationNodes, RELATION_ORDER } from './knowledge_relations';

const concept = (id: string, label: string): KnowledgeConceptNode => ({
  activatedWeek: 1,
  aliases: [],
  clusterId: 'cluster-1',
  definition: `${label} 정의`,
  degree: 0,
  id,
  importance: 3,
  isRoot: false,
  label,
  materialCount: 1,
  reinforcedWeeks: [],
  state: 'active',
  type: 'concept',
  week: 1,
});

const edges: KnowledgeEdge[] = [
  { kind: 'based-on', source: 'jwt', target: 'auth' },
  { kind: 'associated-with', source: 'session', target: 'jwt' },
];

const nodesById = new Map<string, KnowledgeNode>([
  ['jwt', concept('jwt', 'JWT')],
  ['auth', concept('auth', 'Auth')],
  ['session', concept('session', 'Session')],
]);

describe('getRelationNodes', () => {
  it('source/target 방향과 무관하게 해당 관계의 연결 노드를 찾는다', () => {
    expect(getRelationNodes('jwt', 'based-on', edges, nodesById).map((node) => node.id)).toEqual([
      'auth',
    ]);
    expect(
      getRelationNodes('jwt', 'associated-with', edges, nodesById).map((node) => node.id),
    ).toEqual(['session']);
  });

  it('연결이 없는 관계는 빈 배열을 반환한다', () => {
    expect(getRelationNodes('jwt', 'advanced-from', edges, nodesById)).toEqual([]);
  });
});

describe('buildRelationOptions', () => {
  it('4종 관계를 고정 순서로, 빈 관계도 포함해 반환한다', () => {
    const options = buildRelationOptions('jwt', edges, nodesById);

    expect(options.map((option) => option.kind)).toEqual(RELATION_ORDER);
    expect(
      options.find((option) => option.kind === 'based-on')?.nodes.map((node) => node.id),
    ).toEqual(['auth']);
    expect(options.find((option) => option.kind === 'advanced-from')?.nodes).toEqual([]);
  });
});
