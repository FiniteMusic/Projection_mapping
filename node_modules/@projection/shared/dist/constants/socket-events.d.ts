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
export declare const CLIENT_SOCKET_EVENTS: {
    readonly SESSION_JOIN: "session:join";
    readonly SURFACE_UPDATE: "surface:update";
    readonly MEDIA_PLAY: "media:play";
    readonly MEDIA_PAUSE: "media:pause";
    readonly MEDIA_SEEK: "media:seek";
    readonly MEDIA_STATE: "media:state";
};
/**
 * Eventos emitidos por el servidor
 * y recibidos por los clientes.
 */
export declare const SERVER_SOCKET_EVENTS: {
    readonly SESSION_STATE: "session:state";
    readonly SCENE_LOAD: "scene:load";
    readonly SURFACE_CREATE: "surface:create";
    readonly SURFACE_UPDATE: "surface:update";
    readonly SURFACE_DELETE: "surface:delete";
    readonly MEDIA_PLAY: "media:play";
    readonly MEDIA_PAUSE: "media:pause";
    readonly MEDIA_SEEK: "media:seek";
    readonly MEDIA_STATE: "media:state";
};
/**
 * Agrupación de eventos Socket.IO.
 *
 * Permite acceder a los eventos
 * según la dirección del mensaje.
 */
export declare const SOCKET_EVENTS: {
    readonly CLIENT: {
        readonly SESSION_JOIN: "session:join";
        readonly SURFACE_UPDATE: "surface:update";
        readonly MEDIA_PLAY: "media:play";
        readonly MEDIA_PAUSE: "media:pause";
        readonly MEDIA_SEEK: "media:seek";
        readonly MEDIA_STATE: "media:state";
    };
    readonly SERVER: {
        readonly SESSION_STATE: "session:state";
        readonly SCENE_LOAD: "scene:load";
        readonly SURFACE_CREATE: "surface:create";
        readonly SURFACE_UPDATE: "surface:update";
        readonly SURFACE_DELETE: "surface:delete";
        readonly MEDIA_PLAY: "media:play";
        readonly MEDIA_PAUSE: "media:pause";
        readonly MEDIA_SEEK: "media:seek";
        readonly MEDIA_STATE: "media:state";
    };
};
/**
 * Tipos derivados de las constantes.
 *
 * Se utilizan para restringir
 * los nombres de eventos admitidos.
 */
export type ClientSocketEventName = typeof CLIENT_SOCKET_EVENTS[keyof typeof CLIENT_SOCKET_EVENTS];
export type ServerSocketEventName = typeof SERVER_SOCKET_EVENTS[keyof typeof SERVER_SOCKET_EVENTS];
/**
 * Configuración inicial para eventos
 * de actualización de superficies.
 *
 * Se recomienda limitar las emisiones
 * durante el arrastre de vértices.
 */
export declare const SOCKET_CONFIG: {
    readonly surfaceUpdateIntervalMs: 50;
    readonly acknowledgmentTimeoutMs: 5000;
    readonly reconnectionAttempts: 10;
    readonly reconnectionDelayMs: 1000;
    readonly reconnectionDelayMaxMs: 5000;
};
/**
 * Prefijo utilizado para construir
 * nombres de salas internas.
 *
 * No debe utilizarse como mecanismo
 * de autorización.
 */
export declare const SOCKET_ROOM_PREFIX: "session";
/**
 * Construye el identificador interno
 * de una sala de Socket.IO.
 */
export declare function getSessionRoom(sessionId: string): string;
//# sourceMappingURL=socket-events.d.ts.map