import * as THREE from 'three';

import type { KnowledgeGraph, KnowledgeNode } from '@/shared/types/stology';

import { LAYOUT_SEED, TRANSITION_DURATION } from './constants';
import { GraphFocusLayout, type FocusLayoutResult } from './graph_focus_layout';
import { computeLayout, nodeRadius, type LayoutResult } from './graph_layout';
import {
  lightPalette,
  type GraphPalette,
  type GraphResources,
  type NodeVisualKind,
} from './graph_resources';

/**
 * 씬 구성과 노드/엣지 갱신. (레퍼런스 프로토타입 GraphScene 포팅)
 *
 * - 노드는 유형별 InstancedMesh로 배치 처리하고, 선택/루트 노드만 고해상도 Mesh를 사용한다.
 * - 엣지는 LineSegments 2개(기본/강조)로 배치 처리한다.
 * - 프레임 루프에서 새 객체를 만들지 않도록 임시 벡터/행렬을 재사용한다.
 */

export interface HighlightState {
  selectedId: string | null;
  hoverId: string | null;
  /** '활성 노드만 보기' 필터 — concept 비활성 노드를 숨긴다. */
  activeOnly: boolean;
  week: number | null;
}

export interface FocusTransitionInfo extends FocusLayoutResult {
  selectedIndex: number;
}

const dim = new THREE.Color(0xc9cede);

export class GraphScene {
  readonly scene = new THREE.Scene();
  readonly layout: LayoutResult;

  private readonly graph: KnowledgeGraph;
  private readonly resources: GraphResources;
  private readonly palette: GraphPalette = lightPalette;

  private readonly meshes: Record<NodeVisualKind, THREE.InstancedMesh>;
  private readonly focusMesh: THREE.Mesh;
  private readonly rootMesh: THREE.Mesh;
  private readonly selectedHalo: THREE.Sprite;
  private readonly hoverHalo: THREE.Sprite;
  private readonly weekHalos: THREE.InstancedMesh;
  private readonly edges: THREE.LineSegments;
  private readonly edgeHighlights: THREE.LineSegments;
  private readonly focusLayout: GraphFocusLayout;

  /** 노드별 상태 배열(프레임마다 재할당하지 않는다). */
  private readonly current: Float32Array;
  private readonly transitionStart: Float32Array;
  private readonly target: Float32Array;
  private readonly scaleCurrent: Float32Array;
  private readonly scaleTarget: Float32Array;
  private readonly colorCurrent: Float32Array;
  private readonly colorTarget: Float32Array;
  private readonly dragOffset: Float32Array;
  private readonly floatTarget: Uint8Array;
  private readonly floatStrength: Float32Array;
  private readonly floatOffset: Float32Array;
  private readonly floatPhase: Float32Array;
  private readonly floatPeriod: Float32Array;
  private readonly floatAmplitude: Float32Array;
  private readonly kinds: NodeVisualKind[];
  private readonly instanceIndex: Int32Array;
  private readonly instanceToNode: Record<NodeVisualKind, Int32Array>;
  private readonly visible: Uint8Array;
  private readonly weekHaloNodeIndices: Int32Array;
  private readonly weekHaloScales: Float32Array;
  private readonly indexById = new Map<string, number>();
  private readonly neighbors = new Map<string, Set<string>>();
  private readonly edgePairs: Array<{ a: number; b: number }> = [];

  private rootIndex = -1;
  private selectedIndex = -1;
  private hoverIndex = -1;
  private layoutMode: 'overview' | 'focus' = 'overview';
  private layoutTransitioning = false;
  private layoutTransitionElapsed = 0;
  private visibleNeighborCount = 0;
  private weekHaloCount = 0;
  private floatingNodeCount = 0;
  private floatElapsed = 0;
  private highlight: HighlightState = {
    activeOnly: false,
    hoverId: null,
    selectedId: null,
    week: null,
  };

  private readonly tmpMatrix = new THREE.Matrix4();
  private readonly tmpVector = new THREE.Vector3();
  private readonly tmpColor = new THREE.Color();
  private readonly tmpColorB = new THREE.Color();
  private readonly floatRight = new THREE.Vector3(1, 0, 0);
  private readonly floatUp = new THREE.Vector3(0, 1, 0);
  private readonly floatTowardCamera = new THREE.Vector3(0, 0, 1);

  constructor(options: { graph: KnowledgeGraph; resources: GraphResources; seed?: number }) {
    this.graph = options.graph;
    this.resources = options.resources;
    this.layout = computeLayout(options.graph, options.seed ?? LAYOUT_SEED);
    this.focusLayout = new GraphFocusLayout(options.graph, this.layout);

    const count = options.graph.nodes.length;
    this.current = new Float32Array(count * 3);
    this.transitionStart = new Float32Array(count * 3);
    this.target = new Float32Array(this.layout.positions);
    this.scaleCurrent = new Float32Array(count);
    this.scaleTarget = new Float32Array(count);
    this.colorCurrent = new Float32Array(count * 3);
    this.colorTarget = new Float32Array(count * 3);
    this.dragOffset = new Float32Array(count * 3);
    this.floatTarget = new Uint8Array(count);
    this.floatStrength = new Float32Array(count);
    this.floatOffset = new Float32Array(count * 3);
    this.floatPhase = new Float32Array(count);
    this.floatPeriod = new Float32Array(count);
    this.floatAmplitude = new Float32Array(count);
    this.kinds = new Array<NodeVisualKind>(count);
    this.instanceIndex = new Int32Array(count);
    this.visible = new Uint8Array(count).fill(1);
    this.weekHaloNodeIndices = new Int32Array(count).fill(-1);
    this.weekHaloScales = new Float32Array(count);

    for (let index = 0; index < count; index += 1) {
      this.floatPhase[index] = (index * 2.399963229728653) % (Math.PI * 2);
      this.floatPeriod[index] = 2.8 + (((index * 37) % 17) / 17) * 1.6;
      this.floatAmplitude[index] = 0.12 + (((index * 29) % 13) / 13) * 0.12;
    }

    // 조명: hemisphere + key + fill + rim. 노드마다 광원을 만들지 않는다.
    const hemisphere = new THREE.HemisphereLight(0xf3f5ff, 0x2b2f45, 0.82);
    const key = new THREE.DirectionalLight(0xffffff, 1.16);
    key.position.set(-42, 58, 46);
    const fill = new THREE.DirectionalLight(0xdfe6ff, 0.34);
    fill.position.set(46, -18, 28);
    const rim = new THREE.DirectionalLight(0xc9d4ff, 0.42);
    rim.position.set(12, 26, -62);
    this.scene.add(hemisphere, key, fill, rim);

    const counts: Record<NodeVisualKind, number> = { concept: 0, material: 0, neutral: 0 };
    options.graph.nodes.forEach((node, index) => {
      const kind = this.kindOf(node);
      this.kinds[index] = kind;
      this.instanceIndex[index] = counts[kind];
      counts[kind] += 1;
      this.indexById.set(node.id, index);
      if (node.type === 'concept' && node.isRoot) this.rootIndex = index;
    });

    this.meshes = {
      concept: new THREE.InstancedMesh(
        options.resources.nodeGeometry,
        options.resources.nodeMaterials.concept,
        Math.max(1, counts.concept),
      ),
      material: new THREE.InstancedMesh(
        options.resources.nodeGeometry,
        options.resources.nodeMaterials.material,
        Math.max(1, counts.material),
      ),
      neutral: new THREE.InstancedMesh(
        options.resources.nodeGeometry,
        options.resources.nodeMaterials.neutral,
        Math.max(1, counts.neutral),
      ),
    };

    this.instanceToNode = {
      concept: new Int32Array(Math.max(1, counts.concept)).fill(-1),
      material: new Int32Array(Math.max(1, counts.material)).fill(-1),
      neutral: new Int32Array(Math.max(1, counts.neutral)).fill(-1),
    };
    options.graph.nodes.forEach((_node, index) => {
      this.instanceToNode[this.kinds[index]][this.instanceIndex[index]] = index;
    });

    Object.values(this.meshes).forEach((mesh) => {
      mesh.frustumCulled = false;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      this.scene.add(mesh);
    });

    this.focusMesh = new THREE.Mesh(
      options.resources.focusGeometry,
      options.resources.focusMaterial,
    );
    this.focusMesh.visible = false;
    // 선택되기 전까지는 원점(그래프 중심)에 기본 스케일(1)로 남아있는 "유령 구"가 되어
    // 레이캐스팅을 오염시킬 수 있으므로 명시적으로 0 스케일로 치워둔다.
    this.focusMesh.scale.setScalar(0.0001);
    this.focusMesh.frustumCulled = false;
    this.rootMesh = new THREE.Mesh(options.resources.focusGeometry, options.resources.rootMaterial);
    this.rootMesh.frustumCulled = false;
    this.scene.add(this.focusMesh, this.rootMesh);

    this.selectedHalo = new THREE.Sprite(options.resources.haloMaterials.selected);
    this.selectedHalo.visible = false;
    this.hoverHalo = new THREE.Sprite(options.resources.haloMaterials.hover);
    this.hoverHalo.visible = false;
    this.weekHalos = new THREE.InstancedMesh(
      options.resources.weekHaloGeometry,
      options.resources.weekHaloMaterial,
      Math.max(1, count),
    );
    this.weekHalos.count = 0;
    this.weekHalos.frustumCulled = false;
    this.weekHalos.renderOrder = 1;
    this.scene.add(this.weekHalos, this.selectedHalo, this.hoverHalo);

    for (const edge of options.graph.edges) {
      const a = this.indexById.get(edge.source);
      const b = this.indexById.get(edge.target);
      if (a === undefined || b === undefined) continue;
      this.edgePairs.push({ a, b });

      const sourceSet = this.neighbors.get(edge.source) ?? new Set<string>();
      sourceSet.add(edge.target);
      this.neighbors.set(edge.source, sourceSet);
      const targetSet = this.neighbors.get(edge.target) ?? new Set<string>();
      targetSet.add(edge.source);
      this.neighbors.set(edge.target, targetSet);
    }

    const edgeGeometry = new THREE.BufferGeometry();
    edgeGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(this.edgePairs.length * 6), 3).setUsage(
        THREE.DynamicDrawUsage,
      ),
    );
    edgeGeometry.setAttribute(
      'color',
      new THREE.BufferAttribute(new Float32Array(this.edgePairs.length * 6), 3).setUsage(
        THREE.DynamicDrawUsage,
      ),
    );
    this.edges = new THREE.LineSegments(edgeGeometry, options.resources.edgeMaterial);
    this.edges.frustumCulled = false;
    this.scene.add(this.edges);

    const highlightGeometry = new THREE.BufferGeometry();
    highlightGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(this.edgePairs.length * 6), 3).setUsage(
        THREE.DynamicDrawUsage,
      ),
    );
    highlightGeometry.setDrawRange(0, 0);
    this.edgeHighlights = new THREE.LineSegments(
      highlightGeometry,
      options.resources.edgeHighlightMaterial,
    );
    this.edgeHighlights.frustumCulled = false;
    this.scene.add(this.edgeHighlights);

    this.initialiseNodeState();
    this.applyHighlight(this.highlight);
    this.writeInstances();
    this.writeEdgeColors();
    this.writeEdgePositions();
  }

  private kindOf(node: KnowledgeNode): NodeVisualKind {
    if (node.type === 'material') return 'material';
    return node.state === 'active' ? 'concept' : 'neutral';
  }

  private initialiseNodeState(): void {
    this.graph.nodes.forEach((node, index) => {
      const radius = nodeRadius(node);
      this.scaleTarget[index] = radius;
      // 등장 애니메이션: 중심 쪽에서 목표 위치로 부드럽게 이동한다.
      this.current[index * 3] = this.target[index * 3] * 0.62;
      this.current[index * 3 + 1] = this.target[index * 3 + 1] * 0.62;
      this.current[index * 3 + 2] = this.target[index * 3 + 2] * 0.62;
      this.scaleCurrent[index] = radius * 0.25;
    });
    this.transitionStart.set(this.current);
    this.layoutTransitioning = true;
    this.layoutTransitionElapsed = 0;
  }

  private baseColor(node: KnowledgeNode, out: THREE.Color): THREE.Color {
    if (node.type === 'material') return out.setHex(this.palette.material);
    if (node.state !== 'active') return out.setHex(this.palette.inactive);
    // 활성 강도: 연결된 자료 수가 많을수록 색이 진해진다.
    const intensity = Math.min(1, node.materialCount / 4);
    out.setHex(this.palette.activeSoft);
    this.tmpColorB.setHex(this.palette.active);
    return out.lerp(this.tmpColorB, 0.25 + intensity * 0.75);
  }

  getNodeIndex(nodeId: string): number | null {
    const index = this.indexById.get(nodeId);
    return index === undefined ? null : index;
  }

  getNodeId(index: number): string | null {
    return this.graph.nodes[index]?.id ?? null;
  }

  getNodePosition(index: number, out: THREE.Vector3): THREE.Vector3 {
    return out.set(
      this.current[index * 3] + this.floatOffset[index * 3],
      this.current[index * 3 + 1] + this.floatOffset[index * 3 + 1],
      this.current[index * 3 + 2] + this.floatOffset[index * 3 + 2],
    );
  }

  getNodeRadius(index: number): number {
    return this.scaleCurrent[index];
  }

  getNeighbors(nodeId: string): Set<string> | undefined {
    return this.neighbors.get(nodeId);
  }

  getVisibleNeighborCount(): number {
    return this.visibleNeighborCount;
  }

  setFloatingNodeIndices(indices: number[]): void {
    this.floatTarget.fill(0);
    for (const index of indices) {
      if (
        index < 0 ||
        index >= this.floatTarget.length ||
        index === this.selectedIndex ||
        this.visible[index] === 0
      ) {
        continue;
      }
      this.floatTarget[index] = 1;
    }
    this.updateFloatingNodeCount();
  }

  private updateFloatingNodeCount(): void {
    let count = 0;
    for (let index = 0; index < this.floatTarget.length; index += 1) {
      if (this.floatTarget[index] === 1) count += 1;
    }
    this.floatingNodeCount = count;
  }

  transitionToFocus(
    nodeId: string,
    right: THREE.Vector3,
    up: THREE.Vector3,
    towardCamera: THREE.Vector3,
  ): FocusTransitionInfo | null {
    const selectedIndex = this.indexById.get(nodeId);
    if (selectedIndex === undefined) return null;

    this.floatRight.copy(right);
    this.floatUp.copy(up);
    this.floatTowardCamera.copy(towardCamera);
    this.transitionStart.set(this.current);
    const result = this.focusLayout.plan(
      selectedIndex,
      this.visible,
      right,
      up,
      towardCamera,
      this.target,
    );
    this.layoutMode = 'focus';
    this.visibleNeighborCount = result.neighborCount;
    this.beginLayoutTransition();
    return { ...result, selectedIndex };
  }

  transitionToOverview(): void {
    this.transitionStart.set(this.current);
    this.target.set(this.layout.positions);
    this.layoutMode = 'overview';
    this.visibleNeighborCount = 0;
    this.beginLayoutTransition();
  }

  private beginLayoutTransition(): void {
    this.layoutTransitionElapsed = 0;
    this.layoutTransitioning = true;
  }

  getMeshes(): THREE.InstancedMesh[] {
    return [this.meshes.concept, this.meshes.material, this.meshes.neutral];
  }

  getFocusMeshes(): THREE.Mesh[] {
    return [this.focusMesh, this.rootMesh];
  }

  resolveInstance(mesh: THREE.Object3D, instanceId: number): number | null {
    let kind: NodeVisualKind | null = null;
    if (mesh === this.meshes.concept) kind = 'concept';
    else if (mesh === this.meshes.material) kind = 'material';
    else if (mesh === this.meshes.neutral) kind = 'neutral';
    if (!kind) return null;

    const index = this.instanceToNode[kind][instanceId];
    if (index === undefined || index < 0) return null;
    return this.visible[index] === 1 ? index : null;
  }

  resolveFocusMesh(mesh: THREE.Object3D): number | null {
    if (mesh === this.focusMesh && this.selectedIndex >= 0) return this.selectedIndex;
    if (mesh === this.rootMesh && this.rootIndex >= 0) return this.rootIndex;
    return null;
  }

  addDragOffset(index: number, x: number, y: number, z: number): void {
    this.dragOffset[index * 3] += x;
    this.dragOffset[index * 3 + 1] += y;
    this.dragOffset[index * 3 + 2] += z;
  }

  clearDragOffsets(): void {
    this.dragOffset.fill(0);
  }

  /** 선택/호버/필터 상태를 색상·크기 목표값으로 반영한다. */
  applyHighlight(state: HighlightState): void {
    this.highlight = state;
    this.selectedIndex = state.selectedId ? (this.indexById.get(state.selectedId) ?? -1) : -1;
    this.hoverIndex = state.hoverId ? (this.indexById.get(state.hoverId) ?? -1) : -1;

    const focusId = state.selectedId ?? state.hoverId;
    const related = focusId ? this.neighbors.get(focusId) : undefined;
    this.weekHaloCount = 0;

    this.graph.nodes.forEach((node, index) => {
      const isInactiveConcept = node.type === 'concept' && node.state === 'inactive';
      const hidden = state.activeOnly && isInactiveConcept && node.id !== state.selectedId;
      this.visible[index] = hidden ? 0 : 1;

      this.baseColor(node, this.tmpColor);

      if (state.week !== null && node.type === 'concept') {
        const isFresh = node.activatedWeek === state.week;
        const isReinforced = !isFresh && node.reinforcedWeeks.includes(state.week);
        if (isFresh) this.tmpColor.setHex(this.palette.fresh);
        else if (isReinforced) this.tmpColor.setHex(this.palette.reinforced);
        else this.tmpColor.lerp(dim, 0.68);

        if (isFresh || isReinforced) {
          const haloIndex = this.weekHaloCount;
          this.weekHaloNodeIndices[haloIndex] = index;
          this.weekHaloScales[haloIndex] = isFresh ? 5.8 : 4.9;
          this.resources.weekHaloStrength.setX(haloIndex, isFresh ? 1 : 0.68);
          this.weekHaloCount += 1;
        }
      }

      const isFocus = focusId === node.id;
      const isRelated = related?.has(node.id) ?? false;

      if (state.selectedId) {
        if (!isFocus && !isRelated) this.tmpColor.lerp(dim, 0.65);
      } else if (state.hoverId && !isFocus && !isRelated) {
        this.tmpColor.lerp(dim, 0.55);
      }

      this.colorTarget[index * 3] = this.tmpColor.r;
      this.colorTarget[index * 3 + 1] = this.tmpColor.g;
      this.colorTarget[index * 3 + 2] = this.tmpColor.b;

      let scale = nodeRadius(node);
      if (index === this.selectedIndex) scale *= 1.1;
      else if (index === this.hoverIndex) scale *= 1.04;
      else if (isRelated) scale *= 1.07;
      this.scaleTarget[index] = hidden ? 0.0001 : scale;
    });

    this.focusMesh.visible = this.selectedIndex >= 0 && this.selectedIndex !== this.rootIndex;
    this.weekHalos.count = this.weekHaloCount;
    this.resources.weekHaloStrength.needsUpdate = true;
    this.selectedHalo.visible = this.selectedIndex >= 0;
    this.hoverHalo.visible = this.hoverIndex >= 0 && this.hoverIndex !== this.selectedIndex;
    this.writeHighlightEdges();
  }

  private writeHighlightEdges(): void {
    const focusIndex = this.selectedIndex >= 0 ? this.selectedIndex : this.hoverIndex;
    const geometry = this.edgeHighlights.geometry;
    const positions = geometry.getAttribute('position') as THREE.BufferAttribute;

    if (focusIndex < 0) {
      geometry.setDrawRange(0, 0);
      this.resources.edgeMaterial.opacity = 0.62;
      return;
    }

    this.resources.edgeMaterial.opacity = 0.3;
    let vertexCount = 0;
    for (const pair of this.edgePairs) {
      if (pair.a !== focusIndex && pair.b !== focusIndex) continue;
      if (this.visible[pair.a] === 0 || this.visible[pair.b] === 0) continue;
      this.writeEdgeSegment(positions, vertexCount, pair.a, pair.b);
      vertexCount += 2;
    }
    positions.needsUpdate = true;
    geometry.setDrawRange(0, vertexCount);
  }

  /** 구체 표면 근처에서 시작하도록 선분 양 끝을 반지름만큼 줄인다. */
  private writeEdgeSegment(
    attribute: THREE.BufferAttribute,
    vertexOffset: number,
    a: number,
    b: number,
  ): void {
    this.getNodePosition(a, this.tmpVector);
    const ax = this.tmpVector.x;
    const ay = this.tmpVector.y;
    const az = this.tmpVector.z;
    this.getNodePosition(b, this.tmpVector);
    const bx = this.tmpVector.x;
    const by = this.tmpVector.y;
    const bz = this.tmpVector.z;

    const dx = bx - ax;
    const dy = by - ay;
    const dz = bz - az;
    const length = Math.hypot(dx, dy, dz) || 1;
    const nx = dx / length;
    const ny = dy / length;
    const nz = dz / length;
    const startOffset = this.scaleCurrent[a] * 0.94;
    const endOffset = this.scaleCurrent[b] * 0.94;

    attribute.setXYZ(
      vertexOffset,
      ax + nx * startOffset,
      ay + ny * startOffset,
      az + nz * startOffset,
    );
    attribute.setXYZ(
      vertexOffset + 1,
      bx - nx * endOffset,
      by - ny * endOffset,
      bz - nz * endOffset,
    );
  }

  private writeEdgeColors(): void {
    const colors = this.edges.geometry.getAttribute('color') as THREE.BufferAttribute;
    const edgeColor = this.tmpColor.setHex(this.palette.edge);
    this.graph.edges.forEach((edge, edgeIndex) => {
      const vertex = edgeIndex * 2;
      const isEvidence = edge.kind === 'evidence';
      const r = isEvidence ? edgeColor.r * 0.84 : edgeColor.r;
      const g = isEvidence ? edgeColor.g * 0.96 : edgeColor.g;
      const b = isEvidence ? Math.min(1, edgeColor.b * 1.08) : edgeColor.b;
      colors.setXYZ(vertex, r, g, b);
      colors.setXYZ(vertex + 1, r, g, b);
    });
    colors.needsUpdate = true;
  }

  private writeEdgePositions(): void {
    const positions = this.edges.geometry.getAttribute('position') as THREE.BufferAttribute;
    let vertex = 0;
    for (const pair of this.edgePairs) {
      if (this.visible[pair.a] === 0 || this.visible[pair.b] === 0) {
        positions.setXYZ(vertex, 0, 0, 0);
        positions.setXYZ(vertex + 1, 0, 0, 0);
      } else {
        this.writeEdgeSegment(positions, vertex, pair.a, pair.b);
      }
      vertex += 2;
    }
    positions.needsUpdate = true;
    this.edges.geometry.setDrawRange(0, this.edgePairs.length * 2);
  }

  private writeInstances(): void {
    const colorHelper = this.tmpColor;
    this.graph.nodes.forEach((_node, index) => {
      const kind = this.kinds[index];
      const mesh = this.meshes[kind];
      const instance = this.instanceIndex[index];
      const isSelected = index === this.selectedIndex;
      const isRoot = index === this.rootIndex;

      const scale = isSelected || isRoot ? 0.0001 : this.scaleCurrent[index];
      this.getNodePosition(index, this.tmpVector);
      this.tmpMatrix.makeScale(scale, scale, scale);
      this.tmpMatrix.setPosition(this.tmpVector);
      mesh.setMatrixAt(instance, this.tmpMatrix);

      colorHelper.setRGB(
        this.colorCurrent[index * 3],
        this.colorCurrent[index * 3 + 1],
        this.colorCurrent[index * 3 + 2],
      );
      mesh.setColorAt(instance, colorHelper);
    });

    Object.values(this.meshes).forEach((mesh) => {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });

    for (let haloIndex = 0; haloIndex < this.weekHaloCount; haloIndex += 1) {
      const nodeIndex = this.weekHaloNodeIndices[haloIndex];
      const haloScale = this.scaleCurrent[nodeIndex] * this.weekHaloScales[haloIndex];
      this.getNodePosition(nodeIndex, this.tmpVector);
      this.tmpMatrix.makeScale(haloScale, haloScale, haloScale);
      this.tmpMatrix.setPosition(this.tmpVector);
      this.weekHalos.setMatrixAt(haloIndex, this.tmpMatrix);
    }
    this.weekHalos.instanceMatrix.needsUpdate = true;

    if (this.rootIndex >= 0) {
      const scale = this.scaleCurrent[this.rootIndex];
      this.getNodePosition(this.rootIndex, this.tmpVector);
      this.rootMesh.position.copy(this.tmpVector);
      this.rootMesh.scale.setScalar(scale);
      this.resources.rootMaterial.color.setRGB(
        this.colorCurrent[this.rootIndex * 3],
        this.colorCurrent[this.rootIndex * 3 + 1],
        this.colorCurrent[this.rootIndex * 3 + 2],
      );
    }

    if (this.selectedIndex >= 0) {
      const scale = this.scaleCurrent[this.selectedIndex];
      this.getNodePosition(this.selectedIndex, this.tmpVector);
      if (this.selectedIndex === this.rootIndex) {
        this.rootMesh.position.copy(this.tmpVector);
        this.rootMesh.scale.setScalar(scale);
      } else {
        this.focusMesh.position.copy(this.tmpVector);
        this.focusMesh.scale.setScalar(scale);
        this.resources.focusMaterial.color.setRGB(
          this.colorCurrent[this.selectedIndex * 3],
          this.colorCurrent[this.selectedIndex * 3 + 1],
          this.colorCurrent[this.selectedIndex * 3 + 2],
        );
      }
      this.selectedHalo.position.copy(this.tmpVector);
      this.selectedHalo.scale.setScalar(scale * 5.2);
    }

    if (this.hoverIndex >= 0 && this.hoverIndex !== this.selectedIndex) {
      this.getNodePosition(this.hoverIndex, this.tmpVector);
      this.hoverHalo.position.copy(this.tmpVector);
      this.hoverHalo.scale.setScalar(this.scaleCurrent[this.hoverIndex] * 4.1);
    }
  }

  /**
   * 프레임 업데이트.
   * @returns 아직 움직이는 중이면 true
   */
  update(delta: number): boolean {
    const steps = Math.min(3, Math.max(0.4, delta * 60));
    let moving = false;
    let layoutEase = 1;
    let applyLayoutTween = false;

    if (this.layoutTransitioning) {
      applyLayoutTween = true;
      this.layoutTransitionElapsed = Math.min(
        TRANSITION_DURATION,
        this.layoutTransitionElapsed + delta,
      );
      const progress = this.layoutTransitionElapsed / TRANSITION_DURATION;
      layoutEase = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      this.layoutTransitioning = progress < 1;
      moving = this.layoutTransitioning;
    }

    for (let index = 0; index < this.scaleCurrent.length; index += 1) {
      for (let axis = 0; axis < 3; axis += 1) {
        const offset = index * 3 + axis;
        const drag = this.dragOffset[offset];
        if (applyLayoutTween) {
          this.current[offset] =
            this.transitionStart[offset] +
            (this.target[offset] - this.transitionStart[offset]) * layoutEase +
            drag;
        } else {
          const goal = this.target[offset] + drag;
          const diff = goal - this.current[offset];
          if (Math.abs(diff) <= 0.002) {
            this.current[offset] = goal;
          } else {
            this.current[offset] += diff * Math.min(1, 0.2 * steps);
            moving = true;
          }
        }
      }

      const scaleDiff = this.scaleTarget[index] - this.scaleCurrent[index];
      if (Math.abs(scaleDiff) > 0.0008) {
        this.scaleCurrent[index] += scaleDiff * Math.min(1, 0.18 * steps);
        moving = true;
      } else {
        this.scaleCurrent[index] = this.scaleTarget[index];
      }

      for (let channel = 0; channel < 3; channel += 1) {
        const offset = index * 3 + channel;
        const colorDiff = this.colorTarget[offset] - this.colorCurrent[offset];
        if (Math.abs(colorDiff) > 0.002) {
          this.colorCurrent[offset] += colorDiff * Math.min(1, 0.2 * steps);
          moving = true;
        } else {
          this.colorCurrent[offset] = this.colorTarget[offset];
        }
      }
    }

    this.floatElapsed = (this.floatElapsed + delta) % 3600;
    for (let index = 0; index < this.floatStrength.length; index += 1) {
      const target = this.floatTarget[index];
      const diff = target - this.floatStrength[index];
      if (Math.abs(diff) > 0.0008) {
        this.floatStrength[index] += diff * Math.min(1, 0.28 * steps);
        moving = true;
      } else {
        this.floatStrength[index] = target;
      }

      const strength = this.floatStrength[index];
      const offset = index * 3;
      if (strength <= 0.0008) {
        this.floatOffset[offset] = 0;
        this.floatOffset[offset + 1] = 0;
        this.floatOffset[offset + 2] = 0;
        continue;
      }

      const phase = this.floatPhase[index];
      const period = this.floatPeriod[index];
      const amplitude = this.floatAmplitude[index] * strength;
      const wave = Math.sin(this.floatElapsed * ((Math.PI * 2) / period) + phase);
      const sway = Math.sin(this.floatElapsed * ((Math.PI * 2) / (period * 1.37)) + phase * 0.61);
      const depth = Math.sin(this.floatElapsed * ((Math.PI * 2) / (period * 1.81)) + phase * 1.19);

      this.floatOffset[offset] =
        this.floatUp.x * amplitude * wave +
        this.floatRight.x * amplitude * 0.32 * sway +
        this.floatTowardCamera.x * amplitude * 0.18 * depth;
      this.floatOffset[offset + 1] =
        this.floatUp.y * amplitude * wave +
        this.floatRight.y * amplitude * 0.32 * sway +
        this.floatTowardCamera.y * amplitude * 0.18 * depth;
      this.floatOffset[offset + 2] =
        this.floatUp.z * amplitude * wave +
        this.floatRight.z * amplitude * 0.32 * sway +
        this.floatTowardCamera.z * amplitude * 0.18 * depth;

      if (target === 1) moving = true;
    }

    this.writeInstances();
    this.writeEdgePositions();
    this.writeHighlightEdges();
    return moving;
  }

  dispose(): void {
    this.edges.geometry.dispose();
    this.edgeHighlights.geometry.dispose();
    Object.values(this.meshes).forEach((mesh) => {
      mesh.dispose();
      this.scene.remove(mesh);
    });
    this.weekHalos.dispose();
    this.scene.remove(
      this.focusMesh,
      this.rootMesh,
      this.weekHalos,
      this.selectedHalo,
      this.hoverHalo,
      this.edges,
      this.edgeHighlights,
    );
    this.scene.clear();
  }
}
