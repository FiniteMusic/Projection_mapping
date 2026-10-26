
import { z } from "zod";

/**
 * Unidades de almacenamiento.
 */
export const MEBIBYTE = 1024 * 1024;

/**
 * Límites de recursos multimedia.
 *
 * Los valores se expresan en bytes
 * y segundos, según corresponda.
 */
export const MEDIA_LIMITS = {
  imageMaxBytes: 20 * MEBIBYTE,
  videoMaxBytes: 100 * MEBIBYTE,
  maxDimension: 8192,
  maxVideoDurationSeconds: 600
} as const;

/**
 * Tipos generales de recursos multimedia.
 */
export const mediaTypeSchema = z.enum([
  "image",
  "video"
]);

/**
 * Formatos MIME admitidos.
 */
export const supportedMediaMimeTypeSchema = z.enum([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4"
]);

/**
 * Estados del procesamiento multimedia.
 */
export const mediaStatusSchema = z.enum([
  "processing",
  "ready",
  "failed"
]);

/**
 * Nombre de un recurso multimedia.
 */
export const mediaNameSchema = z
  .string()
  .trim()
  .min(1, "El nombre del recurso es obligatorio.")
  .max(255, "El nombre no puede superar 255 caracteres.");

/**
 * Dimensiones del recurso multimedia.
 */
export const mediaDimensionsSchema = z.strictObject({
  width: z
    .number()
    .int()
    .min(1)
    .max(MEDIA_LIMITS.maxDimension),

  height: z
    .number()
    .int()
    .min(1)
    .max(MEDIA_LIMITS.maxDimension)
});

/**
 * Tamaño de archivo en bytes.
 */
export const mediaSizeBytesSchema = z
  .number()
  .int()
  .positive();

/**
 * Duración del recurso multimedia.
 *
 * Las imágenes no tienen duración,
 * por lo que se admite null.
 */
export const mediaDurationSchema = z
  .number()
  .finite()
  .min(0)
  .max(MEDIA_LIMITS.maxVideoDurationSeconds)
  .nullable();

/**
 * Verifica que un MIME corresponda
 * al tipo general del recurso.
 */
export function isMediaMimeCompatible(
  type: "image" | "video",
  mimeType: z.infer<typeof supportedMediaMimeTypeSchema>
): boolean {
  if (type === "image") {
    return (
      mimeType === "image/jpeg" ||
      mimeType === "image/png" ||
      mimeType === "image/webp"
    );
  }

  return mimeType === "video/mp4";
}

/**
 * Metadatos técnicos de un archivo.
 *
 * Estos datos deberán obtenerse o
 * verificarse desde el servidor.
 */
export const mediaFileMetadataSchema = z
  .strictObject({
    type: mediaTypeSchema,
    mimeType: supportedMediaMimeTypeSchema,
    sizeBytes: mediaSizeBytesSchema,
    dimensions: mediaDimensionsSchema,
    durationSeconds: mediaDurationSchema
  })
  .superRefine((data, ctx) => {
    if (!isMediaMimeCompatible(data.type, data.mimeType)) {
      ctx.addIssue({
        code: "custom",
        path: ["mimeType"],
        message: "El formato MIME no corresponde al tipo multimedia."
      });
    }

    const maxBytes =
      data.type === "image"
        ? MEDIA_LIMITS.imageMaxBytes
        : MEDIA_LIMITS.videoMaxBytes;

    if (data.sizeBytes > maxBytes) {
      ctx.addIssue({
        code: "custom",
        path: ["sizeBytes"],
        message: "El archivo supera el tamaño máximo permitido."
      });
    }

    if (data.type === "image" && data.durationSeconds !== null) {
      ctx.addIssue({
        code: "custom",
        path: ["durationSeconds"],
        message: "Las imágenes deben tener una duración null."
      });
    }

    if (data.type === "video" && (
      data.durationSeconds === null ||
      data.durationSeconds <= 0
    )) {
      ctx.addIssue({
        code: "custom",
        path: ["durationSeconds"],
        message: "Los videos deben tener una duración mayor que cero."
      });
    }
  });

/**
 * Campos adicionales enviados
 * durante la carga de archivos.
 *
 * POST /api/projects/:projectId/media
 *
 * El archivo se recibe mediante
 * multipart/form-data en el campo file.
 */
export const uploadMediaFieldsSchema = z.strictObject({
  name: mediaNameSchema.optional()
});

/**
 * Solicitud para modificar el nombre
 * de un recurso multimedia.
 *
 * PATCH /api/media/:mediaId
 */
export const updateMediaRequestSchema = z
  .strictObject({
    name: mediaNameSchema.optional()
  })
  .refine(
    data => data.name !== undefined,
    "Debe proporcionar un nombre válido para actualizar."
  );
