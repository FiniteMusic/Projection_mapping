
import type {
  UUID,
  ISODateString,
  Quad
} from "./common.types.js";

/**
 * Superficie de proyección.
 *
 * Representa una región independiente
 * del área de proyección.
 */
export interface Surface {
  id: UUID;
  projectId: UUID;

  name: string;

  /**
   * Cuatro esquinas normalizadas.
   * Orden: TL, TR, BR, BL.
   */
  corners: Quad;

  /**
   * Recurso multimedia asignado.
   * null indica que no hay contenido.
   */
  mediaId: UUID | null;

  /**
   * Control de visibilidad.
   */
  visible: boolean;

  /**
   * Orden de superposición.
   * Los valores mayores aparecen encima.
   */
  zIndex: number;

  /**
   * Opacidad entre 0 y 1.
   */
  opacity: number;

  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/**
 * Datos para crear una superficie.
 *
 * POST /api/projects/:projectId/surfaces
 */
export interface CreateSurfaceRequest {
  name: string;
  corners?: Quad;
  mediaId?: UUID | null;
  visible?: boolean;
  zIndex?: number;
  opacity?: number;
}

/**
 * Datos para modificar una superficie.
 *
 * PATCH /api/surfaces/:surfaceId
 */
export interface UpdateSurfaceRequest {
  name?: string;
  corners?: Quad;
  mediaId?: UUID | null;
  visible?: boolean;
  zIndex?: number;
  opacity?: number;
}

/**
 * Respuesta de una superficie.
 */
export interface SurfaceResponse {
  surface: Surface;
}

/**
 * Respuesta de una lista de superficies.
 */
export interface SurfaceListResponse {
  surfaces: Surface[];
}
