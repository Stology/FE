import * as THREE from 'three';

/**
 * WebGL 렌더러 래퍼. (레퍼런스 프로토타입 GraphRenderer 포팅)
 *
 * antialias 활성화, DPR 제한, sRGB 출력, ACES 톤매핑을 고정한다.
 * 캔버스는 이 클래스가 직접 만들어 컨테이너에 붙인다 — React가 소유한 캔버스를 재사용하면
 * dispose 후 재생성(그래프 교체) 시 WebGL 컨텍스트를 다시 얻을 수 없어 초기화가 실패한다.
 */
export class GraphRenderer {
  readonly renderer: THREE.WebGLRenderer;
  readonly canvas: HTMLCanvasElement;
  private width = 1;
  private height = 1;

  constructor(container: HTMLElement, canvasClassName?: string) {
    this.canvas = document.createElement('canvas');
    if (canvasClassName) this.canvas.className = canvasClassName;
    this.canvas.setAttribute('aria-hidden', 'true');
    container.insertBefore(this.canvas, container.firstChild);

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas: this.canvas,
      powerPreference: 'high-performance',
      premultipliedAlpha: true,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.shadowMap.enabled = false;
    this.renderer.setClearAlpha(0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  }

  setSize(width: number, height: number): void {
    this.width = Math.max(1, Math.floor(width));
    this.height = Math.max(1, Math.floor(height));
    this.renderer.setSize(this.width, this.height, false);
  }

  getSize(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  render(scene: THREE.Scene, camera: THREE.Camera): void {
    this.renderer.render(scene, camera);
  }

  dispose(): void {
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.canvas.remove();
  }
}
