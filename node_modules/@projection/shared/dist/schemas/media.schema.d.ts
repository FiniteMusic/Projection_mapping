import { z } from "zod";
/**
 * Unidades de almacenamiento.
 */
export declare const MEBIBYTE: number;
/**
 * Límites de recursos multimedia.
 *
 * Los valores se expresan en bytes
 * y segundos, según corresponda.
 */
export declare const MEDIA_LIMITS: {
    readonly imageMaxBytes: number;
    readonly videoMaxBytes: number;
    readonly maxDimension: 8192;
    readonly maxVideoDurationSeconds: 600;
};
/**
 * Tipos generales de recursos multimedia.
 */
export declare const mediaTypeSchema: z.ZodEnum<{
    image: "image";
    video: "video";
}>;
/**
 * Formatos MIME admitidos.
 */
export declare const supportedMediaMimeTypeSchema: z.ZodEnum<{
    "image/jpeg": "image/jpeg";
    "image/png": "image/png";
    "image/webp": "image/webp";
    "video/mp4": "video/mp4";
}>;
/**
 * Estados del procesamiento multimedia.
 */
export declare const mediaStatusSchema: z.ZodEnum<{
    ready: "ready";
    processing: "processing";
    failed: "failed";
}>;
/**
 * Nombre de un recurso multimedia.
 */
export declare const mediaNameSchema: z.ZodString;
/**
 * Dimensiones del recurso multimedia.
 */
export declare const mediaDimensionsSchema: z.ZodObject<{
    width: z.ZodNumber;
    height: z.ZodNumber;
}, z.core.$strict>;
/**
 * Tamaño de archivo en bytes.
 */
export declare const mediaSizeBytesSchema: z.ZodNumber;
/**
 * Duración del recurso multimedia.
 *
 * Las imágenes no tienen duración,
 * por lo que se admite null.
 */
export declare const mediaDurationSchema: z.ZodNullable<z.ZodNumber>;
/**
 * Verifica que un MIME corresponda
 * al tipo general del recurso.
 */
export declare function isMediaMimeCompatible(type: "image" | "video", mimeType: z.infer<typeof supportedMediaMimeTypeSchema>): boolean;
/**
 * Metadatos técnicos de un archivo.
 *
 * Estos datos deberán obtenerse o
 * verificarse desde el servidor.
 */
export declare const mediaFileMetadataSchema: z.ZodObject<{
    type: z.ZodEnum<{
        image: "image";
        video: "video";
    }>;
    mimeType: z.ZodEnum<{
        "image/jpeg": "image/jpeg";
        "image/png": "image/png";
        "image/webp": "image/webp";
        "video/mp4": "video/mp4";
    }>;
    sizeBytes: z.ZodNumber;
    dimensions: z.ZodObject<{
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, z.core.$strict>;
    durationSeconds: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>;
/**
 * Campos adicionales enviados
 * durante la carga de archivos.
 *
 * POST /api/projects/:projectId/media
 *
 * El archivo se recibe mediante
 * multipart/form-data en el campo file.
 */
export declare const uploadMediaFieldsSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
/**
 * Solicitud para modificar el nombre
 * de un recurso multimedia.
 *
 * PATCH /api/media/:mediaId
 */
export declare const updateMediaRequestSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
//# sourceMappingURL=media.schema.d.ts.map