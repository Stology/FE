import { describe, expect, it } from 'vitest';

import { mockKnowledgeGraph } from './knowledgeGraph';

describe('mockKnowledgeGraph', () => {
  it('모든 엣지의 source/target이 실제 노드를 가리킨다', () => {
    const nodeIds = new Set(mockKnowledgeGraph.nodes.map((node) => node.id));

    for (const edge of mockKnowledgeGraph.edges) {
      expect(nodeIds.has(edge.source)).toBe(true);
      expect(nodeIds.has(edge.target)).toBe(true);
    }
  });

  it('모든 concept 노드의 clusterId가 실제 클러스터를 가리킨다', () => {
    const clusterIds = new Set(mockKnowledgeGraph.clusters.map((cluster) => cluster.id));

    for (const node of mockKnowledgeGraph.nodes) {
      expect(clusterIds.has(node.clusterId)).toBe(true);
    }
  });

  it('활성 노드와 비활성 노드가 함께 존재한다', () => {
    const conceptNodes = mockKnowledgeGraph.nodes.filter((node) => node.type === 'concept');

    expect(conceptNodes.some((node) => node.state === 'active')).toBe(true);
    expect(conceptNodes.some((node) => node.state === 'inactive')).toBe(true);
  });

  it('그래프 전체에 root 노드가 정확히 1개 존재한다', () => {
    // 레이아웃이 root 노드를 원점(0,0,0)에 고정하므로 그래프당 하나만 허용한다.
    const roots = mockKnowledgeGraph.nodes.filter((node) => node.isRoot);
    expect(roots).toHaveLength(1);
  });

  it('evidence 엣지로 연결된 자료가 있는 concept은 활성 상태다', () => {
    const evidenceTargets = new Set(
      mockKnowledgeGraph.edges
        .filter((edge) => edge.kind === 'evidence')
        .map((edge) => edge.target),
    );

    for (const node of mockKnowledgeGraph.nodes) {
      if (node.type === 'concept' && evidenceTargets.has(node.id)) {
        expect(node.state).toBe('active');
      }
    }
  });
});
