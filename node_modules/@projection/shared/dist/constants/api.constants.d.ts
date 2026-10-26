/**
 * Prefijo principal de la API REST.
 */
export declare const API_PREFIX: "/api";
/**
 * Versión del contrato compartido.
 *
 * Es informativa y no modifica
 * automáticamente las rutas HTTP.
 */
export declare const API_VERSION: "1.0.0";
/**
 * Rutas de autenticación.
 */
export declare const AUTH_ROUTES: {
    readonly register: "/api/auth/register";
    readonly login: "/api/auth/login";
    readonly me: "/api/auth/me";
    readonly refresh: "/api/auth/refresh";
    readonly logout: "/api/auth/logout";
};
/**
 * Rutas de proyectos.
 */
export declare const PROJECT_ROUTES: {
    readonly base: "/api/projects";
    readonly byId: (projectId: string) => string;
    readonly surfaces: (projectId: string) => string;
    readonly media: (projectId: string) => string;
};
/**
 * Rutas de superficies individuales.
 */
export declare const SURFACE_ROUTES: {
    readonly byId: (surfaceId: string) => string;
};
/**
 * Rutas de recursos multimedia.
 */
export declare const MEDIA_ROUTES: {
    readonly byId: (mediaId: string) => string;
    readonly content: (mediaId: string) => string;
};
/**
 * Rutas de sesiones de proyección.
 */
export declare const SESSION_ROUTES: {
    readonly base: "/api/sessions";
    readonly byId: (sessionId: string) => string;
    readonly pairing: "/api/sessions/pairing";
    readonly pair: "/api/sessions/pair";
    readonly pairingStatus: "/api/sessions/pairing/status";
    readonly end: (sessionId: string) => string;
};
/**
 * Agrupación de rutas públicas
 * del contrato REST.
 */
export declare const API_ROUTES: {
    readonly auth: {
        readonly register: "/api/auth/register";
        readonly login: "/api/auth/login";
        readonly me: "/api/auth/me";
        readonly refresh: "/api/auth/refresh";
        readonly logout: "/api/auth/logout";
    };
    readonly projects: {
        readonly base: "/api/projects";
        readonly byId: (projectId: string) => string;
        readonly surfaces: (projectId: string) => string;
        readonly media: (projectId: string) => string;
    };
    readonly surfaces: {
        readonly byId: (surfaceId: string) => string;
    };
    readonly media: {
        readonly byId: (mediaId: string) => string;
        readonly content: (mediaId: string) => string;
    };
    readonly sessions: {
        readonly base: "/api/sessions";
        readonly byId: (sessionId: string) => string;
        readonly pairing: "/api/sessions/pairing";
        readonly pair: "/api/sessions/pair";
        readonly pairingStatus: "/api/sessions/pairing/status";
        readonly end: (sessionId: string) => string;
    };
};
/**
 * Métodos HTTP admitidos.
 */
export declare const HTTP_METHOD: {
    readonly GET: "GET";
    readonly POST: "POST";
    readonly PATCH: "PATCH";
    readonly DELETE: "DELETE";
};
/**
 * Códigos de estado HTTP utilizados
 * por el backend.
 */
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly PAYLOAD_TOO_LARGE: 413;
    readonly UNSUPPORTED_MEDIA_TYPE: 415;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
};
/**
 * Encabezados HTTP comunes.
 */
export declare const HTTP_HEADERS: {
    readonly AUTHORIZATION: "Authorization";
    readonly CONTENT_TYPE: "Content-Type";
    readonly ACCEPT: "Accept";
    readonly RANGE: "Range";
    readonly CONTENT_RANGE: "Content-Range";
    readonly ACCEPT_RANGES: "Accept-Ranges";
};
/**
 * Tipos de contenido utilizados
 * por la API.
 */
export declare const CONTENT_TYPES: {
    readonly JSON: "application/json";
    readonly MULTIPART_FORM_DATA: "multipart/form-data";
};
/**
 * Configuración predeterminada
 * para paginación futura.
 *
 * Los endpoints actuales de listado
 * siguen devolviendo sus contratos
 * originales sin paginación.
 */
export declare const PAGINATION_DEFAULTS: {
    readonly page: 1;
    readonly limit: 20;
    readonly maxLimit: 100;
};
//# sourceMappingURL=api.constants.d.ts.map