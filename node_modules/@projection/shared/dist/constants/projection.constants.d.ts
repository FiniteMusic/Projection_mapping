import type { Dimensions, Quad } from "../types/common.types.js";
export declare const DEFAULT_PROJECTION_CORNERS: Quad;
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
export declare const DEFAULT_PROJECTION_CANVAS: Dimensions;
/**
 * Límites de las coordenadas normalizadas.
 *
 * Origen: esquina superior izquierda.
 * Eje X: positivo hacia la derecha.
 * Eje Y: positivo hacia abajo.
 */
export declare const NORMALIZED_COORDINATE_RANGE: {
    readonly min: 0;
    readonly max: 1;
};
/**
 * Identificadores de los vértices.
 *
 * El orden es fundamental para
 * calcular la transformación proyectiva.
 */
export declare const QUAD_CORNER_INDEX: {
    readonly TOP_LEFT: 0;
    readonly TOP_RIGHT: 1;
    readonly BOTTOM_RIGHT: 2;
    readonly BOTTOM_LEFT: 3;
};
/**
 * Cantidad de vértices de una superficie.
 */
export declare const QUAD_CORNER_COUNT: 4;
/**
 * Configuración geométrica compartida.
 *
 * Estos valores deben mantenerse
 * sincronizados con surface.schema.ts.
 */
export declare const PROJECTION_GEOMETRY: {
    readonly minQuadArea: 0.0001;
    readonly orientationEpsilon: 1e-8;
};
/**
 * Valores iniciales de una superficie.
 */
export declare const DEFAULT_PROJECTION_SURFACE: {
    corners: Quad;
    visible: boolean;
    opacity: number;
    zIndex: number;
};
/**
 * Límites lógicos de representación.
 */
export declare const PROJECTION_LIMITS: {
    readonly minOpacity: 0;
    readonly maxOpacity: 1;
    readonly minZIndex: 0;
    readonly maxZIndex: 1000;
    readonly maxCanvasDimension: 8192;
};
/**
 * Parámetros iniciales del reproductor.
 *
 * targetFPS es un objetivo de rendimiento,
 * no una garantía de frecuencia de imagen.
 */
export declare const PLAYER_RENDER_CONFIG: {
    readonly targetFPS: 30;
    readonly clearColor: "#000000";
    readonly antialias: true;
    readonly preserveDrawingBuffer: false;
};
/**
 * Configuración inicial de reproducción.
 *
 * Los tiempos se expresan en segundos.
 */
export declare const PLAYBACK_CONFIG: {
    readonly defaultVolume: 1;
    readonly defaultMuted: true;
    readonly synchronizationToleranceSeconds: 0.15;
    readonly seekToleranceSeconds: 0.05;
};
/**
 * Configuración inicial de interacción
 * con los vértices de una superficie.
 *
 * Las distancias se expresan en píxeles
 * de la interfaz, no del proyector.
 */
export declare const SURFACE_EDITOR_CONFIG: {
    readonly cornerHandleRadiusPx: 12;
    readonly cornerHitRadiusPx: 20;
    readonly showGridByDefault: false;
    readonly snapToGridByDefault: false;
};
/**
 * Convierte una coordenada normalizada
 * a una posición en píxeles.
 */
export declare function normalizedToPixels(value: number, dimension: number): number;
/**
 * Convierte una posición en píxeles
 * a una coordenada normalizada.
 *
 * Esta función no limita el resultado
 * al intervalo [0, 1].
 */
export declare function pixelsToNormalized(value: number, dimension: number): number;
/**
 * Limita una coordenada normalizada
 * al intervalo [0, 1].
 *
 * No sustituye la validación de Zod.
 */
export declare function clampNormalized(value: number): number;
//# sourceMappingURL=projection.constants.d.ts.map