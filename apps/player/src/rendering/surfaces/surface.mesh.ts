
import * as THREE from "three";
import type { Quad } from "@projection/shared";

export class ProjectionSurfaceMesh {
  private readonly geometry: THREE.BufferGeometry;
  private readonly material: THREE.MeshBasicMaterial;
  private readonly mesh: THREE.Mesh;
  private textureCleanup: (() => void) | null = null;

  constructor(corners: Quad) {
    this.geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(12);

    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const uvs = new Float32Array([
      0, 1,
      1, 1,
      1, 0,
      0, 0
    ]);

    this.geometry.setAttribute(
      "uv",
      new THREE.BufferAttribute(uvs, 2)
    );

    this.geometry.setIndex([
      0, 3, 1,
      1, 3, 2
    ]);

    this.material = new THREE.MeshBasicMaterial({
      color: 0x00aaff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1,
      depthTest: false,
      depthWrite: false
    });

    this.mesh = new THREE.Mesh(
      this.geometry,
      this.material
    );

    this.updateCorners(corners);
  }

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  public updateCorners(corners: Quad): void {
    const positions = this.geometry.getAttribute(
      "position"
    ) as THREE.BufferAttribute;

    corners.forEach((point, index) => {
      positions.setXYZ(
        index,
        point.x,
        1 - point.y,
        0
      );
    });

    positions.needsUpdate = true;
    this.geometry.computeBoundingSphere();
  }

 
private disposeTexture(texture: THREE.Texture): void {
  texture.dispose();

  const image: unknown = texture.image;

  if (
    typeof ImageBitmap !== "undefined" &&
    image instanceof ImageBitmap
  ) {
    image.close();
  }
}

public setTexture(
  texture: THREE.Texture | null,
  cleanup?: () => void
): void {
  const previousTexture = this.material.map;

  if (previousTexture === texture) {
    return;
  }

  const previousCleanup = this.textureCleanup;

  this.material.map = texture;
  this.textureCleanup = cleanup ?? null;

  this.material.color.setHex(
    texture ? 0xffffff : 0x00aaff
  );

  this.material.needsUpdate = true;

  if (previousCleanup) {
    previousCleanup();
  } else if (previousTexture) {
    this.disposeTexture(previousTexture);
  }
}

public dispose(): void {
  const texture = this.material.map;
  const cleanup = this.textureCleanup;

  this.material.map = null;
  this.textureCleanup = null;

  if (cleanup) {
    cleanup();
  } else if (texture) {
    this.disposeTexture(texture);
  }

  this.geometry.dispose();
  this.material.dispose();
}


  public setVisible(visible: boolean): void {
    this.mesh.visible = visible;
  }

  public setOpacity(opacity: number): void {
    this.material.opacity = opacity;
  }

  public setZIndex(zIndex: number): void {
    this.mesh.renderOrder = zIndex;
  }

}
