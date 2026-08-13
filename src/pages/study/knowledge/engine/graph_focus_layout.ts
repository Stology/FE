import type * as THREE from 'three';

import type { KnowledgeEdgeKind, KnowledgeGraph } from '@/shared/types/stology';

import { FOCUS_COLLISION_CELL_SIZE, FOCUS_COLLISION_ITERATIONS } from './constants';
import type { LayoutResult } from './graph_layout';
import { fibonacciDirection } from './random';

interface AdjacentNode {
  index: number;
  kind: KnowledgeEdgeKind;
}

export interface FocusLayoutResult {
  radius: number;
  neighborCount: number;
}

const RELATION_RANK: Record<KnowledgeEdgeKind, number> = {
  'based-on': 0,
  'associated-with': 1,
  'advanced-from': 2,
  'contrasted-with': 3,
  evidence: 4,
};

const TAU = Math.PI * 2;
const GOLDEN_FRACTION = (Math.sqrt(5) - 1) / 2;

/**
 * 선택 노드를 중심으로 하는 결정론적 3D ego layout.
 * 인접 테이블은 한 번만 만들고, 선택 시 target 배열에 1-hop → 2-hop → 나머지 노드의
 * 목표 좌표를 기록한다. (레퍼런스 프로토타입 GraphFocusLayout 포팅)
 */
export class GraphFocusLayout {
  private readonly graph: KnowledgeGraph;
  private readonly layout: LayoutResult;
  private readonly adjacency: AdjacentNode[][];
  private readonly tiers: Uint8Array;
  private readonly directIndices: Int32Array;
  private readonly collisionGrid = new Map<string, number[]>();
  private readonly collisionBuckets: number[][] = [];

  constructor(graph: KnowledgeGraph, layout: LayoutResult) {
    this.graph = graph;
    this.layout = layout;
    this.tiers = new Uint8Array(graph.nodes.length);
    this.directIndices = new Int32Array(graph.nodes.length);

    const indexById = new Map<string, number>();
    graph.nodes.forEach((node, index) => indexById.set(node.id, index));

    const adjacencyMaps = Array.from(
      { length: graph.nodes.length },
      () => new Map<number, KnowledgeEdgeKind>(),
    );
    for (const edge of graph.edges) {
      const source = indexById.get(edge.source);
      const target = indexById.get(edge.target);
      if (source === undefined || target === undefined) continue;
      if (source === target) continue;
      this.setPreferredRelation(adjacencyMaps[source], target, edge.kind);
      this.setPreferredRelation(adjacencyMaps[target], source, edge.kind);
    }

    this.adjacency = adjacencyMaps.map((entries) =>
      Array.from(entries, ([index, kind]) => ({ index, kind })).sort((a, b) => {
        const relationDifference = RELATION_RANK[a.kind] - RELATION_RANK[b.kind];
        if (relationDifference !== 0) return relationDifference;
        return graph.nodes[a.index].id.localeCompare(graph.nodes[b.index].id);
      }),
    );
  }

  private setPreferredRelation(
    entries: Map<number, KnowledgeEdgeKind>,
    index: number,
    kind: KnowledgeEdgeKind,
  ): void {
    const existing = entries.get(index);
    if (existing === undefined || RELATION_RANK[kind] < RELATION_RANK[existing]) {
      entries.set(index, kind);
    }
  }

  plan(
    selectedIndex: number,
    visible: Uint8Array,
    right: THREE.Vector3,
    up: THREE.Vector3,
    towardCamera: THREE.Vector3,
    out: Float32Array,
  ): FocusLayoutResult {
    const nodeCount = this.graph.nodes.length;
    this.tiers.fill(3);
    this.tiers[selectedIndex] = 0;

    let directCount = 0;
    for (const adjacent of this.adjacency[selectedIndex]) {
      if (visible[adjacent.index] === 0) continue;
      this.directIndices[directCount] = adjacent.index;
      directCount += 1;
      this.tiers[adjacent.index] = 1;
    }

    for (let direct = 0; direct < directCount; direct += 1) {
      const directIndex = this.directIndices[direct];
      for (const adjacent of this.adjacency[directIndex]) {
        if (visible[adjacent.index] === 0 || this.tiers[adjacent.index] !== 3) continue;
        this.tiers[adjacent.index] = 2;
      }
    }

    const directShell = Math.min(19, Math.max(10.5, 8.5 + directCount * 0.58));
    const middleShell = directShell + Math.min(13, 8 + directCount * 0.18);
    const outerShell = middleShell + 13;
    const selectedOffset = selectedIndex * 3;
    const selectedX = this.layout.positions[selectedOffset];
    const selectedY = this.layout.positions[selectedOffset + 1];
    const selectedZ = this.layout.positions[selectedOffset + 2];

    for (let index = 0; index < nodeCount; index += 1) {
      const offset = index * 3;
      if (index === selectedIndex) {
        out[offset] = 0;
        out[offset + 1] = 0;
        out[offset + 2] = 0;
        continue;
      }

      let dx = this.layout.positions[offset] - selectedX;
      let dy = this.layout.positions[offset + 1] - selectedY;
      let dz = this.layout.positions[offset + 2] - selectedZ;
      let length = Math.hypot(dx, dy, dz);
      if (length < 0.0001) {
        [dx, dy, dz] = fibonacciDirection(index, Math.max(2, nodeCount));
        length = 1;
      }

      const shell = this.tiers[index] === 2 ? middleShell : outerShell;
      const importanceOffset = (this.graph.nodes[index].importance - 3) * -0.55;
      const radius = shell + importanceOffset;
      out[offset] = (dx / length) * radius;
      out[offset + 1] = (dy / length) * radius;
      out[offset + 2] = (dz / length) * radius;
    }

    let largestNeighborRadius = this.layout.radii[selectedIndex];
    for (let direct = 0; direct < directCount; direct += 1) {
      const index = this.directIndices[direct];
      const offset = index * 3;
      const angle = -Math.PI / 2 + (direct / Math.max(1, directCount)) * TAU;
      const depthRatio = (((direct * GOLDEN_FRACTION) % 1) - 0.5) * 0.42;
      const planarRadius = directShell * Math.sqrt(Math.max(0.72, 1 - depthRatio * depthRatio));
      const depth = directShell * depthRatio;
      const planarX = Math.cos(angle) * planarRadius;
      const planarY = Math.sin(angle) * planarRadius;

      out[offset] = right.x * planarX + up.x * planarY + towardCamera.x * depth;
      out[offset + 1] = right.y * planarX + up.y * planarY + towardCamera.y * depth;
      out[offset + 2] = right.z * planarX + up.z * planarY + towardCamera.z * depth;
      largestNeighborRadius = Math.max(largestNeighborRadius, this.layout.radii[index]);
    }

    this.relaxContextNodes(out, visible);

    return {
      radius:
        directCount === 0
          ? Math.max(6, this.layout.radii[selectedIndex] * 4)
          : directShell + largestNeighborRadius + 2.8,
      neighborCount: directCount,
    };
  }

  private relaxContextNodes(positions: Float32Array, visible: Uint8Array): void {
    const nodeCount = this.graph.nodes.length;

    for (let iteration = 0; iteration < FOCUS_COLLISION_ITERATIONS; iteration += 1) {
      this.collisionGrid.clear();
      let bucketCount = 0;

      for (let index = 0; index < nodeCount; index += 1) {
        if (visible[index] === 0) continue;
        const offset = index * 3;
        const key = this.collisionKey(
          positions[offset],
          positions[offset + 1],
          positions[offset + 2],
        );
        let bucket = this.collisionGrid.get(key);
        if (!bucket) {
          bucket = this.collisionBuckets[bucketCount] ?? [];
          bucket.length = 0;
          this.collisionBuckets[bucketCount] = bucket;
          bucketCount += 1;
          this.collisionGrid.set(key, bucket);
        }
        bucket.push(index);
      }

      for (let index = 0; index < nodeCount; index += 1) {
        if (visible[index] === 0) continue;
        const offset = index * 3;
        const ix = positions[offset];
        const iy = positions[offset + 1];
        const iz = positions[offset + 2];
        const cx = Math.floor(ix / FOCUS_COLLISION_CELL_SIZE);
        const cy = Math.floor(iy / FOCUS_COLLISION_CELL_SIZE);
        const cz = Math.floor(iz / FOCUS_COLLISION_CELL_SIZE);

        for (let ox = -1; ox <= 1; ox += 1) {
          for (let oy = -1; oy <= 1; oy += 1) {
            for (let oz = -1; oz <= 1; oz += 1) {
              const bucket = this.collisionGrid.get(`${cx + ox}|${cy + oy}|${cz + oz}`);
              if (!bucket) continue;
              for (const other of bucket) {
                if (other <= index) continue;
                const otherOffset = other * 3;
                let dx = positions[otherOffset] - positions[offset];
                let dy = positions[otherOffset + 1] - positions[offset + 1];
                let dz = positions[otherOffset + 2] - positions[offset + 2];
                let distance = Math.hypot(dx, dy, dz);
                const minimum = this.layout.radii[index] + this.layout.radii[other] + 1.15;
                if (distance >= minimum) continue;

                if (distance < 0.0001) {
                  [dx, dy, dz] = fibonacciDirection(other, Math.max(2, nodeCount));
                  distance = 1;
                }
                const isIndexFixed = this.tiers[index] <= 1;
                const isOtherFixed = this.tiers[other] <= 1;
                if (isIndexFixed && isOtherFixed) continue;

                const push = minimum - distance;
                const nx = dx / distance;
                const ny = dy / distance;
                const nz = dz / distance;
                const indexShare = isIndexFixed ? 0 : isOtherFixed ? 1 : 0.5;
                const otherShare = isOtherFixed ? 0 : isIndexFixed ? 1 : 0.5;

                positions[offset] -= nx * push * indexShare;
                positions[offset + 1] -= ny * push * indexShare;
                positions[offset + 2] -= nz * push * indexShare;
                positions[otherOffset] += nx * push * otherShare;
                positions[otherOffset + 1] += ny * push * otherShare;
                positions[otherOffset + 2] += nz * push * otherShare;
              }
            }
          }
        }
      }
    }
  }

  private collisionKey(x: number, y: number, z: number): string {
    return `${Math.floor(x / FOCUS_COLLISION_CELL_SIZE)}|${Math.floor(y / FOCUS_COLLISION_CELL_SIZE)}|${Math.floor(z / FOCUS_COLLISION_CELL_SIZE)}`;
  }
}
