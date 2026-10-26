/**
 * Eventos emitidos por los clientes
 * y recibidos por el servidor.
 *
 * Android puede emitir instrucciones
 * de calibración y reproducción.
 *
 * El reproductor utiliza session:join
 * para incorporarse a su sesión.
 *
 * Los permisos efectivos se validan
 * en el backend.
 */
export const CLIENT_SOCKET_EVENTS = {
    SESSION_JOIN: "session:join",
    SURFACE_UPDATE: "surface:update",
    MEDIA_PLAY: "media:play",
    MEDIA_PAUSE: "media:pause",
    MEDIA_SEEK: "media:seek",
    MEDIA_STATE: "media:state"
};
/**
 * Eventos emitidos por el servidor
 * y recibidos por los clientes.
 */
export const SERVER_SOCKET_EVENTS = {
    SESSION_STATE: "session:state",
    SCENE_LOAD: "scene:load",
    SURFACE_CREATE: "surface:create",
    SURFACE_UPDATE: "surface:update",
    SURFACE_DELETE: "surface:delete",
    MEDIA_PLAY: "media:play",
    MEDIA_PAUSE: "media:pause",
    MEDIA_SEEK: "media:seek",
    MEDIA_STATE: "media:state"
};
/**
 * Agrupación de eventos Socket.IO.
 *
 * Permite acceder a los eventos
 * según la dirección del mensaje.
 */
export const SOCKET_EVENTS = {
    CLIENT: CLIENT_SOCKET_EVENTS,
    SERVER: SERVER_SOCKET_EVENTS
};
/**
 * Configuración inicial para eventos
 * de actualización de superficies.
 *
 * Se recomienda limitar las emisiones
 * durante el arrastre de vértices.
 */
export const SOCKET_CONFIG = {
    surfaceUpdateIntervalMs: 50,
    acknowledgmentTimeoutMs: 5000,
    reconnectionAttempts: 10,
    reconnectionDelayMs: 1000,
    reconnectionDelayMaxMs: 5000
};
/**
 * Prefijo utilizado para construir
 * nombres de salas internas.
 *
 * No debe utilizarse como mecanismo
 * de autorización.
 */
export const SOCKET_ROOM_PREFIX = "session";
/**
 * Construye el identificador interno
 * de una sala de Socket.IO.
 */
export function getSessionRoom(sessionId) {
    return `${SOCKET_ROOM_PREFIX}:${sessionId}`;
}
//# sourceMappingURL=socket-events.js.map