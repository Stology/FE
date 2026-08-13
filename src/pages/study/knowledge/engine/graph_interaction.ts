import { CLICK_MOVE_TOLERANCE_PX } from './constants';

/**
 * 포인터 입력 처리. (레퍼런스 프로토타입 GraphInteraction 포팅)
 *
 * - 빈 공간 드래그: 카메라 회전 / 노드 드래그: 일시 이동(놓으면 원위치)
 * - 휠: 줌, 두 손가락 핀치: 줌
 * - 클릭(이동량이 작을 때)만 선택으로 처리하고, 더블탭은 전체 보기로 리셋한다.
 */
export interface InteractionCallbacks {
  onOrbit: (deltaX: number, deltaY: number) => void;
  onZoom: (factor: number) => void;
  onPointerMove: (ndcX: number, ndcY: number) => void;
  onPointerLeave: () => void;
  onTap: (ndcX: number, ndcY: number) => void;
  onDoubleTap: () => void;
  onDragNode: (deltaX: number, deltaY: number) => void;
  onDragNodeEnd: () => void;
  isNodeUnderPointer: (ndcX: number, ndcY: number) => boolean;
  invalidate: () => void;
}

interface PointerRecord {
  id: number;
  x: number;
  y: number;
}

export class GraphInteraction {
  private readonly element: HTMLElement;
  private readonly callbacks: InteractionCallbacks;
  private readonly pointers: PointerRecord[] = [];
  private mode: 'idle' | 'orbit' | 'node' | 'pinch' = 'idle';
  private moved = 0;
  private startX = 0;
  private startY = 0;
  private lastX = 0;
  private lastY = 0;
  private pinchDistance = 0;
  private lastTapTime = 0;
  private hoveringNode = false;

  constructor(element: HTMLElement, callbacks: InteractionCallbacks) {
    this.element = element;
    this.callbacks = callbacks;

    element.addEventListener('pointerdown', this.handlePointerDown);
    element.addEventListener('pointermove', this.handlePointerMove);
    element.addEventListener('pointerup', this.handlePointerUp);
    element.addEventListener('pointercancel', this.handlePointerCancel);
    element.addEventListener('pointerleave', this.handlePointerLeave);
    element.addEventListener('wheel', this.handleWheel, { passive: false });
    element.addEventListener('dblclick', this.handleDoubleClick);
    element.addEventListener('contextmenu', this.handleContextMenu);
    this.updateCursor();
  }

  private updateCursor(): void {
    const cursor = this.mode === 'idle' ? (this.hoveringNode ? 'pointer' : 'grab') : 'grabbing';
    if (this.element.style.cursor !== cursor) this.element.style.cursor = cursor;
  }

  setNodeHovered(value: boolean): void {
    this.hoveringNode = value;
    this.updateCursor();
  }

  private toNdc(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.element.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 2 - 1,
      y: -(((clientY - rect.top) / rect.height) * 2 - 1),
    };
  }

  private handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
  };

  private handlePointerDown = (event: PointerEvent) => {
    this.element.setPointerCapture(event.pointerId);
    this.pointers.push({ id: event.pointerId, x: event.clientX, y: event.clientY });
    this.moved = 0;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.lastX = event.clientX;
    this.lastY = event.clientY;

    if (this.pointers.length === 2) {
      this.mode = 'pinch';
      this.pinchDistance = this.currentPinchDistance();
      this.updateCursor();
      return;
    }

    const ndc = this.toNdc(event.clientX, event.clientY);
    this.mode = this.callbacks.isNodeUnderPointer(ndc.x, ndc.y) ? 'node' : 'orbit';
    this.updateCursor();
  };

  private currentPinchDistance(): number {
    if (this.pointers.length < 2) return 0;
    const [a, b] = this.pointers;
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  private handlePointerMove = (event: PointerEvent) => {
    const record = this.pointers.find((pointer) => pointer.id === event.pointerId);
    if (record) {
      record.x = event.clientX;
      record.y = event.clientY;
    }

    if (this.mode === 'pinch') {
      const distance = this.currentPinchDistance();
      if (this.pinchDistance > 0 && distance > 0) {
        this.callbacks.onZoom(this.pinchDistance / distance);
        this.pinchDistance = distance;
      }
      return;
    }

    if (this.mode === 'idle') {
      const ndc = this.toNdc(event.clientX, event.clientY);
      this.callbacks.onPointerMove(ndc.x, ndc.y);
      return;
    }

    const deltaX = event.clientX - this.lastX;
    const deltaY = event.clientY - this.lastY;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    // 클릭-vs-드래그 판정은 시작점 기준 순 이동거리로 본다. 프레임별 델타를 그대로 누적하면
    // 클릭 순간의 미세한 손떨림(왔다갔다하는 값도 서로 상쇄되지 않고 계속 더해짐)만으로도
    // 금방 드래그로 오인되어 클릭이 씹히는 문제가 있었다.
    this.moved = Math.max(
      this.moved,
      Math.hypot(event.clientX - this.startX, event.clientY - this.startY),
    );

    if (this.mode === 'orbit') this.callbacks.onOrbit(deltaX, deltaY);
    if (this.mode === 'node') this.callbacks.onDragNode(deltaX, deltaY);
    this.callbacks.invalidate();
  };

  private handlePointerUp = (event: PointerEvent) => {
    const index = this.pointers.findIndex((pointer) => pointer.id === event.pointerId);
    if (index >= 0) this.pointers.splice(index, 1);
    if (this.element.hasPointerCapture(event.pointerId)) {
      this.element.releasePointerCapture(event.pointerId);
    }

    const previousMode = this.mode;
    this.mode = previousMode === 'pinch' && this.pointers.length > 0 ? 'pinch' : 'idle';

    if (previousMode === 'node') this.callbacks.onDragNodeEnd();

    if (previousMode !== 'pinch' && this.moved < CLICK_MOVE_TOLERANCE_PX) {
      const ndc = this.toNdc(event.clientX, event.clientY);
      const now = performance.now();
      if (now - this.lastTapTime < 280) {
        this.callbacks.onDoubleTap();
        this.lastTapTime = 0;
      } else {
        this.callbacks.onTap(ndc.x, ndc.y);
        this.lastTapTime = now;
      }
    }
    this.moved = 0;
    this.updateCursor();
  };

  private releaseCapturedPointers(): void {
    for (const pointer of this.pointers) {
      if (this.element.hasPointerCapture(pointer.id)) {
        this.element.releasePointerCapture(pointer.id);
      }
    }
  }

  private cancelGesture(): void {
    const wasDraggingNode = this.mode === 'node';
    this.releaseCapturedPointers();
    this.pointers.length = 0;
    this.mode = 'idle';
    this.moved = 0;
    this.pinchDistance = 0;
    this.hoveringNode = false;
    if (wasDraggingNode) this.callbacks.onDragNodeEnd();
    this.callbacks.onPointerLeave();
    this.updateCursor();
  }

  private handlePointerCancel = () => this.cancelGesture();
  private handlePointerLeave = () => this.cancelGesture();

  private handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    this.callbacks.onZoom(Math.exp(event.deltaY * 0.0016));
    this.callbacks.invalidate();
  };

  private handleDoubleClick = (event: MouseEvent) => {
    event.preventDefault();
  };

  dispose(): void {
    this.element.removeEventListener('pointerdown', this.handlePointerDown);
    this.element.removeEventListener('pointermove', this.handlePointerMove);
    this.element.removeEventListener('pointerup', this.handlePointerUp);
    this.element.removeEventListener('pointercancel', this.handlePointerCancel);
    this.element.removeEventListener('pointerleave', this.handlePointerLeave);
    this.element.removeEventListener('wheel', this.handleWheel);
    this.element.removeEventListener('dblclick', this.handleDoubleClick);
    this.element.removeEventListener('contextmenu', this.handleContextMenu);
    this.releaseCapturedPointers();
    this.pointers.length = 0;
  }
}
