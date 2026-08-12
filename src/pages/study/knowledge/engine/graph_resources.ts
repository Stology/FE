import * as THREE from 'three';

/**
 * 그래프 렌더링 자원. 지오메트리와 재질은 노드 유형별로 하나만 만들어 공유한다.
 * 레퍼런스 프로토타입(prod-ui)의 GraphResources를 그대로 포팅했다. 이 앱에는 다크 모드가
 * 없으므로 라이트 팔레트만 둔다.
 */

export type NodeVisualKind = 'concept' | 'material' | 'neutral';

export interface GraphPalette {
  active: number;
  activeSoft: number;
  material: number;
  inactive: number;
  fresh: number;
  reinforced: number;
  edge: number;
  edgeHighlight: number;
  halo: number;
}

const tone = (hue: number, saturation: number, lightness: number): number =>
  new THREE.Color(`hsl(${hue}, ${saturation}%, ${lightness}%)`).getHex();

const NODE_HUE = 243.4;

export const lightPalette: GraphPalette = {
  active: tone(NODE_HUE, 75, 58.6),
  activeSoft: tone(NODE_HUE, 54, 58.6),
  material: tone(NODE_HUE, 42, 58.6),
  inactive: tone(NODE_HUE, 12, 88),
  fresh: tone(NODE_HUE, 68, 58.6),
  reinforced: tone(NODE_HUE, 34, 58.6),
  edge: 0x8b93a8,
  edgeHighlight: 0x5b53e8,
  halo: tone(NODE_HUE, 75, 58.6),
};

/** 선택/호버 halo용 radial gradient 텍스처. 한 번만 만들고 재사용한다. */
const createHaloTexture = (): THREE.Texture => {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(
      size / 2,
      size / 2,
      size * 0.24,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(0.52, 'rgba(255,255,255,0.42)');
    gradient.addColorStop(0.78, 'rgba(255,255,255,0.16)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};

export class GraphResources {
  readonly nodeGeometry: THREE.SphereGeometry;
  readonly focusGeometry: THREE.SphereGeometry;
  readonly haloTexture: THREE.Texture;
  readonly weekHaloGeometry: THREE.PlaneGeometry;
  readonly weekHaloStrength: THREE.InstancedBufferAttribute;
  readonly weekHaloMaterial: THREE.ShaderMaterial;
  readonly nodeMaterials: Record<NodeVisualKind, THREE.MeshStandardMaterial>;
  readonly focusMaterial: THREE.MeshPhysicalMaterial;
  readonly rootMaterial: THREE.MeshPhysicalMaterial;
  readonly haloMaterials: { selected: THREE.SpriteMaterial; hover: THREE.SpriteMaterial };
  readonly edgeMaterial: THREE.LineBasicMaterial;
  readonly edgeHighlightMaterial: THREE.LineBasicMaterial;

  constructor(options: { maxHaloInstances: number }) {
    const palette = lightPalette;

    this.nodeGeometry = new THREE.SphereGeometry(1, 40, 28);
    this.nodeGeometry.computeVertexNormals();

    this.focusGeometry = new THREE.SphereGeometry(1, 56, 40);
    this.focusGeometry.computeVertexNormals();

    this.haloTexture = createHaloTexture();
    this.weekHaloGeometry = new THREE.PlaneGeometry(1, 1);
    this.weekHaloStrength = new THREE.InstancedBufferAttribute(
      new Float32Array(Math.max(1, options.maxHaloInstances)),
      1,
    ).setUsage(THREE.DynamicDrawUsage);
    this.weekHaloGeometry.setAttribute('haloStrength', this.weekHaloStrength);
    this.weekHaloMaterial = new THREE.ShaderMaterial({
      uniforms: { haloColor: { value: new THREE.Color(palette.halo) } },
      vertexShader: `
        attribute float haloStrength;
        varying vec2 haloUv;
        varying float strength;

        void main() {
          haloUv = uv;
          strength = haloStrength;
          vec4 center = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          float size = length(instanceMatrix[0].xyz);
          center.xy += position.xy * size;
          gl_Position = projectionMatrix * center;
        }
      `,
      fragmentShader: `
        uniform vec3 haloColor;
        varying vec2 haloUv;
        varying float strength;

        void main() {
          float radius = length((haloUv - 0.5) * 2.0);
          if (radius >= 1.0) discard;
          float outerFade = 1.0 - smoothstep(0.35, 1.0, radius);
          float centerCut = smoothstep(0.08, 0.42, radius);
          float alpha = outerFade * centerCut * 0.46 * strength;
          gl_FragColor = vec4(haloColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });

    // Satin/ceramic 느낌의 불투명 재질. InstancedMesh는 per-instance color를 재질 색에
    // 곱하므로 기본색은 흰색으로 둔다.
    this.nodeMaterials = {
      concept: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.32,
        metalness: 0.04,
        emissive: new THREE.Color(palette.active),
        emissiveIntensity: 0.06,
      }),
      material: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.05,
        emissive: new THREE.Color(palette.material),
        emissiveIntensity: 0.05,
      }),
      neutral: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.48,
        metalness: 0.01,
        emissive: new THREE.Color(palette.inactive),
        emissiveIntensity: 0.12,
      }),
    };

    this.focusMaterial = new THREE.MeshPhysicalMaterial({
      color: palette.active,
      roughness: 0.24,
      metalness: 0.02,
      clearcoat: 0.42,
      clearcoatRoughness: 0.18,
      emissive: new THREE.Color(palette.active),
      emissiveIntensity: 0.08,
    });

    this.rootMaterial = new THREE.MeshPhysicalMaterial({
      color: palette.active,
      roughness: 0.26,
      metalness: 0.02,
      clearcoat: 0.34,
      clearcoatRoughness: 0.2,
      emissive: new THREE.Color(palette.active),
      emissiveIntensity: 0.07,
    });

    this.haloMaterials = {
      selected: new THREE.SpriteMaterial({
        map: this.haloTexture,
        color: palette.halo,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
      hover: new THREE.SpriteMaterial({
        map: this.haloTexture,
        color: palette.halo,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    };

    this.edgeMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
    });

    this.edgeHighlightMaterial = new THREE.LineBasicMaterial({
      color: palette.edgeHighlight,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
  }

  dispose(): void {
    this.nodeGeometry.dispose();
    this.focusGeometry.dispose();
    this.haloTexture.dispose();
    this.weekHaloGeometry.dispose();
    this.weekHaloMaterial.dispose();
    Object.values(this.nodeMaterials).forEach((material) => material.dispose());
    this.focusMaterial.dispose();
    this.rootMaterial.dispose();
    this.haloMaterials.selected.dispose();
    this.haloMaterials.hover.dispose();
    this.edgeMaterial.dispose();
    this.edgeHighlightMaterial.dispose();
  }
}
