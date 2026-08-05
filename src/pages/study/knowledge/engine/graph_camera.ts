import * as THREE from 'three';

import {
  CAMERA_FOV,
  DEFAULT_ORBIT_PITCH,
  DEFAULT_ORBIT_YAW,
  MAX_ORBIT_DISTANCE_RATIO,
  MIN_ORBIT_DISTANCE_RATIO,
  ORBIT_PITCH_LIMIT,
  ORBIT_PITCH_SENSITIVITY,
  ORBIT_YAW_SENSITIVITY,
  TRANSITION_DURATION,
} from './constants';

/**
 * 그래프 카메라. 구면 좌표(yaw/pitch/distance) + pivot으로 조작한다.
 * 선택/전체 보기 전환은 720ms 시간 기반 보간, 직접 조작은 짧은 감쇠 이동을 사용한다.
 * (레퍼런스 프로토타입 GraphCamera 포팅 — Safe Area view-offset은 이 화면 레이아웃에
 * 캔버스를 덮는 플로팅 컨트롤이 없어 제외했다.)
 */
const SETTLE_EPSILON = 0.0004;
const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export class GraphCamera {
  readonly camera: THREE.PerspectiveCamera;

  private yaw = DEFAULT_ORBIT_YAW;
  private pitch = DEFAULT_ORBIT_PITCH;
  private distance = 90;
  private targetYaw = DEFAULT_ORBIT_YAW;
  private targetPitch = DEFAULT_ORBIT_PITCH;
  private targetDistance = 90;
  private readonly pivot = new THREE.Vector3();
  private readonly targetPivot = new THREE.Vector3();
  private startYaw = DEFAULT_ORBIT_YAW;
  private startPitch = DEFAULT_ORBIT_PITCH;
  private startDistance = 90;
  private readonly startPivot = new THREE.Vector3();
  private boundedTransition = false;
  private transitionElapsed = 0;
  private minDistance = 18;
  private maxDistance = 220;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.5, 2000);
    this.camera.position.set(0, 0, this.distance);
  }

  setBounds(bounds: number): void {
    this.minDistance = Math.max(12, bounds * MIN_ORBIT_DISTANCE_RATIO);
    this.maxDistance = bounds * MAX_ORBIT_DISTANCE_RATIO;
    this.targetDistance = clamp(this.targetDistance, this.minDistance, this.maxDistance);
  }

  setViewport(width: number, height: number): void {
    this.camera.aspect = Math.max(1, width) / Math.max(1, height);
    this.camera.updateProjectionMatrix();
  }

  /** 초기/전체 보기 거리. */
  frameAll(bounds: number, animate = true): void {
    const fov = (this.camera.fov * Math.PI) / 180;
    const fitDistance = (bounds * 1.28) / Math.tan(fov / 2);
    this.targetDistance = clamp(fitDistance, this.minDistance, this.maxDistance);
    this.targetPivot.set(0, 0, 0);
    this.targetYaw = DEFAULT_ORBIT_YAW;
    this.targetPitch = DEFAULT_ORBIT_PITCH - 0.02;
    this.beginBoundedTransition(animate);
  }

  orbit(deltaX: number, deltaY: number): void {
    this.boundedTransition = false;
    this.targetYaw -= deltaX * ORBIT_YAW_SENSITIVITY;
    this.targetPitch = clamp(
      this.targetPitch + deltaY * ORBIT_PITCH_SENSITIVITY,
      -ORBIT_PITCH_LIMIT,
      ORBIT_PITCH_LIMIT,
    );
  }

  zoomBy(factor: number): void {
    this.boundedTransition = false;
    this.targetDistance = clamp(this.targetDistance * factor, this.minDistance, this.maxDistance);
  }

  frameFocus(radius: number, animate = true): void {
    this.targetPivot.set(0, 0, 0);
    const verticalTan = Math.tan((this.camera.fov * Math.PI) / 360);
    const desired = (radius * 1.22) / Math.max(0.1, verticalTan);
    this.targetDistance = clamp(desired, this.minDistance, this.maxDistance * 0.82);
    this.beginBoundedTransition(animate);
  }

  getViewBasis(right: THREE.Vector3, up: THREE.Vector3, towardCamera: THREE.Vector3): void {
    const cosPitch = Math.cos(this.pitch);
    towardCamera
      .set(Math.sin(this.yaw) * cosPitch, Math.sin(this.pitch), Math.cos(this.yaw) * cosPitch)
      .normalize();
    right.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw)).normalize();
    up.crossVectors(towardCamera, right).normalize();
  }

  private beginBoundedTransition(animate: boolean): void {
    this.startYaw = this.yaw;
    this.startPitch = this.pitch;
    this.startDistance = this.distance;
    this.startPivot.copy(this.pivot);
    this.transitionElapsed = 0;
    if (!animate) {
      this.snap();
      this.boundedTransition = false;
      this.transitionElapsed = TRANSITION_DURATION;
      return;
    }
    this.boundedTransition = true;
  }

  private snap(): void {
    this.yaw = this.targetYaw;
    this.pitch = this.targetPitch;
    this.distance = this.targetDistance;
    this.pivot.copy(this.targetPivot);
  }

  /** @returns 아직 움직이고 있으면 true */
  update(delta: number): boolean {
    let moving = false;
    if (this.boundedTransition) {
      this.transitionElapsed = Math.min(TRANSITION_DURATION, this.transitionElapsed + delta);
      const progress = this.transitionElapsed / TRANSITION_DURATION;
      const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      this.yaw = this.startYaw + (this.targetYaw - this.startYaw) * eased;
      this.pitch = this.startPitch + (this.targetPitch - this.startPitch) * eased;
      this.distance = this.startDistance + (this.targetDistance - this.startDistance) * eased;
      this.pivot.lerpVectors(this.startPivot, this.targetPivot, eased);
      this.boundedTransition = progress < 1;
      moving = this.boundedTransition;
    } else {
      const damping = 1 - Math.pow(0.0016, delta);
      this.yaw += (this.targetYaw - this.yaw) * damping;
      this.pitch += (this.targetPitch - this.pitch) * damping;
      this.distance += (this.targetDistance - this.distance) * damping;
      this.pivot.lerp(this.targetPivot, damping);
    }

    const cosPitch = Math.cos(this.pitch);
    this.camera.position.set(
      this.pivot.x + Math.sin(this.yaw) * cosPitch * this.distance,
      this.pivot.y + Math.sin(this.pitch) * this.distance,
      this.pivot.z + Math.cos(this.yaw) * cosPitch * this.distance,
    );
    this.camera.lookAt(this.pivot);
    this.camera.updateMatrixWorld();

    moving =
      moving ||
      Math.abs(this.targetYaw - this.yaw) > SETTLE_EPSILON ||
      Math.abs(this.targetPitch - this.pitch) > SETTLE_EPSILON ||
      Math.abs(this.targetDistance - this.distance) > SETTLE_EPSILON * 100 ||
      this.pivot.distanceToSquared(this.targetPivot) > SETTLE_EPSILON;

    return moving;
  }

  getDistance(): number {
    return this.distance;
  }
}
