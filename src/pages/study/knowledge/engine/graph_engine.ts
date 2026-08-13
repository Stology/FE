import * as THREE from 'three';

import type { KnowledgeEdgeKind, KnowledgeGraph } from '@/shared/types/stology';

import { LABEL_BUDGET } from './constants';
import { GraphCamera } from './graph_camera';
import { GraphInteraction } from './graph_interaction';
import { GraphLabels, type LabelCandidate } from './graph_labels';
import { GraphPicking } from './graph_picking';
import { GraphRenderer } from './graph_renderer';
import { GraphResources } from './graph_resources';
import { GraphScene } from './graph_scene';
import type { EngineFilters, NodeClickHandler } from './types';

/**
 * 지식 구조 엔진. (레퍼런스 프로토타입 KnowledgeGraphEngine 포팅)
 *
 * React는 "의미 있는 상태"(선택 노드 ID, 필터)만 전달하고, 카메라·포인터·프레임 단위 값은
 * 모두 이 엔진 안에서 관리한다. 애니메이션 루프는 하나이며, 안정 상태에서는 프레임을 줄인다.
 */
export interface CreateGraphEngineOptions {
  container: HTMLElement;
  canvasClassName?: string;
  labelLayer: HTMLElement;
  graph: KnowledgeGraph;
  onNodeClick: NodeClickHandler;
}

export interface GraphEngine {
  dispose: () => void;
  resize: () => void;
  setFilters: (filters: EngineFilters) => void;
  setSelection: (nodeId: string | undefined) => void;
}

const IDLE_FRAME_INTERVAL = 1000 / 22;

const RELATION_EYEBROW: Record<KnowledgeEdgeKind, string> = {
  'based-on': '기반',
  'associated-with': '맥락',
  'advanced-from': '확장',
  'contrasted-with': '대조',
  evidence: '자료',
};

export const createGraphEngine = (options: CreateGraphEngineOptions): GraphEngine => {
  const { container, graph, labelLayer, onNodeClick } = options;

  const resources = new GraphResources({ maxHaloInstances: graph.nodes.length });
  const renderer = new GraphRenderer(container, options.canvasClassName);
  const scene = new GraphScene({ graph, resources });
  const cameraController = new GraphCamera();
  const picking = new GraphPicking();
  const labels = new GraphLabels(labelLayer, LABEL_BUDGET);

  cameraController.setBounds(scene.layout.bounds);
  cameraController.frameAll(scene.layout.bounds, false);

  const relationLabelByIndex = new Array<string>(graph.nodes.length).fill('');
  const relationHighlightIndices: number[] = [];

  const labelCandidates: LabelCandidate[] = graph.nodes.map((node, index) => ({
    eyebrow: '',
    nodeIndex: index,
    priority: 0,
    required: false,
    text:
      node.type === 'material' && node.label.length > 16
        ? `${node.label.slice(0, 15)}…`
        : node.label,
    tone: 'default',
  }));

  let selectedId: string | undefined;
  let hoverId: string | undefined;
  let filters: EngineFilters = { activeOnly: false, week: null };
  let pendingPointer: { x: number; y: number } | undefined;
  let draggingIndex = -1;
  let frameHandle = 0;
  let lastFrameTime = 0;
  let idleAccumulator = 0;
  let dirty = true;
  let disposed = false;

  const tmpVector = new THREE.Vector3();
  const dragRight = new THREE.Vector3();
  const dragUp = new THREE.Vector3();
  const focusRight = new THREE.Vector3();
  const focusUp = new THREE.Vector3();
  const focusTowardCamera = new THREE.Vector3();

  const invalidate = () => {
    dirty = true;
    start();
  };

  const applyHighlightState = () => {
    scene.applyHighlight({
      activeOnly: filters.activeOnly,
      hoverId: hoverId ?? null,
      selectedId: selectedId ?? null,
      week: filters.week,
    });
  };

  const updateRelationEyebrows = () => {
    relationLabelByIndex.fill('');
    relationHighlightIndices.length = 0;
    if (!selectedId) return;

    for (const edge of graph.edges) {
      if (edge.kind === 'evidence') continue;
      let neighborId: string | undefined;
      if (edge.source === selectedId) neighborId = edge.target;
      else if (edge.target === selectedId) neighborId = edge.source;
      if (!neighborId) continue;

      const index = scene.getNodeIndex(neighborId);
      if (index === null) continue;
      relationLabelByIndex[index] = RELATION_EYEBROW[edge.kind];
      relationHighlightIndices.push(index);
    }
    scene.setFloatingNodeIndices(relationHighlightIndices);
  };

  const updateLabelBudget = (neighborCount?: number) => {
    const focusCount = selectedId !== undefined || hoverId !== undefined ? 1 : 0;
    const resolvedNeighborCount =
      neighborCount ??
      (selectedId
        ? scene.getVisibleNeighborCount()
        : hoverId
          ? (scene.getNeighbors(hoverId)?.size ?? 0)
          : 0);
    labels.setBudget(Math.max(LABEL_BUDGET, resolvedNeighborCount + focusCount));
  };

  const retargetFocusLayout = () => {
    if (!selectedId) return;
    cameraController.getViewBasis(focusRight, focusUp, focusTowardCamera);
    const result = scene.transitionToFocus(selectedId, focusRight, focusUp, focusTowardCamera);
    if (!result) return;
    cameraController.frameFocus(result.radius, true);
    updateLabelBudget(result.neighborCount);
  };

  const setSelection = (nodeId: string | undefined) => {
    if (nodeId === selectedId) return;
    selectedId = nodeId;
    hoverId = undefined;
    scene.clearDragOffsets();
    applyHighlightState();
    updateRelationEyebrows();

    if (nodeId) {
      retargetFocusLayout();
    } else {
      scene.transitionToOverview();
      cameraController.frameAll(scene.layout.bounds, true);
      updateLabelBudget(0);
    }
    invalidate();
  };

  const setHover = (nodeId: string | undefined) => {
    if (hoverId === nodeId) return;
    hoverId = nodeId;
    interaction.setNodeHovered(nodeId !== undefined);
    applyHighlightState();
    if (!selectedId) {
      const neighborCount = nodeId ? (scene.getNeighbors(nodeId)?.size ?? 0) : 0;
      updateLabelBudget(neighborCount);
    }
    invalidate();
  };

  const handleTap = (ndcX: number, ndcY: number) => {
    const index = picking.pick(scene, cameraController.camera, ndcX, ndcY);
    if (index === null) {
      if (selectedId !== undefined) {
        setSelection(undefined);
        onNodeClick(undefined);
      }
      return;
    }
    const nodeId = scene.getNodeId(index);
    if (!nodeId || nodeId === selectedId) return;
    setSelection(nodeId);
    onNodeClick(nodeId);
  };

  const handleNodeDrag = (deltaX: number, deltaY: number) => {
    if (draggingIndex < 0) return;
    const { height } = renderer.getSize();
    const distance = cameraController.getDistance();
    const fov = (cameraController.camera.fov * Math.PI) / 180;
    const worldPerPixel = (2 * Math.tan(fov / 2) * distance) / Math.max(1, height);

    cameraController.camera.getWorldDirection(tmpVector);
    dragRight.crossVectors(cameraController.camera.up, tmpVector).normalize();
    dragUp.crossVectors(tmpVector, dragRight).normalize();

    const offsetX = (dragRight.x * -deltaX + dragUp.x * -deltaY) * worldPerPixel;
    const offsetY = (dragRight.y * -deltaX + dragUp.y * -deltaY) * worldPerPixel;
    const offsetZ = (dragRight.z * -deltaX + dragUp.z * -deltaY) * worldPerPixel;
    scene.addDragOffset(draggingIndex, offsetX, offsetY, offsetZ);
  };

  const interaction = new GraphInteraction(renderer.canvas, {
    invalidate,
    isNodeUnderPointer: (ndcX, ndcY) => {
      const index = picking.pick(scene, cameraController.camera, ndcX, ndcY);
      draggingIndex = index ?? -1;
      return index !== null;
    },
    onDoubleTap: () => {
      if (selectedId) {
        setSelection(undefined);
        onNodeClick(undefined);
        return;
      }
      scene.transitionToOverview();
      cameraController.frameAll(scene.layout.bounds, true);
      invalidate();
    },
    onDragNode: handleNodeDrag,
    onDragNodeEnd: () => {
      draggingIndex = -1;
      scene.clearDragOffsets();
      invalidate();
    },
    onOrbit: (deltaX, deltaY) => cameraController.orbit(deltaX, deltaY),
    onPointerLeave: () => {
      pendingPointer = undefined;
      setHover(undefined);
    },
    onPointerMove: (ndcX, ndcY) => {
      pendingPointer = { x: ndcX, y: ndcY };
      invalidate();
    },
    onTap: handleTap,
    onZoom: (factor) => cameraController.zoomBy(factor),
  });

  const buildLabelCandidates = (): LabelCandidate[] => {
    const focusId = selectedId ?? hoverId;
    const focusNeighbors = focusId ? scene.getNeighbors(focusId) : undefined;

    graph.nodes.forEach((node, index) => {
      const candidate = labelCandidates[index];
      candidate.required = false;
      candidate.eyebrow = '';

      if (node.id === focusId) {
        candidate.priority = 100;
        candidate.tone = selectedId ? 'selected' : 'hover';
        candidate.required = true;
        return;
      }
      if (focusNeighbors?.has(node.id)) {
        const relationLabel = relationLabelByIndex[index];
        candidate.priority = relationLabel ? 95 : 90;
        candidate.tone = relationLabel ? 'relation' : 'default';
        candidate.eyebrow = relationLabel;
        candidate.required = true;
        return;
      }
      if (focusId) {
        candidate.priority = -1;
        candidate.tone = 'default';
        return;
      }

      candidate.tone = 'default';
      if (node.type === 'concept' && node.isRoot) {
        candidate.priority = 70;
        return;
      }

      const isActive = node.type === 'concept' && node.state === 'active';
      let priority = node.importance * 4 + Math.min(12, node.degree) + (isActive ? 6 : 0);
      if (node.type === 'material') priority -= 12;
      if (filters.week !== null && node.type === 'concept') {
        if (node.activatedWeek === filters.week) priority += 30;
        else if (node.reinforcedWeeks.includes(filters.week)) priority += 22;
      }
      candidate.priority = priority;
    });

    return labelCandidates;
  };

  const resizeObserver = new ResizeObserver(() => handleResize());

  function handleResize() {
    // 클릭 좌표 변환(GraphInteraction.toNdc)이 canvas 자신의 getBoundingClientRect를 쓰므로,
    // 여기서도 container가 아닌 canvas 기준으로 재서 두 값이 어긋나지 않게 한다
    // (container에 border가 있으면 content-box와 border-box 크기가 미묘하게 달라진다).
    const rect = renderer.canvas.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height);
    cameraController.setViewport(rect.width, rect.height);
    invalidate();
  }

  function start() {
    if (disposed || frameHandle !== 0) return;
    frameHandle = window.requestAnimationFrame(loop);
  }

  function stop() {
    if (frameHandle !== 0) {
      window.cancelAnimationFrame(frameHandle);
      frameHandle = 0;
    }
  }

  function loop(time: number) {
    if (disposed) return;
    frameHandle = window.requestAnimationFrame(loop);

    if (lastFrameTime === 0) lastFrameTime = time;
    const deltaMs = Math.min(64, time - lastFrameTime);
    lastFrameTime = time;
    const delta = deltaMs / 1000;

    if (pendingPointer) {
      const index = picking.pick(
        scene,
        cameraController.camera,
        pendingPointer.x,
        pendingPointer.y,
      );
      pendingPointer = undefined;
      setHover(index === null ? undefined : (scene.getNodeId(index) ?? undefined));
    }

    const cameraMoving = cameraController.update(delta);
    const sceneMoving = scene.update(delta);
    const active = cameraMoving || sceneMoving || dirty;

    if (!active) {
      idleAccumulator += deltaMs;
      if (idleAccumulator < IDLE_FRAME_INTERVAL) return;
      idleAccumulator = 0;
    } else {
      idleAccumulator = 0;
    }

    dirty = false;
    renderer.render(scene.scene, cameraController.camera);
    labels.update(
      buildLabelCandidates(),
      cameraController.camera,
      renderer.getSize(),
      (index, out) => scene.getNodePosition(index, out),
      (index) => scene.getNodeRadius(index),
    );
  }

  resizeObserver.observe(container);
  handleResize();
  applyHighlightState();
  start();

  return {
    dispose: () => {
      disposed = true;
      stop();
      resizeObserver.disconnect();
      interaction.dispose();
      labels.dispose();
      scene.dispose();
      resources.dispose();
      renderer.dispose();
    },
    resize: handleResize,
    setFilters: (nextFilters) => {
      filters = nextFilters;
      applyHighlightState();
      if (selectedId) retargetFocusLayout();
      invalidate();
    },
    setSelection,
  };
};
