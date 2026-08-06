import * as THREE from 'three';

import type { GraphScene } from './graph_scene';

/** 노드 픽킹. Raycaster/Vector2를 재사용하고, 인스턴스 히트는 instanceId로 노드 인덱스를 되찾는다. */
export class GraphPicking {
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly hits: THREE.Intersection[] = [];

  pick(scene: GraphScene, camera: THREE.Camera, ndcX: number, ndcY: number): number | null {
    this.pointer.set(ndcX, ndcY);
    this.raycaster.setFromCamera(this.pointer, camera);

    this.hits.length = 0;
    this.raycaster.intersectObjects(
      [...scene.getFocusMeshes(), ...scene.getMeshes()],
      false,
      this.hits,
    );
    if (this.hits.length === 0) return null;

    for (const hit of this.hits) {
      const focusIndex = scene.resolveFocusMesh(hit.object);
      if (focusIndex !== null) return focusIndex;
      if (hit.instanceId === undefined) continue;
      const index = scene.resolveInstance(hit.object, hit.instanceId);
      if (index !== null) return index;
    }
    return null;
  }
}
