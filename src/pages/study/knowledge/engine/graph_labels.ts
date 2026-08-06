import * as THREE from 'three';

/**
 * 라벨 오버레이. (레퍼런스 프로토타입 GraphLabels 포팅)
 *
 * 노드마다 React DOM 라벨을 만들지 않고, 재사용 가능한 DOM 풀 하나를 엔진이 직접 갱신한다.
 * 매 프레임 React State로 좌표를 전달하지 않는다.
 */
export interface LabelCandidate {
  nodeIndex: number;
  text: string;
  eyebrow: string;
  priority: number;
  tone: 'default' | 'selected' | 'hover' | 'relation';
  /** 선택/호버 포커스와 1-hop처럼 겹쳐도 반드시 표시해야 하는 라벨. */
  required: boolean;
}

interface LabelSlot {
  element: HTMLDivElement;
  eyebrowElement: HTMLSpanElement;
  titleElement: HTMLSpanElement;
  text: string;
  eyebrow: string;
  tone: string;
  visible: boolean;
  x: number;
  y: number;
}

export class GraphLabels {
  private readonly layer: HTMLElement;
  private readonly slots: LabelSlot[] = [];
  private readonly projected = new THREE.Vector3();
  private readonly placed: Array<{ x: number; y: number; halfWidth: number }> = [];
  private order: number[] = [];
  private budget: number;

  constructor(layer: HTMLElement, budget: number) {
    this.layer = layer;
    this.budget = budget;
    this.ensureSlots(budget);
  }

  setBudget(budget: number): void {
    this.budget = budget;
    this.ensureSlots(budget);
  }

  private ensureSlots(count: number): void {
    while (this.slots.length < count) {
      const element = document.createElement('div');
      const eyebrowElement = document.createElement('span');
      const titleElement = document.createElement('span');
      element.className = 'graph-label';
      eyebrowElement.className = 'graph-label-eyebrow';
      titleElement.className = 'graph-label-title';
      eyebrowElement.hidden = true;
      element.append(eyebrowElement, titleElement);
      element.style.position = 'absolute';
      element.style.transform = 'translate3d(-9999px, -9999px, 0)';
      element.style.opacity = '0';
      element.setAttribute('aria-hidden', 'true');
      this.layer.appendChild(element);
      this.slots.push({
        element,
        eyebrow: '',
        eyebrowElement,
        text: '',
        titleElement,
        tone: '',
        visible: false,
        x: -9999,
        y: -9999,
      });
    }
  }

  /** 후보 중 우선순위가 높은 순으로 예산만큼만 표시한다. DOM은 값이 바뀐 슬롯만 갱신한다. */
  update(
    candidates: LabelCandidate[],
    camera: THREE.Camera,
    size: { width: number; height: number },
    getPosition: (nodeIndex: number, out: THREE.Vector3) => THREE.Vector3,
    getRadius: (nodeIndex: number) => number,
  ): void {
    if (this.order.length !== candidates.length) {
      this.order = candidates.map((_, index) => index);
    }
    for (let i = 0; i < candidates.length; i += 1) this.order[i] = i;
    this.order.sort((a, b) => candidates[b].priority - candidates[a].priority);

    let slotIndex = 0;
    this.placed.length = 0;
    for (let i = 0; i < this.order.length && slotIndex < this.budget; i += 1) {
      const candidate = candidates[this.order[i]];
      if (candidate.priority < 0) continue;

      getPosition(candidate.nodeIndex, this.projected);
      this.projected.y += getRadius(candidate.nodeIndex) * 1.45;
      this.projected.project(camera);

      if (this.projected.z > 1 || this.projected.z < -1) continue;
      const x = (this.projected.x * 0.5 + 0.5) * size.width;
      const y = (-this.projected.y * 0.5 + 0.5) * size.height;
      if (x < 0 || y < 0 || x > size.width || y > size.height) continue;

      // 일반 라벨만 겹침을 피한다. 포커스와 1-hop 라벨은 깊이상 뒤에 있어도 모두 표시한다.
      const halfWidth = Math.min(88, 8 + candidate.text.length * 6.5);
      let overlaps = false;
      if (!candidate.required) {
        for (const rect of this.placed) {
          if (Math.abs(rect.x - x) < halfWidth + rect.halfWidth && Math.abs(rect.y - y) < 28) {
            overlaps = true;
            break;
          }
        }
      }
      if (overlaps) continue;
      this.placed.push({ halfWidth, x, y });

      const slot = this.slots[slotIndex];
      if (!slot) break;
      slotIndex += 1;

      if (slot.text !== candidate.text) {
        slot.titleElement.textContent = candidate.text;
        slot.text = candidate.text;
      }
      if (slot.eyebrow !== candidate.eyebrow) {
        slot.eyebrowElement.textContent = candidate.eyebrow;
        slot.eyebrowElement.hidden = candidate.eyebrow.length === 0;
        slot.eyebrow = candidate.eyebrow;
      }
      if (slot.tone !== candidate.tone) {
        slot.element.dataset.tone = candidate.tone;
        slot.tone = candidate.tone;
      }
      const nextX = Math.round(x);
      const nextY = Math.round(y);
      if (slot.x !== nextX || slot.y !== nextY) {
        slot.element.style.transform = `translate3d(${nextX}px, ${nextY}px, 0) translate(-50%, -100%)`;
        slot.x = nextX;
        slot.y = nextY;
      }
      if (!slot.visible) {
        slot.element.style.opacity = '1';
        slot.visible = true;
      }
    }

    for (let i = slotIndex; i < this.slots.length; i += 1) {
      const slot = this.slots[i];
      if (slot.visible) {
        slot.element.style.opacity = '0';
        slot.element.style.transform = 'translate3d(-9999px, -9999px, 0)';
        slot.visible = false;
        slot.x = -9999;
        slot.y = -9999;
      }
    }
  }

  dispose(): void {
    this.slots.forEach((slot) => slot.element.remove());
    this.slots.length = 0;
  }
}
