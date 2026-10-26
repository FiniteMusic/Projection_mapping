import { z } from "zod";
import { PROJECTION_GEOMETRY, DEFAULT_PROJECTION_CORNERS } from "../constants/projection.constants.js";
/**
 * Coordenada normalizada entre 0 y 1.
 */
export const normalizedCoordinateSchema = z
    .number()
    .finite()
    .min(0)
    .max(1);
/**
 * Punto bidimensional normalizado.
 */
export const pointSchema = z.strictObject({
    x: normalizedCoordinateSchema,
    y: normalizedCoordinateSchema
});
/**
 * Producto cruzado de los vectores AB y AC.
 *
 * Permite determinar la orientación
 * de tres puntos consecutivos.
 */
function crossProduct(a, b, c) {
    return ((b.x - a.x) * (c.y - a.y) -
        (b.y - a.y) * (c.x - a.x));
}
/**
 * Área de un polígono de cuatro vértices,
 * calculada mediante la fórmula de Gauss.
 */
function polygonArea(points) {
    let sum = 0;
    for (let i = 0; i < 4; i++) {
        const current = points[i];
        const next = points[(i + 1) % 4];
        sum += (current.x * next.y -
            next.x * current.y);
    }
    return Math.abs(sum) / 2;
}
/**
 * Comprueba que los cuatro vértices
 * formen un cuadrilátero estrictamente
 * convexo y no degenerado.
 *
 * Se admiten orientaciones horarias
 * y antihorarias, pero el orden de
 * correspondencia TL, TR, BR, BL
 * debe mantenerse.
 */
export function isValidQuad(points) {
    const MIN_AREA = PROJECTION_GEOMETRY.minQuadArea;
    const EPSILON = PROJECTION_GEOMETRY.orientationEpsilon;
    if (polygonArea(points) < MIN_AREA) {
        return false;
    }
    let orientation = 0;
    for (let i = 0; i < 4; i++) {
        const a = points[i];
        const b = points[(i + 1) % 4];
        const c = points[(i + 2) % 4];
        const cross = crossProduct(a, b, c);
        if (Math.abs(cross) <= EPSILON) {
            return false;
        }
        const currentOrientation = Math.sign(cross);
        if (orientation === 0) {
            orientation = currentOrientation;
        }
        else if (orientation !== currentOrientation) {
            return false;
        }
    }
    return true;
}
/**
 * Cuadrilátero de proyección.
 *
 * Orden obligatorio:
 * 0: superior izquierdo
 * 1: superior derecho
 * 2: inferior derecho
 * 3: inferior izquierdo
 */
export const quadSchema = z
    .tuple([
    pointSchema,
    pointSchema,
    pointSchema,
    pointSchema
])
    .refine(isValidQuad, "Los vértices deben formar un cuadrilátero convexo y no degenerado.");
/**
 * Nombre de una superficie.
 */
export const surfaceNameSchema = z
    .string()
    .trim()
    .min(1, "El nombre de la superficie es obligatorio.")
    .max(100, "El nombre no puede superar 100 caracteres.");
/**
 * Opacidad entre 0 y 1.
 */
export const surfaceOpacitySchema = z
    .number()
    .finite()
    .min(0)
    .max(1);
/**
 * Orden de superposición.
 */
export const surfaceZIndexSchema = z
    .number()
    .int()
    .min(0)
    .max(1000);
/**
 * UUID de un recurso multimedia.
 */
export const surfaceMediaIdSchema = z
    .uuid()
    .nullable();
/**
 * Valores predeterminados para
 * una nueva superficie.
 */
export const DEFAULT_SURFACE_CORNERS = DEFAULT_PROJECTION_CORNERS;
/**
 * POST /api/projects/:projectId/surfaces
 */
export const createSurfaceRequestSchema = z.strictObject({
    name: surfaceNameSchema,
    corners: quadSchema.default(() => DEFAULT_SURFACE_CORNERS.map(point => ({ ...point }))),
    mediaId: surfaceMediaIdSchema.default(null),
    visible: z.boolean().default(true),
    zIndex: surfaceZIndexSchema.default(0),
    opacity: surfaceOpacitySchema.default(1)
});
/**
 * PATCH /api/surfaces/:surfaceId
 *
 * Se requiere al menos una propiedad.
 */
export const updateSurfaceRequestSchema = z
    .strictObject({
    name: surfaceNameSchema.optional(),
    corners: quadSchema.optional(),
    mediaId: surfaceMediaIdSchema.optional(),
    visible: z.boolean().optional(),
    zIndex: surfaceZIndexSchema.optional(),
    opacity: surfaceOpacitySchema.optional()
})
    .refine(data => Object.keys(data).length > 0, "Debe proporcionar al menos un campo para actualizar.");
//# sourceMappingURL=surface.schema.js.map