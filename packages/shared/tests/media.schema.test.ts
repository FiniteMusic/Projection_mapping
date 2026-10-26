
import {
  describe,
  expect,
  it
} from "vitest";

import {
  MEBIBYTE,
  MEDIA_LIMITS,
  mediaTypeSchema,
  supportedMediaMimeTypeSchema,
  mediaStatusSchema,
  mediaNameSchema,
  mediaDimensionsSchema,
  mediaSizeBytesSchema,
  mediaDurationSchema,
  isMediaMimeCompatible,
  mediaFileMetadataSchema,
  uploadMediaFieldsSchema,
  updateMediaRequestSchema
} from "../src/index.js";

describe("Media Schemas", () => {

  const validImage = {
    type: "image",
    mimeType: "image/png",
    sizeBytes: 5 * MEBIBYTE,
    dimensions: {
      width: 1920,
      height: 1080
    },
    durationSeconds: null
  };

  const validVideo = {
    type: "video",
    mimeType: "video/mp4",
    sizeBytes: 50 * MEBIBYTE,
    dimensions: {
      width: 1920,
      height: 1080
    },
    durationSeconds: 120
  };

  describe("mediaTypeSchema", () => {

    it.each(["image", "video"])(
      "acepta el tipo %s",
      (type) => {
        expect(
          mediaTypeSchema.safeParse(type).success
        ).toBe(true);
      }
    );

    it("rechaza tipos desconocidos", () => {
      expect(
        mediaTypeSchema.safeParse("audio").success
      ).toBe(false);
    });

  });

  describe("supportedMediaMimeTypeSchema", () => {

    it.each([
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4"
    ])("acepta el formato %s", (mimeType) => {
      expect(
        supportedMediaMimeTypeSchema.safeParse(mimeType).success
      ).toBe(true);
    });

    it.each([
      "image/gif",
      "image/svg+xml",
      "video/webm",
      "video/quicktime",
      "audio/mpeg"
    ])("rechaza el formato %s", (mimeType) => {
      expect(
        supportedMediaMimeTypeSchema.safeParse(mimeType).success
      ).toBe(false);
    });

  });

  describe("mediaStatusSchema", () => {

    it.each([
      "processing",
      "ready",
      "failed"
    ])("acepta el estado %s", (status) => {
      expect(
        mediaStatusSchema.safeParse(status).success
      ).toBe(true);
    });

    it("rechaza estados desconocidos", () => {
      expect(
        mediaStatusSchema.safeParse("deleted").success
      ).toBe(false);
    });

  });

  describe("mediaNameSchema", () => {

    it("acepta un nombre válido", () => {
      expect(
        mediaNameSchema.safeParse("Video principal").success
      ).toBe(true);
    });

    it("elimina espacios al inicio y al final", () => {
      expect(
        mediaNameSchema.parse("  Video principal  ")
      ).toBe("Video principal");
    });

    it("rechaza nombres vacíos", () => {
      expect(
        mediaNameSchema.safeParse("   ").success
      ).toBe(false);
    });

    it("rechaza nombres mayores a 255 caracteres", () => {
      expect(
        mediaNameSchema.safeParse("A".repeat(256)).success
      ).toBe(false);
    });

  });

  describe("mediaDimensionsSchema", () => {

    it("acepta dimensiones válidas", () => {
      expect(
        mediaDimensionsSchema.safeParse({
          width: 1920,
          height: 1080
        }).success
      ).toBe(true);
    });

    it("acepta dimensiones en el límite máximo", () => {
      expect(
        mediaDimensionsSchema.safeParse({
          width: MEDIA_LIMITS.maxDimension,
          height: MEDIA_LIMITS.maxDimension
        }).success
      ).toBe(true);
    });

    it("rechaza dimensiones superiores al máximo", () => {
      expect(
        mediaDimensionsSchema.safeParse({
          width: MEDIA_LIMITS.maxDimension + 1,
          height: 1080
        }).success
      ).toBe(false);
    });

    it("rechaza dimensiones negativas", () => {
      expect(
        mediaDimensionsSchema.safeParse({
          width: -100,
          height: 720
        }).success
      ).toBe(false);
    });

    it("rechaza dimensiones decimales", () => {
      expect(
        mediaDimensionsSchema.safeParse({
          width: 1920.5,
          height: 1080
        }).success
      ).toBe(false);
    });

    it("rechaza propiedades adicionales", () => {
      expect(
        mediaDimensionsSchema.safeParse({
          width: 1920,
          height: 1080,
          depth: 100
        }).success
      ).toBe(false);
    });

  });

  describe("mediaSizeBytesSchema", () => {

    it("acepta tamaños positivos", () => {
      expect(
        mediaSizeBytesSchema.safeParse(1024).success
      ).toBe(true);
    });

    it("rechaza archivos de cero bytes", () => {
      expect(
        mediaSizeBytesSchema.safeParse(0).success
      ).toBe(false);
    });

    it("rechaza tamaños negativos", () => {
      expect(
        mediaSizeBytesSchema.safeParse(-1024).success
      ).toBe(false);
    });

    it("rechaza tamaños decimales", () => {
      expect(
        mediaSizeBytesSchema.safeParse(1024.5).success
      ).toBe(false);
    });

  });

  describe("mediaDurationSchema", () => {

    it("acepta null", () => {
      expect(
        mediaDurationSchema.safeParse(null).success
      ).toBe(true);
    });

    it("acepta una duración válida", () => {
      expect(
        mediaDurationSchema.safeParse(120).success
      ).toBe(true);
    });

    it("acepta el límite de 600 segundos", () => {
      expect(
        mediaDurationSchema.safeParse(
          MEDIA_LIMITS.maxVideoDurationSeconds
        ).success
      ).toBe(true);
    });

    it("rechaza duraciones superiores al máximo", () => {
      expect(
        mediaDurationSchema.safeParse(601).success
      ).toBe(false);
    });

    it("rechaza duraciones negativas", () => {
      expect(
        mediaDurationSchema.safeParse(-1).success
      ).toBe(false);
    });

    it("rechaza valores infinitos", () => {
      expect(
        mediaDurationSchema.safeParse(Infinity).success
      ).toBe(false);
    });

  });

  describe("isMediaMimeCompatible", () => {

    it.each([
      "image/jpeg",
      "image/png",
      "image/webp"
    ] as const)(
      "acepta %s para imágenes",
      (mimeType) => {
        expect(
          isMediaMimeCompatible("image", mimeType)
        ).toBe(true);
      }
    );

    it("rechaza video/mp4 para imágenes", () => {
      expect(
        isMediaMimeCompatible("image", "video/mp4")
      ).toBe(false);
    });

    it("acepta video/mp4 para videos", () => {
      expect(
        isMediaMimeCompatible("video", "video/mp4")
      ).toBe(true);
    });

    it("rechaza image/png para videos", () => {
      expect(
        isMediaMimeCompatible("video", "image/png")
      ).toBe(false);
    });

  });

  describe("mediaFileMetadataSchema", () => {

    it("acepta metadatos de imagen válidos", () => {
      expect(
        mediaFileMetadataSchema.safeParse(validImage).success
      ).toBe(true);
    });

    it("acepta metadatos de video válidos", () => {
      expect(
        mediaFileMetadataSchema.safeParse(validVideo).success
      ).toBe(true);
    });

    it("acepta imágenes de exactamente 20 MiB", () => {
      expect(
        mediaFileMetadataSchema.safeParse({
          ...validImage,
          sizeBytes: MEDIA_LIMITS.imageMaxBytes
        }).success
      ).toBe(true);
    });

    it("rechaza imágenes mayores a 20 MiB", () => {
      expect(
        mediaFileMetadataSchema.safeParse({
          ...validImage,
          sizeBytes: MEDIA_LIMITS.imageMaxBytes + 1
        }).success
      ).toBe(false);
    });

    it("acepta videos de exactamente 100 MiB", () => {
      expect(
        mediaFileMetadataSchema.safeParse({
          ...validVideo,
          sizeBytes: MEDIA_LIMITS.videoMaxBytes
        }).success
      ).toBe(true);
    });

    it("rechaza videos mayores a 100 MiB", () => {
      expect(
        mediaFileMetadataSchema.safeParse({
          ...validVideo,
          sizeBytes: MEDIA_LIMITS.videoMaxBytes + 1
        }).success
      ).toBe(false);
    });

    it("rechaza un MIME incompatible con el tipo", () => {
      expect(
        mediaFileMetadataSchema.safeParse({
          ...validImage,
          mimeType: "video/mp4"
        }).success
      ).toBe(false);
    });

    it("rechaza imágenes con duración numérica", () => {
      expect(
        mediaFileMetadataSchema.safeParse({
          ...validImage,
          durationSeconds: 10
        }).success
      ).toBe(false);
    });

    it("rechaza videos con duración null", () => {
      expect(
        mediaFileMetadataSchema.safeParse({
          ...validVideo,
          durationSeconds: null
        }).success
      ).toBe(false);
    });

    it("rechaza videos con duración cero", () => {
      expect(
        mediaFileMetadataSchema.safeParse({
          ...validVideo,
          durationSeconds: 0
        }).success
      ).toBe(false);
    });

    it("rechaza videos de más de 600 segundos", () => {
      expect(
        mediaFileMetadataSchema.safeParse({
          ...validVideo,
          durationSeconds: 601
        }).success
      ).toBe(false);
    });

    it("rechaza dimensiones superiores al límite", () => {
      expect(
        mediaFileMetadataSchema.safeParse({
          ...validImage,
          dimensions: {
            width: 8193,
            height: 1080
          }
        }).success
      ).toBe(false);
    });

    it("rechaza propiedades desconocidas", () => {
      expect(
        mediaFileMetadataSchema.safeParse({
          ...validImage,
          executable: true
        }).success
      ).toBe(false);
    });

  });

  describe("uploadMediaFieldsSchema", () => {

    it("acepta una carga sin nombre personalizado", () => {
      expect(
        uploadMediaFieldsSchema.safeParse({}).success
      ).toBe(true);
    });

    it("acepta un nombre personalizado", () => {
      expect(
        uploadMediaFieldsSchema.safeParse({
          name: "Video de presentación"
        }).success
      ).toBe(true);
    });

    it("rechaza un nombre vacío", () => {
      expect(
        uploadMediaFieldsSchema.safeParse({
          name: "   "
        }).success
      ).toBe(false);
    });

    it("rechaza propiedades adicionales", () => {
      expect(
        uploadMediaFieldsSchema.safeParse({
          name: "Video",
          ownerId: "usuario-externo"
        }).success
      ).toBe(false);
    });

  });

  describe("updateMediaRequestSchema", () => {

    it("acepta modificar el nombre", () => {
      expect(
        updateMediaRequestSchema.safeParse({
          name: "Nuevo nombre"
        }).success
      ).toBe(true);
    });

    it("rechaza actualizaciones con nombre undefined", () => {
      const result = updateMediaRequestSchema.safeParse({
        name: undefined
      });

      expect(result.success).toBe(false);
    });

    it("elimina espacios del nombre actualizado", () => {
      const result = updateMediaRequestSchema.safeParse({
        name: "  Video principal  "
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.name).toBe("Video principal");
      }
    });

    it("rechaza actualizaciones vacías", () => {
      expect(
        updateMediaRequestSchema.safeParse({}).success
      ).toBe(false);
    });

    it("rechaza nombres vacíos", () => {
      expect(
        updateMediaRequestSchema.safeParse({
          name: ""
        }).success
      ).toBe(false);
    });

    it("rechaza modificar el tipo multimedia", () => {
      expect(
        updateMediaRequestSchema.safeParse({
          type: "video"
        }).success
      ).toBe(false);
    });

    it("rechaza modificar el tamaño del archivo", () => {
      expect(
        updateMediaRequestSchema.safeParse({
          sizeBytes: 1024
        }).success
      ).toBe(false);
    });

  });

  describe("Consistencia de límites", () => {

    it("define correctamente el MiB", () => {
      expect(MEBIBYTE).toBe(1024 * 1024);
    });

    it("establece 20 MiB para imágenes", () => {
      expect(MEDIA_LIMITS.imageMaxBytes).toBe(
        20 * MEBIBYTE
      );
    });

    it("establece 100 MiB para videos", () => {
      expect(MEDIA_LIMITS.videoMaxBytes).toBe(
        100 * MEBIBYTE
      );
    });

    it("establece 8192 como dimensión máxima", () => {
      expect(MEDIA_LIMITS.maxDimension).toBe(8192);
    });

    it("establece 600 segundos como duración máxima", () => {
      expect(
        MEDIA_LIMITS.maxVideoDurationSeconds
      ).toBe(600);
    });

  });

});
