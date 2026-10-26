
import {
  describe,
  expect,
  it
} from "vitest";

import {
  DEFAULT_PROJECTION_CORNERS,
  DEFAULT_PROJECTION_CANVAS,
  NORMALIZED_COORDINATE_RANGE,
  QUAD_CORNER_INDEX,
  QUAD_CORNER_COUNT,
  PROJECTION_GEOMETRY,
  DEFAULT_PROJECTION_SURFACE,
  PROJECTION_LIMITS,
  PLAYER_RENDER_CONFIG,
  PLAYBACK_CONFIG,
  SURFACE_EDITOR_CONFIG,
  normalizedToPixels,
  pixelsToNormalized,
  clampNormalized
} from "../src/index.js";

describe("Projection Constants", () => {

  describe("DEFAULT_PROJECTION_CANVAS", () => {

    it("establece un ancho lógico de 1280 píxeles", () => {
      expect(DEFAULT_PROJECTION_CANVAS.width).toBe(1280);
    });

    it("establece una altura lógica de 720 píxeles", () => {
      expect(DEFAULT_PROJECTION_CANVAS.height).toBe(720);
    });

  });

  describe("DEFAULT_PROJECTION_CORNERS", () => {

    it("contiene exactamente cuatro vértices", () => {
      expect(DEFAULT_PROJECTION_CORNERS).toHaveLength(4);
    });

    it("define correctamente la esquina superior izquierda", () => {
      expect(DEFAULT_PROJECTION_CORNERS[0]).toEqual({
        x: 0.1,
        y: 0.1
      });
    });

    it("define correctamente la esquina superior derecha", () => {
      expect(DEFAULT_PROJECTION_CORNERS[1]).toEqual({
        x: 0.9,
        y: 0.1
      });
    });

    it("define correctamente la esquina inferior derecha", () => {
      expect(DEFAULT_PROJECTION_CORNERS[2]).toEqual({
        x: 0.9,
        y: 0.9
      });
    });

    it("define correctamente la esquina inferior izquierda", () => {
      expect(DEFAULT_PROJECTION_CORNERS[3]).toEqual({
        x: 0.1,
        y: 0.9
      });
    });

  });

  describe("NORMALIZED_COORDINATE_RANGE", () => {

    it("establece el mínimo en cero", () => {
      expect(NORMALIZED_COORDINATE_RANGE.min).toBe(0);
    });

    it("establece el máximo en uno", () => {
      expect(NORMALIZED_COORDINATE_RANGE.max).toBe(1);
    });

  });

  describe("QUAD_CORNER_INDEX", () => {

    it("asigna índice cero a TOP_LEFT", () => {
      expect(QUAD_CORNER_INDEX.TOP_LEFT).toBe(0);
    });

    it("asigna índice uno a TOP_RIGHT", () => {
      expect(QUAD_CORNER_INDEX.TOP_RIGHT).toBe(1);
    });

    it("asigna índice dos a BOTTOM_RIGHT", () => {
      expect(QUAD_CORNER_INDEX.BOTTOM_RIGHT).toBe(2);
    });

    it("asigna índice tres a BOTTOM_LEFT", () => {
      expect(QUAD_CORNER_INDEX.BOTTOM_LEFT).toBe(3);
    });

    it("establece cuatro vértices por superficie", () => {
      expect(QUAD_CORNER_COUNT).toBe(4);
    });

  });

  describe("PROJECTION_GEOMETRY", () => {

    it("establece un área mínima positiva", () => {
      expect(
        PROJECTION_GEOMETRY.minQuadArea
      ).toBeGreaterThan(0);
    });

    it("establece una tolerancia de orientación positiva", () => {
      expect(
        PROJECTION_GEOMETRY.orientationEpsilon
      ).toBeGreaterThan(0);
    });

    it("mantiene la tolerancia menor que el área mínima", () => {
      expect(
        PROJECTION_GEOMETRY.orientationEpsilon
      ).toBeLessThan(
        PROJECTION_GEOMETRY.minQuadArea
      );
    });

  });

  describe("DEFAULT_PROJECTION_SURFACE", () => {

    it("utiliza las esquinas predeterminadas", () => {
      expect(
        DEFAULT_PROJECTION_SURFACE.corners
      ).toEqual(DEFAULT_PROJECTION_CORNERS);
    });

    it("mantiene una copia independiente de las esquinas", () => {
      expect(
        DEFAULT_PROJECTION_SURFACE.corners
      ).not.toBe(DEFAULT_PROJECTION_CORNERS);

      DEFAULT_PROJECTION_SURFACE.corners.forEach(
        (point, index) => {
          expect(point).not.toBe(
            DEFAULT_PROJECTION_CORNERS[index]
          );
        }
      );
    });

    it("establece la superficie como visible", () => {
      expect(
        DEFAULT_PROJECTION_SURFACE.visible
      ).toBe(true);
    });

    it("establece opacidad completa", () => {
      expect(
        DEFAULT_PROJECTION_SURFACE.opacity
      ).toBe(1);
    });

    it("establece el índice inicial de capa en cero", () => {
      expect(
        DEFAULT_PROJECTION_SURFACE.zIndex
      ).toBe(0);
    });

  });

  describe("PROJECTION_LIMITS", () => {

    it("establece el rango de opacidad de cero a uno", () => {
      expect(PROJECTION_LIMITS.minOpacity).toBe(0);
      expect(PROJECTION_LIMITS.maxOpacity).toBe(1);
    });

    it("establece el rango de capas de cero a mil", () => {
      expect(PROJECTION_LIMITS.minZIndex).toBe(0);
      expect(PROJECTION_LIMITS.maxZIndex).toBe(1000);
    });

    it("establece 8192 como dimensión máxima del lienzo", () => {
      expect(
        PROJECTION_LIMITS.maxCanvasDimension
      ).toBe(8192);
    });

  });

  describe("PLAYER_RENDER_CONFIG", () => {

    it("establece 30 FPS como objetivo", () => {
      expect(PLAYER_RENDER_CONFIG.targetFPS).toBe(30);
    });

    it("establece el fondo negro", () => {
      expect(
        PLAYER_RENDER_CONFIG.clearColor
      ).toBe("#000000");
    });

    it("habilita antialiasing", () => {
      expect(
        PLAYER_RENDER_CONFIG.antialias
      ).toBe(true);
    });

    it("deshabilita preserveDrawingBuffer", () => {
      expect(
        PLAYER_RENDER_CONFIG.preserveDrawingBuffer
      ).toBe(false);
    });

  });

  describe("PLAYBACK_CONFIG", () => {

    it("establece el volumen inicial en uno", () => {
      expect(PLAYBACK_CONFIG.defaultVolume).toBe(1);
    });

    it("inicia la reproducción silenciada", () => {
      expect(PLAYBACK_CONFIG.defaultMuted).toBe(true);
    });

    it("establece una tolerancia de sincronización positiva", () => {
      expect(
        PLAYBACK_CONFIG.synchronizationToleranceSeconds
      ).toBeGreaterThan(0);
    });

    it("establece una tolerancia de búsqueda positiva", () => {
      expect(
        PLAYBACK_CONFIG.seekToleranceSeconds
      ).toBeGreaterThan(0);
    });

  });

  describe("SURFACE_EDITOR_CONFIG", () => {

    it("establece un radio de control positivo", () => {
      expect(
        SURFACE_EDITOR_CONFIG.cornerHandleRadiusPx
      ).toBeGreaterThan(0);
    });

    it("mantiene el área táctil mayor que el control visual", () => {
      expect(
        SURFACE_EDITOR_CONFIG.cornerHitRadiusPx
      ).toBeGreaterThan(
        SURFACE_EDITOR_CONFIG.cornerHandleRadiusPx
      );
    });

    it("deshabilita la cuadrícula inicialmente", () => {
      expect(
        SURFACE_EDITOR_CONFIG.showGridByDefault
      ).toBe(false);
    });

    it("deshabilita el ajuste a cuadrícula inicialmente", () => {
      expect(
        SURFACE_EDITOR_CONFIG.snapToGridByDefault
      ).toBe(false);
    });

  });

  describe("normalizedToPixels", () => {

    it("convierte el origen a cero píxeles", () => {
      expect(normalizedToPixels(0, 1280)).toBe(0);
    });

    it("convierte el centro del lienzo", () => {
      expect(normalizedToPixels(0.5, 1280)).toBe(640);
    });

    it("convierte el límite superior normalizado", () => {
      expect(normalizedToPixels(1, 1280)).toBe(1280);
    });

    it("admite coordenadas fuera del rango normalizado", () => {
      expect(normalizedToPixels(1.5, 1280)).toBe(1920);
    });

    it("convierte correctamente coordenadas verticales", () => {
      expect(normalizedToPixels(0.25, 720)).toBe(180);
    });

  });

  describe("pixelsToNormalized", () => {

    it("convierte el origen a cero", () => {
      expect(pixelsToNormalized(0, 1280)).toBe(0);
    });

    it("convierte el centro a 0.5", () => {
      expect(pixelsToNormalized(640, 1280)).toBe(0.5);
    });

    it("convierte el extremo a uno", () => {
      expect(pixelsToNormalized(1280, 1280)).toBe(1);
    });

    it("admite posiciones superiores a la dimensión", () => {
      expect(pixelsToNormalized(1920, 1280)).toBe(1.5);
    });

    it("admite posiciones negativas", () => {
      expect(pixelsToNormalized(-128, 1280)).toBe(-0.1);
    });

    it("rechaza una dimensión igual a cero", () => {
      expect(() => {
        pixelsToNormalized(100, 0);
      }).toThrow(RangeError);
    });

    it("rechaza dimensiones negativas", () => {
      expect(() => {
        pixelsToNormalized(100, -1280);
      }).toThrow(RangeError);
    });

    it("rechaza dimensiones infinitas", () => {
      expect(() => {
        pixelsToNormalized(100, Infinity);
      }).toThrow(RangeError);
    });

    it("rechaza dimensiones NaN", () => {
      expect(() => {
        pixelsToNormalized(100, NaN);
      }).toThrow(RangeError);
    });

  });

  describe("clampNormalized", () => {

    it("conserva valores dentro del rango", () => {
      expect(clampNormalized(0.5)).toBe(0.5);
    });

    it("conserva el límite inferior", () => {
      expect(clampNormalized(0)).toBe(0);
    });

    it("conserva el límite superior", () => {
      expect(clampNormalized(1)).toBe(1);
    });

    it("limita valores negativos a cero", () => {
      expect(clampNormalized(-0.5)).toBe(0);
    });

    it("limita valores superiores a uno", () => {
      expect(clampNormalized(1.5)).toBe(1);
    });

    it("rechaza Infinity", () => {
      expect(() => {
        clampNormalized(Infinity);
      }).toThrow(RangeError);
    });

    it("rechaza -Infinity", () => {
      expect(() => {
        clampNormalized(-Infinity);
      }).toThrow(RangeError);
    });

    it("rechaza NaN", () => {
      expect(() => {
        clampNormalized(NaN);
      }).toThrow(RangeError);
    });

  });

  describe("Consistencia de conversiones", () => {

    it("recupera una coordenada después de convertirla", () => {
      const normalized = 0.375;
      const dimension = 1920;

      const pixels = normalizedToPixels(
        normalized,
        dimension
      );

      const result = pixelsToNormalized(
        pixels,
        dimension
      );

      expect(result).toBeCloseTo(normalized, 10);
    });

    it("mantiene proporciones entre resoluciones", () => {
      const normalized = 0.25;

      const pixelsHD = normalizedToPixels(
        normalized,
        1280
      );

      const pixelsFullHD = normalizedToPixels(
        normalized,
        1920
      );

      expect(pixelsHD).toBe(320);
      expect(pixelsFullHD).toBe(480);

      expect(
        pixelsToNormalized(pixelsHD, 1280)
      ).toBeCloseTo(
        pixelsToNormalized(pixelsFullHD, 1920),
        10
      );
    });

  });

});
