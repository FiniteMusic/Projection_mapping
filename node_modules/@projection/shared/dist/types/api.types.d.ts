/**
 * Tipos comunes para las respuestas HTTP
 * del sistema Projection Mapping.
 */
/**
 * Códigos de error reconocidos por la API.
 *
 * El frontend debe utilizar estos códigos
 * para identificar errores específicos.
 */
export type ApiErrorCode = "VALIDATION_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "PAYLOAD_TOO_LARGE" | "UNSUPPORTED_MEDIA_TYPE" | "MEDIA_PROCESSING_FAILED" | "PAIRING_CODE_INVALID" | "PAIRING_CODE_EXPIRED" | "SESSION_ENDED" | "RATE_LIMIT_EXCEEDED" | "INTERNAL_SERVER_ERROR";
/**
 * Detalle de un error de validación.
 *
 * field: ruta del campo inválido.
 * message: explicación del problema.
 */
export interface ValidationIssue {
    field: string;
    message: string;
}
/**
 * Información estructurada de un error.
 */
export interface ApiError {
    code: ApiErrorCode;
    message: string;
    /**
     * Detalles adicionales de validación.
     *
     * Se incluye únicamente cuando
     * corresponde al error.
     */
    details?: ValidationIssue[];
}
/**
 * Formato estándar de las respuestas
 * HTTP fallidas.
 */
export interface ApiErrorResponse {
    error: ApiError;
}
/**
 * Parámetros de consulta para endpoints
 * que admiten paginación.
 *
 * Ejemplo:
 * GET /api/projects?page=1&limit=20
 */
export interface PaginationQuery {
    page?: number;
    limit?: number;
}
/**
 * Metadatos de una lista paginada.
 */
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
/**
 * Respuesta genérica paginada.
 *
 * T representa el tipo de elemento
 * contenido en la colección.
 */
export interface PaginatedResponse<T> {
    items: T[];
    pagination: PaginationMeta;
}
/**
 * Respuesta HTTP exitosa con contenido.
 *
 * Se utiliza para tipar el resultado
 * de una operación en el cliente.
 */
export interface ApiSuccess<T> {
    ok: true;
    data: T;
}
/**
 * Resultado fallido de una operación.
 */
export interface ApiFailure {
    ok: false;
    error: ApiError;
}
/**
 * Resultado discriminado que pueden
 * utilizar los servicios del frontend.
 *
 * No representa necesariamente el JSON
 * devuelto directamente por Express.
 */
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;
//# sourceMappingURL=api.types.d.ts.map