
import * as THREE from "three";

export interface TestScene {
  update: (deltaTime: number) => void;
  dispose: () => void;
}

export function createTestScene(
  scene: THREE.Scene
): TestScene {
  const geometry = new THREE.BoxGeometry(2, 2, 2);

  const material = new THREE.MeshStandardMaterial({
    color: 0x00aaff,
    roughness: 0.4,
    metalness: 0.2
  });

  const cube = new THREE.Mesh(geometry, material);

  scene.add(cube);

  const ambientLight = new THREE.AmbientLight(
    0xffffff,
    0.6
  );

  const directionalLight = new THREE.DirectionalLight(
    0xffffff,
    2
  );

  directionalLight.position.set(3, 4, 5);

  scene.add(ambientLight, directionalLight);

  return {
    update(deltaTime: number): void {
      cube.rotation.x += deltaTime * 0.5;
      cube.rotation.y += deltaTime * 0.8;
    },

    dispose(): void {
      scene.remove(
        cube,
        ambientLight,
        directionalLight
      );

      geometry.dispose();
      material.dispose();
    }
  };
}

