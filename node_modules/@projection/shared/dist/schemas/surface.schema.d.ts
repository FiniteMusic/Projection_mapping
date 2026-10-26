import { z } from "zod";
import type { Quad } from "../types/common.types.js";
/**
 * Coordenada normalizada entre 0 y 1.
 */
export declare const normalizedCoordinateSchema: z.ZodNumber;
/**
 * Punto bidimensional normalizado.
 */
export declare const pointSchema: z.ZodObject<{
    x: z.ZodNumber;
    y: z.ZodNumber;
}, z.core.$strict>;
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
export declare function isValidQuad(points: Quad): boolean;
/**
 * Cuadrilátero de proyección.
 *
 * Orden obligatorio:
 * 0: superior izquierdo
 * 1: superior derecho
 * 2: inferior derecho
 * 3: inferior izquierdo
 */
export declare const quadSchema: z.ZodTuple<[z.ZodObject<{
    x: z.ZodNumber;
    y: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    x: z.ZodNumber;
    y: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    x: z.ZodNumber;
    y: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    x: z.ZodNumber;
    y: z.ZodNumber;
}, z.core.$strict>], null>;
/**
 * Nombre de una superficie.
 */
export declare const surfaceNameSchema: z.ZodString;
/**
 * Opacidad entre 0 y 1.
 */
export declare const surfaceOpacitySchema: z.ZodNumber;
/**
 * Orden de superposición.
 */
export declare const surfaceZIndexSchema: z.ZodNumber;
/**
 * UUID de un recurso multimedia.
 */
export declare const surfaceMediaIdSchema: z.ZodNullable<z.ZodUUID>;
/**
 * Valores predeterminados para
 * una nueva superficie.
 */
export declare const DEFAULT_SURFACE_CORNERS: Quad;
/**
 * POST /api/projects/:projectId/surfaces
 */
export declare const createSurfaceRequestSchema: z.ZodObject<{
    name: z.ZodString;
    corners: z.ZodDefault<z.ZodTuple<[z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, z.core.$strict>], null>>;
    mediaId: z.ZodDefault<z.ZodNullable<z.ZodUUID>>;
    visible: z.ZodDefault<z.ZodBoolean>;
    zIndex: z.ZodDefault<z.ZodNumber>;
    opacity: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>;
/**
 * PATCH /api/surfaces/:surfaceId
 *
 * Se requiere al menos una propiedad.
 */
export declare const updateSurfaceRequestSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    corners: z.ZodOptional<z.ZodTuple<[z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, z.core.$strict>], null>>;
    mediaId: z.ZodOptional<z.ZodNullable<z.ZodUUID>>;
    visible: z.ZodOptional<z.ZodBoolean>;
    zIndex: z.ZodOptional<z.ZodNumber>;
    opacity: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
//# sourceMappingURL=surface.schema.d.ts.map