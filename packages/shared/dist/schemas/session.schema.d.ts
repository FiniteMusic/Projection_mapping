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
export declare const PAIRING_CONFIG: {
    readonly codeLength: 6;
    readonly expirationSeconds: number;
    readonly maxAttempts: 5;
};
/**
 * Identificador UUID de una entidad.
 */
export declare const sessionUUIDSchema: z.ZodUUID;
/**
 * Estados admitidos para una sesión.
 */
export declare const projectionSessionStatusSchema: z.ZodEnum<{
    waiting: "waiting";
    active: "active";
    ended: "ended";
}>;
/**
 * Estado de conexión del reproductor.
 */
export declare const playerConnectionStatusSchema: z.ZodEnum<{
    disconnected: "disconnected";
    connected: "connected";
}>;
/**
 * Código de emparejamiento.
 *
 * Debe contener exactamente seis
 * caracteres numéricos.
 *
 * Se conserva como string para
 * permitir ceros a la izquierda.
 */
export declare const pairingCodeSchema: z.ZodString;
export declare const createPairingResponseSchema: z.ZodObject<{
    pairingCode: z.ZodString;
    pairingToken: z.ZodString;
    expiresAt: z.ZodISODateTime;
}, z.core.$strict>;
/**
 * Solicitud para crear una sesión.
 *
 * POST /api/sessions
 *
 * El servidor verificará que el usuario
 * sea propietario del proyecto.
 */
export declare const createSessionRequestSchema: z.ZodObject<{
    projectId: z.ZodUUID;
}, z.core.$strict>;
/**
 * Solicitud de emparejamiento.
 *
 * POST /api/sessions/pair
 *
 * La comprobación de vencimiento
 * y uso previo corresponde al servidor.
 */
export declare const pairSessionRequestSchema: z.ZodObject<{
    pairingCode: z.ZodString;
    projectId: z.ZodUUID;
}, z.core.$strict>;
/**
 * Valida la solicitud de consulta del estado
 * de vinculación enviada por el reproductor.
 */
export declare const pairingStatusRequestSchema: z.ZodObject<{
    pairingToken: z.ZodString;
}, z.core.$strict>;
/**
 * Solicitud para finalizar una sesión.
 *
 * POST /api/sessions/:sessionId/end
 *
 * No requiere campos adicionales.
 */
export declare const endSessionRequestSchema: z.ZodObject<{}, z.core.$strict>;
/**
 * Valida la solicitud del reproductor
 * para generar un código de vinculación.
 *
 * POST /api/sessions/pairing
 *
 * La solicitud no admite propiedades.
 */
export declare const createPairingRequestSchema: z.ZodObject<{}, z.core.$strict>;
/**
 * Token de acceso exclusivo del player.
 *
 * Se valida únicamente su estructura
 * básica. La firma o validez real
 * debe comprobarse en el servidor.
 */
export declare const playerTokenSchema: z.ZodString;
/**
 * Credenciales entregadas al reproductor
 * después de un emparejamiento válido.
 *
 * El formato de fecha debe ser ISO 8601
 * con zona horaria.
 */
export declare const playerCredentialsSchema: z.ZodObject<{
    sessionId: z.ZodUUID;
    playerToken: z.ZodString;
    expiresAt: z.ZodISODateTime;
}, z.core.$strict>;
/**
 * Valida la respuesta del servidor al consultar
 * el estado de vinculación del reproductor.
 */
export declare const pairingStatusResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"pending">;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"expired">;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"paired">;
    credentials: z.ZodObject<{
        sessionId: z.ZodUUID;
        playerToken: z.ZodString;
        expiresAt: z.ZodISODateTime;
    }, z.core.$strict>;
}, z.core.$strict>], "status">;
/**
 * Parámetros de rutas que reciben
 * un identificador de sesión.
 */
export declare const sessionIdParamsSchema: z.ZodObject<{
    sessionId: z.ZodUUID;
}, z.core.$strict>;
//# sourceMappingURL=session.schema.d.ts.map