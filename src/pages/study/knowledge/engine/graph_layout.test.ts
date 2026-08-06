import { describe, expect, it } from 'vitest';

import { mockKnowledgeGraph } from '@/shared/mocks/knowledgeGraph';

import { computeLayout } from './graph_layout';

describe('computeLayout', () => {
  it('동일한 그래프와 seed에 대해 항상 동일한 좌표를 계산한다', () => {
    const first = computeLayout(mockKnowledgeGraph, 2026);
    const second = computeLayout(mockKnowledgeGraph, 2026);

    expect(Array.from(second.positions)).toEqual(Array.from(first.positions));
  });

  it('seed가 다르면 다른 좌표를 계산한다', () => {
    const first = computeLayout(mockKnowledgeGraph, 2026);
    const second = computeLayout(mockKnowledgeGraph, 7);

    let hasDifference = false;
    for (let i = 0; i < first.positions.length; i += 1) {
      if (first.positions[i] !== second.positions[i]) {
        hasDifference = true;
        break;
      }
    }
    expect(hasDifference).toBe(true);
  });

  it('모든 노드에 유한한 좌표를 부여한다', () => {
    const { positions } = computeLayout(mockKnowledgeGraph);

    for (let i = 0; i < positions.length; i += 1) {
      expect(Number.isFinite(positions[i])).toBe(true);
    }
  });

  it('클러스터별 노드 중심(centroid)이 서로 다른 위치에 분리되어 배치된다', () => {
    const { positions } = computeLayout(mockKnowledgeGraph);

    const centroids = mockKnowledgeGraph.clusters.map((cluster) => {
      const indices = mockKnowledgeGraph.nodes
        .map((node, index) => (node.clusterId === cluster.id ? index : -1))
        .filter((index) => index !== -1);
      const sum = indices.reduce(
        (acc, index) => ({
          x: acc.x + positions[index * 3],
          y: acc.y + positions[index * 3 + 1],
          z: acc.z + positions[index * 3 + 2],
        }),
        { x: 0, y: 0, z: 0 },
      );
      return { x: sum.x / indices.length, y: sum.y / indices.length, z: sum.z / indices.length };
    });

    for (let i = 0; i < centroids.length; i += 1) {
      for (let j = i + 1; j < centroids.length; j += 1) {
        const distance = Math.hypot(
          centroids[i].x - centroids[j].x,
          centroids[i].y - centroids[j].y,
          centroids[i].z - centroids[j].z,
        );
        expect(distance).toBeGreaterThan(5);
      }
    }
  });
});
