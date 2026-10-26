import { z } from "zod";
/**
 * Valida la respuesta enviada al reproductor
 * cuando solicita un código de vinculación.
 *
 * POST /api/sessions/pairing
 */
/**
 * Configuración del emparejamiento.
 *
 * La duración se expresa en segundos.
 */
export const PAIRING_CONFIG = {
    codeLength: 6,
    expirationSeconds: 5 * 60,
    maxAttempts: 5
};
/**
 * Identificador UUID de una entidad.
 */
export const sessionUUIDSchema = z.uuid();
/**
 * Estados admitidos para una sesión.
 */
export const projectionSessionStatusSchema = z.enum([
    "waiting",
    "active",
    "ended"
]);
/**
 * Estado de conexión del reproductor.
 */
export const playerConnectionStatusSchema = z.enum([
    "disconnected",
    "connected"
]);
/**
 * Código de emparejamiento.
 *
 * Debe contener exactamente seis
 * caracteres numéricos.
 *
 * Se conserva como string para
 * permitir ceros a la izquierda.
 */
export const pairingCodeSchema = z
    .string()
    .regex(/^\d{6}$/, "El código debe contener exactamente seis dígitos.");
export const createPairingResponseSchema = z.strictObject({
    pairingCode: pairingCodeSchema,
    pairingToken: z.string().min(1),
    expiresAt: z.iso.datetime({ offset: true })
});
/**
 * Solicitud para crear una sesión.
 *
 * POST /api/sessions
 *
 * El servidor verificará que el usuario
 * sea propietario del proyecto.
 */
export const createSessionRequestSchema = z.strictObject({
    projectId: sessionUUIDSchema
});
/**
 * Solicitud de emparejamiento.
 *
 * POST /api/sessions/pair
 *
 * La comprobación de vencimiento
 * y uso previo corresponde al servidor.
 */
export const pairSessionRequestSchema = z.strictObject({
    pairingCode: pairingCodeSchema,
    projectId: z.uuid()
});
/**
 * Valida la solicitud de consulta del estado
 * de vinculación enviada por el reproductor.
 */
export const pairingStatusRequestSchema = z.strictObject({
    pairingToken: z.string().min(1)
});
/**
 * Solicitud para finalizar una sesión.
 *
 * POST /api/sessions/:sessionId/end
 *
 * No requiere campos adicionales.
 */
export const endSessionRequestSchema = z.strictObject({});
/**
 * Valida la solicitud del reproductor
 * para generar un código de vinculación.
 *
 * POST /api/sessions/pairing
 *
 * La solicitud no admite propiedades.
 */
export const createPairingRequestSchema = z.strictObject({});
/**
 * Token de acceso exclusivo del player.
 *
 * Se valida únicamente su estructura
 * básica. La firma o validez real
 * debe comprobarse en el servidor.
 */
export const playerTokenSchema = z
    .string()
    .min(1, "El token del reproductor es obligatorio.");
/**
 * Credenciales entregadas al reproductor
 * después de un emparejamiento válido.
 *
 * El formato de fecha debe ser ISO 8601
 * con zona horaria.
 */
export const playerCredentialsSchema = z.strictObject({
    sessionId: sessionUUIDSchema,
    playerToken: playerTokenSchema,
    expiresAt: z.iso.datetime({ offset: true })
});
/**
 * Valida la respuesta del servidor al consultar
 * el estado de vinculación del reproductor.
 */
export const pairingStatusResponseSchema = z.discriminatedUnion("status", [
    z.strictObject({
        status: z.literal("pending")
    }),
    z.strictObject({
        status: z.literal("expired")
    }),
    z.strictObject({
        status: z.literal("paired"),
        credentials: playerCredentialsSchema
    })
]);
/**
 * Parámetros de rutas que reciben
 * un identificador de sesión.
 */
export const sessionIdParamsSchema = z.strictObject({
    sessionId: sessionUUIDSchema
});
//# sourceMappingURL=session.schema.js.map