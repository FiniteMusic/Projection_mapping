import { z } from "zod";
/**
 * Validación del nombre del usuario.
 *
 * - Elimina espacios al inicio y final.
 * - Mínimo 2 caracteres.
 * - Máximo 100 caracteres.
 */
export declare const userNameSchema: z.ZodString;
/**
 * Validación del correo electrónico.
 *
 * Se normaliza eliminando espacios
 * y convirtiéndolo a minúsculas.
 */
export declare const emailSchema: z.ZodEmail;
/**
 * Validación de contraseñas nuevas.
 *
 * Se exige una longitud mínima de 8
 * caracteres y máxima de 128.
 *
 * No se eliminan espacios porque pueden
 * formar parte de la contraseña.
 */
export declare const passwordSchema: z.ZodString;
/**
 * Validación del registro.
 *
 * POST /api/auth/register
 */
export declare const registerRequestSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strict>;
/**
 * Validación del inicio de sesión.
 *
 * POST /api/auth/login
 *
 * No aplicamos las restricciones de
 * creación de contraseña al iniciar sesión.
 * El servidor verificará las credenciales.
 */
export declare const loginRequestSchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strict>;
/**
 * Validación del refresh token.
 *
 * POST /api/auth/refresh
 */
export declare const refreshTokenRequestSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, z.core.$strict>;
/**
 * Validación del cierre de sesión.
 *
 * POST /api/auth/logout
 */
export declare const logoutRequestSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, z.core.$strict>;
//# sourceMappingURL=auth.schema.d.ts.map