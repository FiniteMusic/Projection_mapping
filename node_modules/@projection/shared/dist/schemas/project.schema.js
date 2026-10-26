import { z } from "zod";
import { DEFAULT_PROJECTION_CANVAS } from "../constants/projection.constants.js";
/**
 * Nombre de un proyecto.
 *
 * Se eliminan espacios al inicio y final.
 */
export const projectNameSchema = z
    .string()
    .trim()
    .min(1, "El nombre del proyecto es obligatorio.")
    .max(100, "El nombre no puede superar 100 caracteres.");
/**
 * Descripción opcional del proyecto.
 *
 * null permite eliminar una descripción
 * previamente almacenada.
 */
export const projectDescriptionSchema = z
    .string()
    .trim()
    .max(500, "La descripción no puede superar 500 caracteres.")
    .nullable();
/**
 * Estados admitidos para un proyecto.
 */
export const projectStatusSchema = z.enum([
    "draft",
    "ready",
    "archived"
]);
/**
 * Dimensiones del área de proyección.
 *
 * Los valores deben ser enteros positivos.
 * El límite de 8192 evita dimensiones
 * excesivas para el MVP.
 */
export const canvasDimensionsSchema = z.strictObject({
    width: z
        .number()
        .int()
        .min(1)
        .max(8192),
    height: z
        .number()
        .int()
        .min(1)
        .max(8192)
});
/**
 * Color hexadecimal de seis dígitos.
 *
 * Ejemplos:
 * #000000
 * #FFFFFF
 * #1A2B3C
 */
export const backgroundColorSchema = z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "El color debe tener formato hexadecimal #RRGGBB.");
/**
 * Configuración completa del proyecto.
 */
export const projectSettingsSchema = z.strictObject({
    canvas: canvasDimensionsSchema,
    backgroundColor: backgroundColorSchema
});
/**
 * Configuración inicial del MVP.
 *
 * Se utiliza cuando el cliente no
 * proporciona settings al crear un proyecto.
 */
/**
 * Configuración predeterminada
 * de los nuevos proyectos.
 */
export const DEFAULT_PROJECT_SETTINGS = {
    canvas: {
        ...DEFAULT_PROJECTION_CANVAS
    },
    backgroundColor: "#000000"
};
/**
 * Validación para crear proyectos.
 *
 * POST /api/projects
 *
 * La configuración es opcional.
 * Si se omite, Zod aplica los valores
 * predeterminados.
 */
export const createProjectRequestSchema = z.strictObject({
    name: projectNameSchema,
    description: projectDescriptionSchema.optional(),
    settings: projectSettingsSchema
        .default(() => ({
        canvas: { ...DEFAULT_PROJECT_SETTINGS.canvas },
        backgroundColor: DEFAULT_PROJECT_SETTINGS.backgroundColor
    }))
});
/**
 * Validación para actualizar proyectos.
 *
 * PATCH /api/projects/:projectId
 *
 * Solo se admiten propiedades editables.
 */
export const updateProjectRequestSchema = z
    .strictObject({
    name: projectNameSchema.optional(),
    description: projectDescriptionSchema.optional(),
    status: projectStatusSchema.optional(),
    settings: projectSettingsSchema.optional()
})
    .refine((data) => Object.keys(data).length > 0, "Debe proporcionar al menos un campo para actualizar.");
//# sourceMappingURL=project.schema.js.map