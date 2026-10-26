import { z } from "zod";
/**
 * Validación del nombre del usuario.
 *
 * - Elimina espacios al inicio y final.
 * - Mínimo 2 caracteres.
 * - Máximo 100 caracteres.
 */
export const userNameSchema = z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(100, "El nombre no puede superar 100 caracteres.");
/**
 * Validación del correo electrónico.
 *
 * Se normaliza eliminando espacios
 * y convirtiéndolo a minúsculas.
 */
export const emailSchema = z
    .email("El correo electrónico no es válido.")
    .trim()
    .toLowerCase()
    .max(254, "El correo electrónico es demasiado largo.");
/**
 * Validación de contraseñas nuevas.
 *
 * Se exige una longitud mínima de 8
 * caracteres y máxima de 128.
 *
 * No se eliminan espacios porque pueden
 * formar parte de la contraseña.
 */
export const passwordSchema = z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(128, "La contraseña no puede superar 128 caracteres.");
/**
 * Validación del registro.
 *
 * POST /api/auth/register
 */
export const registerRequestSchema = z
    .strictObject({
    name: userNameSchema,
    email: emailSchema,
    password: passwordSchema
});
/**
 * Validación del inicio de sesión.
 *
 * POST /api/auth/login
 *
 * No aplicamos las restricciones de
 * creación de contraseña al iniciar sesión.
 * El servidor verificará las credenciales.
 */
export const loginRequestSchema = z
    .strictObject({
    email: emailSchema,
    password: z.string().min(1, "La contraseña es obligatoria.")
});
/**
 * Validación del refresh token.
 *
 * POST /api/auth/refresh
 */
export const refreshTokenRequestSchema = z
    .strictObject({
    refreshToken: z
        .string()
        .min(1, "El token de actualización es obligatorio.")
});
/**
 * Validación del cierre de sesión.
 *
 * POST /api/auth/logout
 */
export const logoutRequestSchema = z
    .strictObject({
    refreshToken: z
        .string()
        .min(1, "El token de actualización es obligatorio.")
});
//# sourceMappingURL=auth.schema.js.map