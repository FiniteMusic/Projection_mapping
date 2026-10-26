
import {
  describe,
  expect,
  it
} from "vitest";

import {
  projectNameSchema,
  projectDescriptionSchema,
  projectStatusSchema,
  canvasDimensionsSchema,
  backgroundColorSchema,
  projectSettingsSchema,
  DEFAULT_PROJECT_SETTINGS,
  DEFAULT_PROJECTION_CANVAS,
  createProjectRequestSchema,
  updateProjectRequestSchema
} from "../src/index.js";

describe("Project Schemas", () => {

  describe("projectNameSchema", () => {

    it("acepta un nombre válido", () => {
      expect(
        projectNameSchema.safeParse("Mapping principal").success
      ).toBe(true);
    });

    it("elimina espacios al inicio y final", () => {
      expect(
        projectNameSchema.parse("  Mapping principal  ")
      ).toBe("Mapping principal");
    });

    it("rechaza nombres vacíos", () => {
      expect(
        projectNameSchema.safeParse("   ").success
      ).toBe(false);
    });

    it("rechaza nombres mayores a 100 caracteres", () => {
      expect(
        projectNameSchema.safeParse("A".repeat(101)).success
      ).toBe(false);
    });

  });

  describe("projectDescriptionSchema", () => {

    it("acepta una descripción válida", () => {
      expect(
        projectDescriptionSchema.safeParse(
          "Proyección sobre una pared"
        ).success
      ).toBe(true);
    });

    it("acepta null para eliminar una descripción", () => {
      expect(
        projectDescriptionSchema.parse(null)
      ).toBeNull();
    });

    it("rechaza descripciones mayores a 500 caracteres", () => {
      expect(
        projectDescriptionSchema.safeParse(
          "A".repeat(501)
        ).success
      ).toBe(false);
    });

  });

  describe("projectStatusSchema", () => {

    it.each(["draft", "ready", "archived"])(
      "acepta el estado %s",
      (status) => {
        expect(
          projectStatusSchema.safeParse(status).success
        ).toBe(true);
      }
    );

    it("rechaza estados desconocidos", () => {
      expect(
        projectStatusSchema.safeParse("deleted").success
      ).toBe(false);
    });

  });

  describe("canvasDimensionsSchema", () => {

    it("acepta dimensiones válidas", () => {
      expect(
        canvasDimensionsSchema.safeParse({
          width: 1920,
          height: 1080
        }).success
      ).toBe(true);
    });

    it("rechaza dimensiones negativas", () => {
      expect(
        canvasDimensionsSchema.safeParse({
          width: -100,
          height: 720
        }).success
      ).toBe(false);
    });

    it("rechaza dimensiones decimales", () => {
      expect(
        canvasDimensionsSchema.safeParse({
          width: 1280.5,
          height: 720
        }).success
      ).toBe(false);
    });

    it("rechaza dimensiones superiores a 8192", () => {
      expect(
        canvasDimensionsSchema.safeParse({
          width: 8193,
          height: 720
        }).success
      ).toBe(false);
    });

    it("rechaza propiedades adicionales", () => {
      expect(
        canvasDimensionsSchema.safeParse({
          width: 1280,
          height: 720,
          depth: 100
        }).success
      ).toBe(false);
    });

  });

  describe("backgroundColorSchema", () => {

    it("acepta colores hexadecimales", () => {
      expect(
        backgroundColorSchema.safeParse("#1A2B3C").success
      ).toBe(true);
    });

    it("rechaza nombres de colores", () => {
      expect(
        backgroundColorSchema.safeParse("black").success
      ).toBe(false);
    });

    it("rechaza colores hexadecimales incompletos", () => {
      expect(
        backgroundColorSchema.safeParse("#FFF").success
      ).toBe(false);
    });

  });

  describe("projectSettingsSchema", () => {

    it("acepta una configuración completa", () => {
      expect(
        projectSettingsSchema.safeParse({
          canvas: {
            width: 1280,
            height: 720
          },
          backgroundColor: "#000000"
        }).success
      ).toBe(true);
    });

    it("rechaza configuraciones incompletas", () => {
      expect(
        projectSettingsSchema.safeParse({
          canvas: {
            width: 1280,
            height: 720
          }
        }).success
      ).toBe(false);
    });

  });

  describe("createProjectRequestSchema", () => {

    it("acepta una solicitud con solo el nombre", () => {
      expect(
        createProjectRequestSchema.safeParse({
          name: "Mapping principal"
        }).success
      ).toBe(true);
    });

    it("aplica la configuración predeterminada", () => {
      const result = createProjectRequestSchema.parse({
        name: "Mapping principal"
      });

      expect(result.settings).toEqual(
        DEFAULT_PROJECT_SETTINGS
      );
    });

    it("acepta una configuración personalizada", () => {
      const result = createProjectRequestSchema.parse({
        name: "Mapping personalizado",
        settings: {
          canvas: {
            width: 1920,
            height: 1080
          },
          backgroundColor: "#112233"
        }
      });

      expect(result.settings.canvas.width).toBe(1920);
      expect(result.settings.backgroundColor).toBe("#112233");
    });

    it("rechaza propiedades no permitidas", () => {
      expect(
        createProjectRequestSchema.safeParse({
          name: "Mapping principal",
          ownerId: "usuario-externo"
        }).success
      ).toBe(false);
    });

    it("rechaza solicitudes sin nombre", () => {
      expect(
        createProjectRequestSchema.safeParse({}).success
      ).toBe(false);
    });

    it("genera configuraciones independientes", () => {
      const first = createProjectRequestSchema.parse({
        name: "Proyecto A"
      });

      const second = createProjectRequestSchema.parse({
        name: "Proyecto B"
      });

      expect(first.settings).not.toBe(second.settings);
      expect(first.settings.canvas).not.toBe(
        second.settings.canvas
      );
    });

  });

  describe("updateProjectRequestSchema", () => {

    it("acepta actualizar únicamente el nombre", () => {
      expect(
        updateProjectRequestSchema.safeParse({
          name: "Nuevo nombre"
        }).success
      ).toBe(true);
    });

    it("acepta actualizar el estado", () => {
      expect(
        updateProjectRequestSchema.safeParse({
          status: "ready"
        }).success
      ).toBe(true);
    });

    it("acepta eliminar la descripción con null", () => {
      expect(
        updateProjectRequestSchema.safeParse({
          description: null
        }).success
      ).toBe(true);
    });

    it("rechaza actualizaciones vacías", () => {
      expect(
        updateProjectRequestSchema.safeParse({}).success
      ).toBe(false);
    });

    it("rechaza modificaciones del propietario", () => {
      expect(
        updateProjectRequestSchema.safeParse({
          ownerId: "otro-usuario"
        }).success
      ).toBe(false);
    });

    it("rechaza configuraciones parciales", () => {
      expect(
        updateProjectRequestSchema.safeParse({
          settings: {
            backgroundColor: "#FFFFFF"
          }
        }).success
      ).toBe(false);
    });

  });

  describe("Consistencia de constantes", () => {

    it("mantiene sincronizada la resolución predeterminada", () => {
      expect(DEFAULT_PROJECT_SETTINGS.canvas).toEqual(
        DEFAULT_PROJECTION_CANVAS
      );
    });

    it("utiliza negro como fondo inicial", () => {
      expect(
        DEFAULT_PROJECT_SETTINGS.backgroundColor
      ).toBe("#000000");
    });

  });

});
