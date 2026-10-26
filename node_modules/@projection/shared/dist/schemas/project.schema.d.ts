import { z } from "zod";
import type { ProjectSettings } from "../types/project.types.js";
/**
 * Nombre de un proyecto.
 *
 * Se eliminan espacios al inicio y final.
 */
export declare const projectNameSchema: z.ZodString;
/**
 * Descripción opcional del proyecto.
 *
 * null permite eliminar una descripción
 * previamente almacenada.
 */
export declare const projectDescriptionSchema: z.ZodNullable<z.ZodString>;
/**
 * Estados admitidos para un proyecto.
 */
export declare const projectStatusSchema: z.ZodEnum<{
    draft: "draft";
    ready: "ready";
    archived: "archived";
}>;
/**
 * Dimensiones del área de proyección.
 *
 * Los valores deben ser enteros positivos.
 * El límite de 8192 evita dimensiones
 * excesivas para el MVP.
 */
export declare const canvasDimensionsSchema: z.ZodObject<{
    width: z.ZodNumber;
    height: z.ZodNumber;
}, z.core.$strict>;
/**
 * Color hexadecimal de seis dígitos.
 *
 * Ejemplos:
 * #000000
 * #FFFFFF
 * #1A2B3C
 */
export declare const backgroundColorSchema: z.ZodString;
/**
 * Configuración completa del proyecto.
 */
export declare const projectSettingsSchema: z.ZodObject<{
    canvas: z.ZodObject<{
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, z.core.$strict>;
    backgroundColor: z.ZodString;
}, z.core.$strict>;
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
export declare const DEFAULT_PROJECT_SETTINGS: ProjectSettings;
/**
 * Validación para crear proyectos.
 *
 * POST /api/projects
 *
 * La configuración es opcional.
 * Si se omite, Zod aplica los valores
 * predeterminados.
 */
export declare const createProjectRequestSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    settings: z.ZodDefault<z.ZodObject<{
        canvas: z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, z.core.$strict>;
        backgroundColor: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
/**
 * Validación para actualizar proyectos.
 *
 * PATCH /api/projects/:projectId
 *
 * Solo se admiten propiedades editables.
 */
export declare const updateProjectRequestSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodOptional<z.ZodEnum<{
        draft: "draft";
        ready: "ready";
        archived: "archived";
    }>>;
    settings: z.ZodOptional<z.ZodObject<{
        canvas: z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, z.core.$strict>;
        backgroundColor: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
import type { CreateProjectRequest, UpdateProjectRequest } from "../types/project.types.js";
/**
 * Comprueba que los valores de entrada
 * sean compatibles con las interfaces.
 */
type Assert<T extends true> = T;
type IsAssignable<From, To> = [
    From
] extends [To] ? true : false;
export type CreateProjectInputCompatible = Assert<IsAssignable<CreateProjectRequest, z.input<typeof createProjectRequestSchema>>>;
export type UpdateProjectInputCompatible = Assert<IsAssignable<UpdateProjectRequest, z.input<typeof updateProjectRequestSchema>>>;
export {};
//# sourceMappingURL=project.schema.d.ts.map