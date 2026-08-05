import type { KnowledgeGraph } from '@/shared/types/stology';

import {
  CLUSTER_ANCHOR_RADIUS,
  CLUSTER_SPREAD,
  CONCEPT_BASE_RADIUS,
  CONCEPT_IMPORTANCE_STEP,
  LAYOUT_SEED,
  MATERIAL_NODE_RADIUS,
  MATERIAL_OUTWARD,
  MIN_GAP,
  RELAX_CELL_SIZE,
  RELAX_ITERATIONS,
  ROOT_NODE_RADIUS,
} from './constants';
import { createRandom, fibonacciDirection, randomPointInSphere } from './random';
import type { Vec3 } from './types';

export interface LayoutResult {
  /** [x0,y0,z0, x1,y1,z1, ...] — 노드 순서는 graph.nodes와 동일하다. */
  positions: Float32Array;
  radii: Float32Array;
  /** 카메라 초기 거리 계산용 최대 반경. */
  bounds: number;
}

export const nodeRadius = (node: KnowledgeGraph['nodes'][number]): number => {
  if (node.type === 'concept' && node.isRoot) return ROOT_NODE_RADIUS;
  if (node.type === 'material') return MATERIAL_NODE_RADIUS;
  return CONCEPT_BASE_RADIUS + node.importance * CONCEPT_IMPORTANCE_STEP;
};

const importanceNorm = (importance: number): number =>
  Math.min(1, Math.max(0, (importance - 1) / 4));

/** 공간 해시 그리드로 최소 간격을 확보한다(O(n²) 전수 비교를 피함). */
const relax = (positions: Float32Array, radii: Float32Array, count: number): void => {
  const key = (x: number, y: number, z: number) =>
    `${Math.floor(x / RELAX_CELL_SIZE)}|${Math.floor(y / RELAX_CELL_SIZE)}|${Math.floor(z / RELAX_CELL_SIZE)}`;

  for (let iteration = 0; iteration < RELAX_ITERATIONS; iteration += 1) {
    const grid = new Map<string, number[]>();
    for (let i = 0; i < count; i += 1) {
      const k = key(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      const bucket = grid.get(k);
      if (bucket) bucket.push(i);
      else grid.set(k, [i]);
    }

    let moved = false;
    for (let i = 0; i < count; i += 1) {
      const ix = positions[i * 3];
      const iy = positions[i * 3 + 1];
      const iz = positions[i * 3 + 2];
      const cx = Math.floor(ix / RELAX_CELL_SIZE);
      const cy = Math.floor(iy / RELAX_CELL_SIZE);
      const cz = Math.floor(iz / RELAX_CELL_SIZE);

      for (let ox = -1; ox <= 1; ox += 1) {
        for (let oy = -1; oy <= 1; oy += 1) {
          for (let oz = -1; oz <= 1; oz += 1) {
            const bucket = grid.get(`${cx + ox}|${cy + oy}|${cz + oz}`);
            if (!bucket) continue;
            for (const j of bucket) {
              if (j <= i) continue;
              const dx = positions[j * 3] - ix;
              const dy = positions[j * 3 + 1] - iy;
              const dz = positions[j * 3 + 2] - iz;
              const distanceSq = dx * dx + dy * dy + dz * dz;
              const minDistance = radii[i] + radii[j] + MIN_GAP;
              if (distanceSq >= minDistance * minDistance || distanceSq === 0) continue;

              const distance = Math.sqrt(distanceSq) || 0.0001;
              const push = (minDistance - distance) / 2;
              const nx = dx / distance;
              const ny = dy / distance;
              const nz = dz / distance;

              positions[i * 3] -= nx * push;
              positions[i * 3 + 1] -= ny * push;
              positions[i * 3 + 2] -= nz * push;
              positions[j * 3] += nx * push;
              positions[j * 3 + 1] += ny * push;
              positions[j * 3 + 2] += nz * push;
              moved = true;
            }
          }
        }
      }
    }
    if (!moved) break;
  }
};

/**
 * 1회성 결정론적 3D 배치. 지속적인 force simulation 없이 seed 기반으로 한 번만 계산한다.
 * 클러스터 앵커는 Fibonacci sphere, 클러스터 내부 노드는 앵커 주변 3D volume에 분산하고,
 * 중요도가 높을수록 중심에 가깝게, 자료 노드는 연결된 concept 바깥쪽 레이어에 놓는다.
 */
export const computeLayout = (graph: KnowledgeGraph, seed: number = LAYOUT_SEED): LayoutResult => {
  const random = createRandom(seed);
  const count = graph.nodes.length;
  const positions = new Float32Array(count * 3);
  const radii = new Float32Array(count);

  const clusterCounts = new Map<string, number>();
  for (const node of graph.nodes) {
    clusterCounts.set(node.clusterId, (clusterCounts.get(node.clusterId) ?? 0) + 1);
  }

  const clusterAnchors = new Map<string, Vec3>();
  graph.clusters.forEach((cluster, index) => {
    const [dx, dy, dz] = fibonacciDirection(index, Math.max(2, graph.clusters.length));
    const size = clusterCounts.get(cluster.id) ?? 1;
    const radius = CLUSTER_ANCHOR_RADIUS + Math.min(14, size * 0.28);
    // y축을 살짝 눌러 완전한 구 표면 배치처럼 보이지 않게 한다.
    clusterAnchors.set(cluster.id, { x: dx * radius, y: dy * radius * 0.72, z: dz * radius });
  });

  const indexById = new Map<string, number>();
  graph.nodes.forEach((node, index) => {
    indexById.set(node.id, index);
    radii[index] = nodeRadius(node);
  });

  // 1) concept 노드 배치
  graph.nodes.forEach((node, index) => {
    if (node.type !== 'concept') return;

    if (node.isRoot) {
      positions[index * 3] = 0;
      positions[index * 3 + 1] = 0;
      positions[index * 3 + 2] = 0;
      return;
    }

    const anchor = clusterAnchors.get(node.clusterId) ?? { x: 0, y: 0, z: 0 };
    const weight = 0.44 + 0.62 * (1 - importanceNorm(node.importance));
    const [jx, jy, jz] = randomPointInSphere(random, CLUSTER_SPREAD);
    // 깊이 레이어: 주차가 뒤일수록 살짝 더 바깥/뒤쪽으로 배치한다.
    const depthBias = (node.week - 3) * 1.35;

    positions[index * 3] = anchor.x * weight + jx;
    positions[index * 3 + 1] = anchor.y * weight + jy * 0.86;
    positions[index * 3 + 2] = anchor.z * weight + jz + depthBias;
  });

  // 2) material 노드는 연결된 concept 평균 위치의 바깥쪽 레이어에 배치
  const evidenceTargetsBySource = new Map<string, string[]>();
  for (const edge of graph.edges) {
    if (edge.kind !== 'evidence') continue;
    const list = evidenceTargetsBySource.get(edge.source);
    if (list) list.push(edge.target);
    else evidenceTargetsBySource.set(edge.source, [edge.target]);
  }

  graph.nodes.forEach((node, index) => {
    if (node.type !== 'material') return;

    const targets = evidenceTargetsBySource.get(node.id) ?? [];
    let cx = 0;
    let cy = 0;
    let cz = 0;
    let found = 0;
    for (const targetId of targets) {
      const targetIndex = indexById.get(targetId);
      if (targetIndex === undefined) continue;
      cx += positions[targetIndex * 3];
      cy += positions[targetIndex * 3 + 1];
      cz += positions[targetIndex * 3 + 2];
      found += 1;
    }
    const center =
      found > 0
        ? { x: cx / found, y: cy / found, z: cz / found }
        : (clusterAnchors.get(node.clusterId) ?? { x: 0, y: 0, z: 0 });

    const [jx, jy, jz] = randomPointInSphere(random, 5.4);
    positions[index * 3] = center.x * MATERIAL_OUTWARD + jx;
    positions[index * 3 + 1] = center.y * MATERIAL_OUTWARD + jy;
    positions[index * 3 + 2] = center.z * MATERIAL_OUTWARD + jz;
  });

  relax(positions, radii, count);

  let bounds = 1;
  for (let index = 0; index < count; index += 1) {
    const length = Math.hypot(
      positions[index * 3],
      positions[index * 3 + 1],
      positions[index * 3 + 2],
    );
    bounds = Math.max(bounds, length + radii[index]);
  }

  return { bounds, positions, radii };
};
