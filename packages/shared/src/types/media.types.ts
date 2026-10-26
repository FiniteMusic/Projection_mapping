
import type {
  UUID,
  ISODateString,
  Dimensions
} from "./common.types.js";

/**
 * Tipos de recursos multimedia admitidos.
 */
export type MediaType = "image" | "video";

/**
 * Formatos MIME admitidos inicialmente.
 *
 * La compatibilidad real de reproducción
 * dependerá del navegador del proyector.
 */
export type SupportedMediaMimeType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "video/mp4";

/**
 * Estado del procesamiento del archivo.
 */
export type MediaStatus =
  | "processing"
  | "ready"
  | "failed";

/**
 * Recurso multimedia almacenado.
 *
 * La URL es generada por el servidor,
 * no por el cliente.
 */
export interface MediaAsset {
  id: UUID;
  projectId: UUID;

  name: string;
  type: MediaType;
  mimeType: SupportedMediaMimeType;

  url: string;
  sizeBytes: number;

  dimensions: Dimensions;

  /**
   * Duración en segundos.
   * null para imágenes.
   */
  durationSeconds: number | null;

  status: MediaStatus;

  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/**
 * Campos enviados junto al archivo
 * durante la carga multipart/form-data.
 *
 * POST /api/projects/:projectId/media
 *
 * El archivo se enviará mediante
 * el campo "file" de FormData.
 */
export interface UploadMediaFields {
  name?: string;
}

/**
 * Solicitud para actualizar los
 * metadatos editables de un recurso.
 *
 * PATCH /api/media/:mediaId
 */
export interface UpdateMediaRequest {
  name?: string;
}

/**
 * Respuesta de un recurso multimedia.
 */
export interface MediaResponse {
  media: MediaAsset;
}

/**
 * Respuesta de la biblioteca multimedia
 * de un proyecto.
 */
export interface MediaListResponse {
  media: MediaAsset[];
}
