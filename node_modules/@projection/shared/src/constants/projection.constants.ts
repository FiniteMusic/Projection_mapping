
import type {
  Dimensions,
  Quad
} from "../types/common.types.js";


export const DEFAULT_PROJECTION_CORNERS: Quad = [
  { x: 0.1, y: 0.1 },
  { x: 0.9, y: 0.1 },
  { x: 0.9, y: 0.9 },
  { x: 0.1, y: 0.9 }
];
/**
 * Configuración lógica predeterminada
 * del lienzo de proyección.
 *
 * No representa necesariamente
 * la resolución física del proyector.
 */
/**
 * Resolución lógica predeterminada
 * para los nuevos proyectos.
 *
 * No representa necesariamente
 * la resolución física del proyector.
 */
export const DEFAULT_PROJECTION_CANVAS: Dimensions = {
  width: 1280,
  height: 720
};

/**
 * Límites de las coordenadas normalizadas.
 *
 * Origen: esquina superior izquierda.
 * Eje X: positivo hacia la derecha.
 * Eje Y: positivo hacia abajo.
 */
export const NORMALIZED_COORDINATE_RANGE = {
  min: 0,
  max: 1
} as const;

/**
 * Identificadores de los vértices.
 *
 * El orden es fundamental para
 * calcular la transformación proyectiva.
 */
export const QUAD_CORNER_INDEX = {
  TOP_LEFT: 0,
  TOP_RIGHT: 1,
  BOTTOM_RIGHT: 2,
  BOTTOM_LEFT: 3
} as const;

/**
 * Cantidad de vértices de una superficie.
 */
export const QUAD_CORNER_COUNT = 4 as const;

/**
 * Configuración geométrica compartida.
 *
 * Estos valores deben mantenerse
 * sincronizados con surface.schema.ts.
 */
export const PROJECTION_GEOMETRY = {
  minQuadArea: 0.0001,
  orientationEpsilon: 1e-8
} as const;

/**
 * Valores iniciales de una superficie.
 */
export const DEFAULT_PROJECTION_SURFACE = {
  corners: DEFAULT_PROJECTION_CORNERS.map(
    point => ({ ...point })
  ) as Quad,

  visible: true,
  opacity: 1,
  zIndex: 0
};

/**
 * Límites lógicos de representación.
 */
export const PROJECTION_LIMITS = {
  minOpacity: 0,
  maxOpacity: 1,
  minZIndex: 0,
  maxZIndex: 1000,
  maxCanvasDimension: 8192
} as const;

/**
 * Parámetros iniciales del reproductor.
 *
 * targetFPS es un objetivo de rendimiento,
 * no una garantía de frecuencia de imagen.
 */
export const PLAYER_RENDER_CONFIG = {
  targetFPS: 30,
  clearColor: "#000000",
  antialias: true,
  preserveDrawingBuffer: false
} as const;

/**
 * Configuración inicial de reproducción.
 *
 * Los tiempos se expresan en segundos.
 */
export const PLAYBACK_CONFIG = {
  defaultVolume: 1,
  defaultMuted: true,
  synchronizationToleranceSeconds: 0.15,
  seekToleranceSeconds: 0.05
} as const;

/**
 * Configuración inicial de interacción
 * con los vértices de una superficie.
 *
 * Las distancias se expresan en píxeles
 * de la interfaz, no del proyector.
 */
export const SURFACE_EDITOR_CONFIG = {
  cornerHandleRadiusPx: 12,
  cornerHitRadiusPx: 20,
  showGridByDefault: false,
  snapToGridByDefault: false
} as const;

/**
 * Convierte una coordenada normalizada
 * a una posición en píxeles.
 */
export function normalizedToPixels(
  value: number,
  dimension: number
): number {
  return value * dimension;
}

/**
 * Convierte una posición en píxeles
 * a una coordenada normalizada.
 *
 * Esta función no limita el resultado
 * al intervalo [0, 1].
 */
export function pixelsToNormalized(
  value: number,
  dimension: number
): number {
  if (!Number.isFinite(dimension) || dimension <= 0) {
    throw new RangeError(
      "La dimensión debe ser un número positivo y finito."
    );
  }

  return value / dimension;
}

/**
 * Limita una coordenada normalizada
 * al intervalo [0, 1].
 *
 * No sustituye la validación de Zod.
 */
export function clampNormalized(
  value: number
): number {
  if (!Number.isFinite(value)) {
    throw new RangeError(
      "La coordenada debe ser un número finito."
    );
  }

  return Math.min(
    NORMALIZED_COORDINATE_RANGE.max,
    Math.max(
      NORMALIZED_COORDINATE_RANGE.min,
      value
    )
  );
}
