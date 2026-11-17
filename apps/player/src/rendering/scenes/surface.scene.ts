
import * as THREE from "three";

import {
  type Quad,
  type Surface
} from "@projection/shared";

import {
  ProjectionSurfaceMesh
} from "../surfaces/surface.mesh";


export interface SurfaceScene {
  loadSurfaces: (surfaces: Surface[]) => void;

  updateSurface: (
    surfaceId: string,
    corners: Quad
  ) => boolean;

  setSurfaceTexture: (
    surfaceId: string,
    texture: THREE.Texture | null,
    cleanup?: () => void
  ) => boolean;

  dispose: () => void;
}


export function createSurfaceScene(
  scene: THREE.Scene
): SurfaceScene {
  const surfaceMeshes = new Map<string, ProjectionSurfaceMesh>();

  function clearSurfaces(): void {
    for (const surface of surfaceMeshes.values()) {
      scene.remove(surface.getMesh());
      surface.dispose();
    }

    surfaceMeshes.clear();
  }

  return {
    loadSurfaces(surfaces: Surface[]): void {
      clearSurfaces();

      for (const surfaceData of surfaces) {
        const surface = new ProjectionSurfaceMesh(
          surfaceData.corners
        );

        surface.setVisible(surfaceData.visible);
        surface.setOpacity(surfaceData.opacity);
        surface.setZIndex(surfaceData.zIndex);

        scene.add(surface.getMesh());

        surfaceMeshes.set(surfaceData.id, surface);
      }
    },

    updateSurface(surfaceId: string, corners: Quad): boolean {
      const surface = surfaceMeshes.get(surfaceId);

      if (!surface) {
        return false;
      }

      surface.updateCorners(corners);

      return true;
    },

   
    setSurfaceTexture(
      surfaceId: string,
      texture: THREE.Texture | null,
      cleanup?: () => void
    ): boolean {
      const surface = surfaceMeshes.get(surfaceId);

      if (!surface) {
        return false;
      }

      surface.setTexture(texture, cleanup);

      return true;
    },


    dispose(): void {
      clearSurfaces();
    }
  };
}
