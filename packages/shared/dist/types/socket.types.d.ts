import type { UUID, ISODateString, Quad } from "./common.types.js";
import type { Project } from "./project.types.js";
import type { Surface } from "./surface.types.js";
import type { MediaAsset } from "./media.types.js";
import type { ProjectionSessionStatus, PlayerConnectionStatus } from "./session.types.js";
/**
 * Roles admitidos en una sesión Socket.IO.
 */
export type SocketClientRole = "controller" | "player";
/**
 * Solicitud para entrar en una sesión.
 *
 * La identidad y el rol se verifican
 * mediante las credenciales del socket.
 */
export interface SessionJoinPayload {
    sessionId: UUID;
}
/**
 * Confirmación de entrada a una sesión.
 */
export interface SessionJoinResponse {
    sessionId: UUID;
    role: SocketClientRole;
    joined: true;
}
/**
 * Estado general de la sesión.
 */
export interface SessionStatePayload {
    sessionId: UUID;
    status: ProjectionSessionStatus;
    playerConnectionStatus: PlayerConnectionStatus;
}
/**
 * Escena completa que recibe el reproductor.
 *
 * Se utiliza al iniciar o recuperar
 * una conexión.
 */
export interface SceneLoadPayload {
    sessionId: UUID;
    project: Project;
    surfaces: Surface[];
    media: MediaAsset[];
}
/**
 * Notificación de creación de superficie.
 *
 * Se emite después de guardar la superficie
 * mediante REST.
 */
export interface SurfaceCreatePayload {
    sessionId: UUID;
    surface: Surface;
}
/**
 * Cambios temporales de calibración.
 *
 * Contiene exclusivamente las cuatro
 * esquinas de una superficie.
 *
 * No representa una actualización
 * persistente en PostgreSQL.
 */
export interface SurfaceCalibrationChanges {
    corners: Quad;
}
/**
 * Actualización temporal de superficie.
 *
 * Android envía las coordenadas durante
 * la manipulación de los vértices.
 *
 * No implica persistencia en PostgreSQL.
 */
export interface SurfaceUpdatePayload {
    sessionId: UUID;
    surfaceId: UUID;
    changes: SurfaceCalibrationChanges;
}
/**
 * Actualización temporal retransmitida
 * por el servidor.
 *
 * Contiene las coordenadas validadas
 * de la superficie modificada.
 */
export interface SurfaceUpdatedPayload {
    sessionId: UUID;
    surfaceId: UUID;
    changes: SurfaceCalibrationChanges;
}
/**
 * Notificación de eliminación.
 *
 * Se emite después de eliminar
 * la superficie mediante REST.
 */
export interface SurfaceDeletePayload {
    sessionId: UUID;
    surfaceId: UUID;
}
/**
 * Identifica una superficie y el recurso
 * multimedia asociado a su reproducción.
 *
 * El servidor comprobará que el recurso
 * corresponde a la superficie.
 */
export interface MediaPlaybackTarget {
    sessionId: UUID;
    surfaceId: UUID;
}
/**
 * Solicitud para iniciar reproducción.
 */
export interface MediaPlayPayload extends MediaPlaybackTarget {
}
/**
 * Solicitud para pausar reproducción.
 */
export interface MediaPausePayload extends MediaPlaybackTarget {
}
/**
 * Solicitud para cambiar la posición
 * de reproducción.
 */
export interface MediaSeekPayload extends MediaPlaybackTarget {
    timeSeconds: number;
}
/**
 * Estado de reproducción comunicado
 * por el reproductor.
 */
export interface MediaPlaybackStatePayload extends MediaPlaybackTarget {
    playing: boolean;
    currentTimeSeconds: number;
    durationSeconds: number | null;
}
/**
 * Error de operación en Socket.IO.
 */
export interface SocketErrorPayload {
    code: string;
    message: string;
}
/**
 * Respuesta estándar de confirmación
 * para operaciones Socket.IO.
 */
export type SocketAck<T> = {
    ok: true;
    data: T;
} | {
    ok: false;
    error: SocketErrorPayload;
};
/**
 * Confirmación de una operación
 * sin datos adicionales.
 */
export interface SocketOperationAccepted {
    accepted: true;
}
/**
 * Eventos emitidos por el cliente
 * y recibidos por el servidor.
 *
 * Los eventos utilizan callbacks
 * para confirmar la recepción.
 */
export interface ClientToServerEvents {
    "session:join": (payload: SessionJoinPayload, callback: (response: SocketAck<SessionJoinResponse>) => void) => void;
    "surface:update": (payload: SurfaceUpdatePayload, callback: (response: SocketAck<SocketOperationAccepted>) => void) => void;
    "media:play": (payload: MediaPlayPayload, callback: (response: SocketAck<SocketOperationAccepted>) => void) => void;
    "media:pause": (payload: MediaPausePayload, callback: (response: SocketAck<SocketOperationAccepted>) => void) => void;
    "media:seek": (payload: MediaSeekPayload, callback: (response: SocketAck<SocketOperationAccepted>) => void) => void;
    "media:state": (payload: MediaPlaybackStatePayload) => void;
}
/**
 * Eventos emitidos por el servidor
 * y recibidos por los clientes.
 */
export interface ServerToClientEvents {
    "session:state": (payload: SessionStatePayload) => void;
    "scene:load": (payload: SceneLoadPayload) => void;
    "surface:create": (payload: SurfaceCreatePayload) => void;
    "surface:update": (payload: SurfaceUpdatedPayload) => void;
    "surface:delete": (payload: SurfaceDeletePayload) => void;
    "media:play": (payload: MediaPlayPayload) => void;
    "media:pause": (payload: MediaPausePayload) => void;
    "media:seek": (payload: MediaSeekPayload) => void;
    "media:state": (payload: MediaPlaybackStatePayload) => void;
}
/**
 * Eventos utilizados para comunicar
 * información entre instancias
 * del servidor Socket.IO.
 *
 * Reservado para escalabilidad futura.
 */
export interface InterServerEvents {
}
/**
 * Datos asociados a cada conexión
 * después de autenticarla.
 */
export interface SocketData {
    sessionId?: UUID;
    role?: SocketClientRole;
    authenticatedAt?: ISODateString;
}
//# sourceMappingURL=socket.types.d.ts.map