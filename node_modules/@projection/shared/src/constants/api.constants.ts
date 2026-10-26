
/**
 * Prefijo principal de la API REST.
 */
export const API_PREFIX = "/api" as const;

/**
 * Versión del contrato compartido.
 *
 * Es informativa y no modifica
 * automáticamente las rutas HTTP.
 */
export const API_VERSION = "1.0.0" as const;

/**
 * Rutas de autenticación.
 */
export const AUTH_ROUTES = {
  register: `${API_PREFIX}/auth/register`,
  login: `${API_PREFIX}/auth/login`,
  me: `${API_PREFIX}/auth/me`,
  refresh: `${API_PREFIX}/auth/refresh`,
  logout: `${API_PREFIX}/auth/logout`
} as const;

/**
 * Rutas de proyectos.
 */
export const PROJECT_ROUTES = {
  base: `${API_PREFIX}/projects`,

  byId: (projectId: string) =>
    `${API_PREFIX}/projects/${encodeURIComponent(projectId)}`,

  surfaces: (projectId: string) =>
    `${API_PREFIX}/projects/${encodeURIComponent(projectId)}/surfaces`,

  media: (projectId: string) =>
    `${API_PREFIX}/projects/${encodeURIComponent(projectId)}/media`
} as const;

/**
 * Rutas de superficies individuales.
 */
export const SURFACE_ROUTES = {
  byId: (surfaceId: string) =>
    `${API_PREFIX}/surfaces/${encodeURIComponent(surfaceId)}`
} as const;

/**
 * Rutas de recursos multimedia.
 */
export const MEDIA_ROUTES = {
  byId: (mediaId: string) =>
    `${API_PREFIX}/media/${encodeURIComponent(mediaId)}`,

  content: (mediaId: string) =>
    `${API_PREFIX}/media/${encodeURIComponent(mediaId)}/content`
} as const;

/**
 * Rutas de sesiones de proyección.
 */

export const SESSION_ROUTES = {
  base: `${API_PREFIX}/sessions`,

  byId: (sessionId: string) =>
    `${API_PREFIX}/sessions/${encodeURIComponent(sessionId)}`,

  // El proyector solicita un código temporal.
  pairing: `${API_PREFIX}/sessions/pairing`,

  // Android introduce el código y selecciona el proyecto.
  pair: `${API_PREFIX}/sessions/pair`,

  // El proyector consulta el resultado de la vinculación.
  pairingStatus: `${API_PREFIX}/sessions/pairing/status`,

  end: (sessionId: string) =>
    `${API_PREFIX}/sessions/${encodeURIComponent(sessionId)}/end`
} as const;


/**
 * Agrupación de rutas públicas
 * del contrato REST.
 */
export const API_ROUTES = {
  auth: AUTH_ROUTES,
  projects: PROJECT_ROUTES,
  surfaces: SURFACE_ROUTES,
  media: MEDIA_ROUTES,
  sessions: SESSION_ROUTES
} as const;

/**
 * Métodos HTTP admitidos.
 */
export const HTTP_METHOD = {
  GET: "GET",
  POST: "POST",
  PATCH: "PATCH",
  DELETE: "DELETE"
} as const;

/**
 * Códigos de estado HTTP utilizados
 * por el backend.
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  INTERNAL_SERVER_ERROR: 500
} as const;

/**
 * Encabezados HTTP comunes.
 */
export const HTTP_HEADERS = {
  AUTHORIZATION: "Authorization",
  CONTENT_TYPE: "Content-Type",
  ACCEPT: "Accept",
  RANGE: "Range",
  CONTENT_RANGE: "Content-Range",
  ACCEPT_RANGES: "Accept-Ranges"
} as const;

/**
 * Tipos de contenido utilizados
 * por la API.
 */
export const CONTENT_TYPES = {
  JSON: "application/json",
  MULTIPART_FORM_DATA: "multipart/form-data"
} as const;

/**
 * Configuración predeterminada
 * para paginación futura.
 *
 * Los endpoints actuales de listado
 * siguen devolviendo sus contratos
 * originales sin paginación.
 */
export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100
} as const;
