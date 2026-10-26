
import {
  describe,
  expect,
  it
} from "vitest";

import {
  API_PREFIX,
  API_VERSION,
  AUTH_ROUTES,
  PROJECT_ROUTES,
  SURFACE_ROUTES,
  MEDIA_ROUTES,
  SESSION_ROUTES,
  API_ROUTES,
  HTTP_METHOD,
  HTTP_STATUS,
  HTTP_HEADERS,
  CONTENT_TYPES,
  PAGINATION_DEFAULTS
} from "../src/index.js";

describe("API Constants", () => {

  const projectId =
    "123e4567-e89b-42d3-a456-426614174000";

  const surfaceId =
    "550e8400-e29b-41d4-a716-446655440000";

  const mediaId =
    "6ba7b810-9dad-41d1-80b4-00c04fd430c8";

  const sessionId =
    "a987fbc9-4bed-4078-8f07-9141ba07c9f3";

  describe("API_PREFIX y API_VERSION", () => {

    it("establece el prefijo principal", () => {
      expect(API_PREFIX).toBe("/api");
    });

    it("establece la versión del contrato", () => {
      expect(API_VERSION).toBe("1.0.0");
    });

  });

  describe("AUTH_ROUTES", () => {

    it("define la ruta de registro", () => {
      expect(AUTH_ROUTES.register).toBe("/api/auth/register");
    });

    it("define la ruta de inicio de sesión", () => {
      expect(AUTH_ROUTES.login).toBe("/api/auth/login");
    });

    it("define la ruta del usuario actual", () => {
      expect(AUTH_ROUTES.me).toBe("/api/auth/me");
    });

    it("define la ruta de renovación de tokens", () => {
      expect(AUTH_ROUTES.refresh).toBe("/api/auth/refresh");
    });

    it("define la ruta de cierre de sesión", () => {
      expect(AUTH_ROUTES.logout).toBe("/api/auth/logout");
    });

    it("mantiene todas las rutas bajo el prefijo de API", () => {
      for (const route of Object.values(AUTH_ROUTES)) {
        expect(route.startsWith(`${API_PREFIX}/`)).toBe(true);
      }
    });

  });

  describe("PROJECT_ROUTES", () => {

    it("define la ruta base de proyectos", () => {
      expect(PROJECT_ROUTES.base).toBe("/api/projects");
    });

    it("construye la ruta de un proyecto", () => {
      expect(PROJECT_ROUTES.byId(projectId)).toBe(
        `/api/projects/${projectId}`
      );
    });

    it("construye la ruta de superficies del proyecto", () => {
      expect(PROJECT_ROUTES.surfaces(projectId)).toBe(
        `/api/projects/${projectId}/surfaces`
      );
    });

    it("construye la ruta multimedia del proyecto", () => {
      expect(PROJECT_ROUTES.media(projectId)).toBe(
        `/api/projects/${projectId}/media`
      );
    });

    it("codifica caracteres especiales en identificadores", () => {
      expect(PROJECT_ROUTES.byId("project/a b")).toBe(
        "/api/projects/project%2Fa%20b"
      );
    });

    it("codifica identificadores en rutas anidadas", () => {
      expect(PROJECT_ROUTES.surfaces("a/b")).toBe(
        "/api/projects/a%2Fb/surfaces"
      );

      expect(PROJECT_ROUTES.media("a b")).toBe(
        "/api/projects/a%20b/media"
      );
    });

  });

  describe("SURFACE_ROUTES", () => {

    it("construye la ruta de una superficie", () => {
      expect(SURFACE_ROUTES.byId(surfaceId)).toBe(
        `/api/surfaces/${surfaceId}`
      );
    });

    it("codifica caracteres especiales", () => {
      expect(SURFACE_ROUTES.byId("surface/a")).toBe(
        "/api/surfaces/surface%2Fa"
      );
    });

  });

  describe("MEDIA_ROUTES", () => {

    it("construye la ruta de un recurso multimedia", () => {
      expect(MEDIA_ROUTES.byId(mediaId)).toBe(
        `/api/media/${mediaId}`
      );
    });

    it("construye la ruta del contenido multimedia", () => {
      expect(MEDIA_ROUTES.content(mediaId)).toBe(
        `/api/media/${mediaId}/content`
      );
    });

    it("codifica identificadores especiales", () => {
      expect(MEDIA_ROUTES.byId("media/a b")).toBe(
        "/api/media/media%2Fa%20b"
      );
    });

    it("codifica identificadores en la ruta de contenido", () => {
      expect(MEDIA_ROUTES.content("media/a")).toBe(
        "/api/media/media%2Fa/content"
      );
    });

  });

  describe("SESSION_ROUTES", () => {

    
    it("define la ruta para solicitar un código de vinculación", () => {
      expect(SESSION_ROUTES.pairing).toBe(
        "/api/sessions/pairing"
      );
    });

    it("define la ruta para vincular Android con el proyector", () => {
      expect(SESSION_ROUTES.pair).toBe(
        "/api/sessions/pair"
      );
    });

    it("define la ruta para consultar el estado de vinculación", () => {
      expect(SESSION_ROUTES.pairingStatus).toBe(
        "/api/sessions/pairing/status"
      );
    });


    it("define la ruta base de sesiones", () => {
      expect(SESSION_ROUTES.base).toBe("/api/sessions");
    });

    it("construye la ruta de una sesión", () => {
      expect(SESSION_ROUTES.byId(sessionId)).toBe(
        `/api/sessions/${sessionId}`
      );
    });

    it("define la ruta de emparejamiento", () => {
      expect(SESSION_ROUTES.pair).toBe("/api/sessions/pair");
    });

    it("construye la ruta de finalización", () => {
      expect(SESSION_ROUTES.end(sessionId)).toBe(
        `/api/sessions/${sessionId}/end`
      );
    });

    it("codifica identificadores especiales", () => {
      expect(SESSION_ROUTES.byId("session/a")).toBe(
        "/api/sessions/session%2Fa"
      );
    });

    it("codifica identificadores en la ruta de finalización", () => {
      expect(SESSION_ROUTES.end("session/a b")).toBe(
        "/api/sessions/session%2Fa%20b/end"
      );
    });

  });

  describe("API_ROUTES", () => {

    it("agrupa las rutas de autenticación", () => {
      expect(API_ROUTES.auth).toBe(AUTH_ROUTES);
    });

    it("agrupa las rutas de proyectos", () => {
      expect(API_ROUTES.projects).toBe(PROJECT_ROUTES);
    });

    it("agrupa las rutas de superficies", () => {
      expect(API_ROUTES.surfaces).toBe(SURFACE_ROUTES);
    });

    it("agrupa las rutas multimedia", () => {
      expect(API_ROUTES.media).toBe(MEDIA_ROUTES);
    });

    it("agrupa las rutas de sesiones", () => {
      expect(API_ROUTES.sessions).toBe(SESSION_ROUTES);
    });

    it("contiene cinco grupos de rutas", () => {
      expect(Object.keys(API_ROUTES)).toHaveLength(5);
    });

  });

  describe("HTTP_METHOD", () => {

    it.each([
      ["GET", "GET"],
      ["POST", "POST"],
      ["PATCH", "PATCH"],
      ["DELETE", "DELETE"]
    ] as const)(
      "define correctamente el método %s",
      (key, value) => {
        expect(HTTP_METHOD[key]).toBe(value);
      }
    );

    it("no contiene métodos duplicados", () => {
      const methods = Object.values(HTTP_METHOD);
      expect(new Set(methods).size).toBe(methods.length);
    });

  });

  describe("HTTP_STATUS", () => {

    it.each([
      ["OK", 200],
      ["CREATED", 201],
      ["NO_CONTENT", 204],
      ["BAD_REQUEST", 400],
      ["UNAUTHORIZED", 401],
      ["FORBIDDEN", 403],
      ["NOT_FOUND", 404],
      ["CONFLICT", 409],
      ["PAYLOAD_TOO_LARGE", 413],
      ["UNSUPPORTED_MEDIA_TYPE", 415],
      ["UNPROCESSABLE_ENTITY", 422],
      ["TOO_MANY_REQUESTS", 429],
      ["INTERNAL_SERVER_ERROR", 500]
    ] as const)(
      "define el código HTTP %s",
      (key, status) => {
        expect(HTTP_STATUS[key]).toBe(status);
      }
    );

    it("mantiene códigos HTTP sin duplicados", () => {
      const statuses = Object.values(HTTP_STATUS);
      expect(new Set(statuses).size).toBe(statuses.length);
    });

    it("mantiene todos los códigos dentro del rango HTTP", () => {
      for (const status of Object.values(HTTP_STATUS)) {
        expect(status).toBeGreaterThanOrEqual(100);
        expect(status).toBeLessThanOrEqual(599);
      }
    });

  });

  describe("HTTP_HEADERS", () => {

    it.each([
      ["AUTHORIZATION", "Authorization"],
      ["CONTENT_TYPE", "Content-Type"],
      ["ACCEPT", "Accept"],
      ["RANGE", "Range"],
      ["CONTENT_RANGE", "Content-Range"],
      ["ACCEPT_RANGES", "Accept-Ranges"]
    ] as const)(
      "define correctamente el encabezado %s",
      (key, value) => {
        expect(HTTP_HEADERS[key]).toBe(value);
      }
    );

    it("no contiene encabezados duplicados", () => {
      const headers = Object.values(HTTP_HEADERS);
      expect(new Set(headers).size).toBe(headers.length);
    });

  });

  describe("CONTENT_TYPES", () => {

    it("define el tipo JSON", () => {
      expect(CONTENT_TYPES.JSON).toBe("application/json");
    });

    it("define multipart/form-data", () => {
      expect(CONTENT_TYPES.MULTIPART_FORM_DATA).toBe(
        "multipart/form-data"
      );
    });

  });

  describe("PAGINATION_DEFAULTS", () => {

    it("establece la primera página como inicio", () => {
      expect(PAGINATION_DEFAULTS.page).toBe(1);
    });

    it("establece veinte registros por página", () => {
      expect(PAGINATION_DEFAULTS.limit).toBe(20);
    });

    it("establece cien registros como límite máximo", () => {
      expect(PAGINATION_DEFAULTS.maxLimit).toBe(100);
    });

    it("mantiene el límite predeterminado bajo el máximo", () => {
      expect(PAGINATION_DEFAULTS.limit).toBeLessThanOrEqual(
        PAGINATION_DEFAULTS.maxLimit
      );
    });

    it("mantiene los parámetros de paginación positivos", () => {
      expect(PAGINATION_DEFAULTS.page).toBeGreaterThan(0);
      expect(PAGINATION_DEFAULTS.limit).toBeGreaterThan(0);
      expect(PAGINATION_DEFAULTS.maxLimit).toBeGreaterThan(0);
    });

  });

});
