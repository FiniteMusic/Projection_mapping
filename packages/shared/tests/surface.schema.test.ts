
import {
  describe,
  expect,
  it
} from "vitest";

import {
  isValidQuad,
  quadSchema,
  DEFAULT_SURFACE_CORNERS,
  createSurfaceRequestSchema,
  updateSurfaceRequestSchema
} from "../src/index.js";

import type {
  Quad
} from "../src/index.js";

describe("Surface Schemas", () => {

  describe("isValidQuad", () => {

    it("acepta un rectángulo válido", () => {
      const corners: Quad = [
        { x: 0.1, y: 0.1 },
        { x: 0.9, y: 0.1 },
        { x: 0.9, y: 0.9 },
        { x: 0.1, y: 0.9 }
      ];

      expect(isValidQuad(corners)).toBe(true);
    });

    it("acepta un cuadrilátero con perspectiva", () => {
      const corners: Quad = [
        { x: 0.2, y: 0.1 },
        { x: 0.8, y: 0.2 },
        { x: 0.9, y: 0.8 },
        { x: 0.1, y: 0.9 }
      ];

      expect(isValidQuad(corners)).toBe(true);
    });

    it("rechaza un cuadrilátero cruzado", () => {
      const corners: Quad = [
        { x: 0.1, y: 0.1 },
        { x: 0.9, y: 0.9 },
        { x: 0.9, y: 0.1 },
        { x: 0.1, y: 0.9 }
      ];

      expect(isValidQuad(corners)).toBe(false);
    });

    it("rechaza un cuadrilátero cóncavo", () => {
      const corners: Quad = [
        { x: 0.1, y: 0.1 },
        { x: 0.9, y: 0.1 },
        { x: 0.4, y: 0.4 },
        { x: 0.1, y: 0.9 }
      ];

      expect(isValidQuad(corners)).toBe(false);
    });

    it("rechaza cuatro puntos alineados", () => {
      const corners: Quad = [
        { x: 0.1, y: 0.1 },
        { x: 0.3, y: 0.3 },
        { x: 0.5, y: 0.5 },
        { x: 0.7, y: 0.7 }
      ];

      expect(isValidQuad(corners)).toBe(false);
    });

    it("rechaza puntos duplicados", () => {
      const corners: Quad = [
        { x: 0.1, y: 0.1 },
        { x: 0.9, y: 0.1 },
        { x: 0.9, y: 0.1 },
        { x: 0.1, y: 0.9 }
      ];

      expect(isValidQuad(corners)).toBe(false);
    });

    it("rechaza un cuadrilátero con área insuficiente", () => {
      const corners: Quad = [
        { x: 0.1, y: 0.1 },
        { x: 0.101, y: 0.1 },
        { x: 0.101, y: 0.101 },
        { x: 0.1, y: 0.101 }
      ];

      expect(isValidQuad(corners)).toBe(false);
    });

  });

  describe("quadSchema", () => {

    it("acepta las esquinas predeterminadas", () => {
      expect(
        quadSchema.safeParse(DEFAULT_SURFACE_CORNERS).success
      ).toBe(true);
    });

    it("rechaza coordenadas negativas", () => {
      const corners = [
        { x: -0.1, y: 0.1 },
        { x: 0.9, y: 0.1 },
        { x: 0.9, y: 0.9 },
        { x: 0.1, y: 0.9 }
      ];

      expect(
        quadSchema.safeParse(corners).success
      ).toBe(false);
    });

    it("rechaza coordenadas mayores a uno", () => {
      const corners = [
        { x: 0.1, y: 0.1 },
        { x: 1.1, y: 0.1 },
        { x: 0.9, y: 0.9 },
        { x: 0.1, y: 0.9 }
      ];

      expect(
        quadSchema.safeParse(corners).success
      ).toBe(false);
    });

    it("rechaza cuadriláteros con menos de cuatro puntos", () => {
      const corners = [
        { x: 0.1, y: 0.1 },
        { x: 0.9, y: 0.1 },
        { x: 0.9, y: 0.9 }
      ];

      expect(
        quadSchema.safeParse(corners).success
      ).toBe(false);
    });

    it("rechaza cuadriláteros con más de cuatro puntos", () => {
      const corners = [
        { x: 0.1, y: 0.1 },
        { x: 0.9, y: 0.1 },
        { x: 0.9, y: 0.9 },
        { x: 0.1, y: 0.9 },
        { x: 0.5, y: 0.5 }
      ];

      expect(
        quadSchema.safeParse(corners).success
      ).toBe(false);
    });

    it("rechaza un cuadrilátero cruzado", () => {
      const corners = [
        { x: 0.1, y: 0.1 },
        { x: 0.9, y: 0.9 },
        { x: 0.9, y: 0.1 },
        { x: 0.1, y: 0.9 }
      ];

      expect(
        quadSchema.safeParse(corners).success
      ).toBe(false);
    });

  });

  describe("createSurfaceRequestSchema", () => {

    it("acepta una superficie con nombre", () => {
      const result = createSurfaceRequestSchema.safeParse({
        name: "Pared principal"
      });

      expect(result.success).toBe(true);
    });

    it("rechaza superficies sin nombre", () => {
      const result = createSurfaceRequestSchema.safeParse({});

      expect(result.success).toBe(false);
    });

    it("acepta esquinas personalizadas válidas", () => {
      const result = createSurfaceRequestSchema.safeParse({
        name: "Pared lateral",
        corners: [
          { x: 0.2, y: 0.1 },
          { x: 0.8, y: 0.2 },
          { x: 0.9, y: 0.8 },
          { x: 0.1, y: 0.9 }
        ]
      });

      expect(result.success).toBe(true);
    });

    it("rechaza esquinas cruzadas", () => {
      const result = createSurfaceRequestSchema.safeParse({
        name: "Superficie inválida",
        corners: [
          { x: 0.1, y: 0.1 },
          { x: 0.9, y: 0.9 },
          { x: 0.9, y: 0.1 },
          { x: 0.1, y: 0.9 }
        ]
      });

      expect(result.success).toBe(false);
    });

    it("acepta una opacidad válida", () => {
      const result = createSurfaceRequestSchema.safeParse({
        name: "Superficie transparente",
        opacity: 0.5
      });

      expect(result.success).toBe(true);
    });

    it.each([-0.1, 1.1])(
      "rechaza la opacidad %s",
      (opacity) => {
        const result = createSurfaceRequestSchema.safeParse({
          name: "Superficie",
          opacity
        });

        expect(result.success).toBe(false);
      }
    );

    it("acepta asignar un archivo multimedia mediante UUID", () => {
      const result = createSurfaceRequestSchema.safeParse({
        name: "Superficie multimedia",
        mediaId: "550e8400-e29b-41d4-a716-446655440000"
      });

      expect(result.success).toBe(true);
    });

    it("acepta una superficie sin contenido multimedia", () => {
      const result = createSurfaceRequestSchema.safeParse({
        name: "Superficie vacía",
        mediaId: null
      });

      expect(result.success).toBe(true);
    });

    it("rechaza propiedades desconocidas", () => {
      const result = createSurfaceRequestSchema.safeParse({
        name: "Superficie",
        ownerId: "usuario-externo"
      });

      expect(result.success).toBe(false);
    });

  });

  describe("updateSurfaceRequestSchema", () => {

    it("acepta modificar únicamente el nombre", () => {
      const result = updateSurfaceRequestSchema.safeParse({
        name: "Nuevo nombre"
      });

      expect(result.success).toBe(true);
    });

    it("acepta modificar únicamente las esquinas", () => {
      const result = updateSurfaceRequestSchema.safeParse({
        corners: DEFAULT_SURFACE_CORNERS
      });

      expect(result.success).toBe(true);
    });

    it("acepta modificar la visibilidad", () => {
      const result = updateSurfaceRequestSchema.safeParse({
        visible: false
      });

      expect(result.success).toBe(true);
    });

    it("acepta modificar el orden de las capas", () => {
      const result = updateSurfaceRequestSchema.safeParse({
        zIndex: 5
      });

      expect(result.success).toBe(true);
    });

    it("rechaza un índice de capa negativo", () => {
      const result = updateSurfaceRequestSchema.safeParse({
        zIndex: -1
      });

      expect(result.success).toBe(false);
    });

    it("rechaza un índice de capa decimal", () => {
      const result = updateSurfaceRequestSchema.safeParse({
        zIndex: 1.5
      });

      expect(result.success).toBe(false);
    });

    it("acepta eliminar el contenido multimedia", () => {
      const result = updateSurfaceRequestSchema.safeParse({
        mediaId: null
      });

      expect(result.success).toBe(true);
    });

    it("rechaza actualizaciones vacías", () => {
      const result = updateSurfaceRequestSchema.safeParse({});

      expect(result.success).toBe(false);
    });

    it("rechaza modificar el identificador de la superficie", () => {
      const result = updateSurfaceRequestSchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440000"
      });

      expect(result.success).toBe(false);
    });

  });

});
