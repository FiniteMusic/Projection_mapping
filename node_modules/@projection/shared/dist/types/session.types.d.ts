import type { UUID, ISODateString } from "./common.types.js";
/**
 * Estado del ciclo de vida de una sesión.
 *
 * waiting: esperando al reproductor.
 * active: sesión habilitada.
 * ended: sesión finalizada.
 */
export type ProjectionSessionStatus = "waiting" | "active" | "ended";
/**
 * Estado de conexión del reproductor.
 *
 * Se mantiene separado del estado
 * de la sesión.
 */
export type PlayerConnectionStatus = "disconnected" | "connected";
/**
 * Sesión de proyección.
 *
 * Permite vincular un proyecto con
 * una instancia del reproductor web.
 */
export interface ProjectionSession {
    id: UUID;
    projectId: UUID;
    status: ProjectionSessionStatus;
    /**
     * Estado actual del reproductor.
     */
    playerConnectionStatus: PlayerConnectionStatus;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    /**
     * Fecha de finalización.
     * null mientras la sesión continúe.
     */
    endedAt: ISODateString | null;
}
/**
 * Solicitud para crear una sesión.
 *
 * POST /api/sessions
 *
 * El usuario debe estar autenticado
 * y autorizado sobre el proyecto.
 */
export interface CreateSessionRequest {
    projectId: UUID;
}
/**
 * Respuesta al crear o consultar
 * una sesión de proyección.
 */
export interface SessionResponse {
    session: ProjectionSession;
}
/**
 * Solicitud enviada por Android para vincular
 * un proyecto con un reproductor en espera.
 *
 * POST /api/sessions/pair
 *
 * Requiere autenticación del usuario.
 * El servidor valida el código y comprueba
 * que el usuario tenga acceso al proyecto.
 */
export interface PairSessionRequest {
    pairingCode: string;
    projectId: UUID;
}
/**
 * Solicitud del reproductor para iniciar
 * el proceso de vinculación.
 *
 * POST /api/sessions/pairing
 *
 * No requiere una sesión de proyección previa.
 */
export type CreatePairingRequest = Record<string, never>;
/**
 * Respuesta que recibe el reproductor
 * al solicitar un código de vinculación.
 *
 * El pairingToken identifica temporalmente
 * al reproductor mientras espera vincularse.
 *
 * No equivale a un accessToken de usuario
 * ni a un playerToken de sesión.
 */
export interface CreatePairingResponse {
    pairingCode: string;
    pairingToken: string;
    expiresAt: ISODateString;
}
/**
 * Solicitud para consultar el resultado
 * de una vinculación pendiente.
 */
export interface PairingStatusRequest {
    pairingToken: string;
}
/**
 * Estado del proceso de vinculación.
 */
export type PairingStatus = "pending" | "paired" | "expired";
/**
 * Respuesta a la consulta de vinculación.
 *
 * Las credenciales solamente se entregan
 * cuando el estado es "paired".
 */
export type PairingStatusResponse = {
    status: "pending" | "expired";
} | {
    status: "paired";
    credentials: PlayerCredentials;
};
/**
 * Credencial temporal emitida para
 * el reproductor después de vincularse.
 *
 * No es el token JWT del usuario.
 */
export interface PlayerCredentials {
    sessionId: UUID;
    playerToken: string;
    expiresAt: ISODateString;
}
/**
 * Respuesta enviada a Android después
 * de vincular correctamente un proyecto
 * con el reproductor.
 *
 * POST /api/sessions/pair
 *
 * No contiene credenciales del reproductor.
 */
export interface PairSessionResponse {
    session: ProjectionSession;
}
/**
 * Respuesta de consulta del estado
 * de una sesión.
 */
export interface SessionStatusResponse {
    sessionId: UUID;
    status: ProjectionSessionStatus;
    playerConnectionStatus: PlayerConnectionStatus;
}
/**
 * Solicitud para finalizar una sesión.
 *
 * POST /api/sessions/:sessionId/end
 *
 * No requiere cuerpo JSON.
 */
export type EndSessionRequest = Record<string, never>;
/**
 * Solicitud temporal de vinculación generada
 * por un reproductor todavía no asociado
 * a un proyecto.
 *
 * Una vinculación pendiente no constituye
 * una sesión de proyección.
 */
export interface PendingPairing {
    /**
     * Identificador interno de la vinculación.
     */
    id: UUID;
    /**
   * Identificador de la sesión creada después
   * de completar correctamente la vinculación.
   *
   * No existe mientras la solicitud está pendiente.
   */
    sessionId?: UUID;
    /**
   * Estado actual de la solicitud
   * de vinculación.
   */
    status: PendingPairingStatus;
    /**
     * Código de seis dígitos mostrado
     * por el reproductor.
     */
    pairingCode: string;
    /**
     * Token temporal utilizado por el reproductor
     * para consultar el estado de vinculación.
     */
    pairingToken: string;
    /**
     * Fecha de creación de la solicitud.
     */
    createdAt: ISODateString;
    /**
     * Fecha de expiración del código.
     */
    expiresAt: ISODateString;
    /**
     * Número de intentos fallidos de vinculación.
     */
    failedAttempts: number;
}
/**
 * Estado interno de una solicitud temporal
 * de vinculación entre el reproductor y Android.
 */
export type PendingPairingStatus = "pending" | "paired" | "expired";
//# sourceMappingURL=session.types.d.ts.map