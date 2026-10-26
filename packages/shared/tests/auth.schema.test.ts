
import {
  describe,
  expect,
  it
} from "vitest";

import {
  userNameSchema,
  emailSchema,
  passwordSchema,
  registerRequestSchema,
  loginRequestSchema,
  refreshTokenRequestSchema,
  logoutRequestSchema
} from "../src/index.js";

describe("Auth Schemas", () => {

  describe("userNameSchema", () => {

    it("acepta un nombre válido", () => {
      const result = userNameSchema.safeParse("Marco");

      expect(result.success).toBe(true);
    });

    it("elimina espacios al inicio y al final", () => {
      const result = userNameSchema.parse("  Marco  ");

      expect(result).toBe("Marco");
    });

    it("rechaza nombres demasiado cortos", () => {
      const result = userNameSchema.safeParse("M");

      expect(result.success).toBe(false);
    });

    it("rechaza nombres mayores a 100 caracteres", () => {
      const result = userNameSchema.safeParse("A".repeat(101));

      expect(result.success).toBe(false);
    });

  });

  describe("emailSchema", () => {

    it("acepta un correo válido", () => {
      const result = emailSchema.safeParse(
        "marco@example.com"
      );

      expect(result.success).toBe(true);
    });

    it("normaliza el correo a minúsculas", () => {
      const result = emailSchema.parse(
        "MARCO@EXAMPLE.COM"
      );

      expect(result).toBe("marco@example.com");
    });

    it("rechaza correos inválidos", () => {
      const result = emailSchema.safeParse(
        "correo-invalido"
      );

      expect(result.success).toBe(false);
    });

  });

  describe("passwordSchema", () => {

    it("acepta contraseñas válidas", () => {
      const result = passwordSchema.safeParse(
        "MiClaveSegura2026"
      );

      expect(result.success).toBe(true);
    });

    it("rechaza contraseñas menores a 8 caracteres", () => {
      const result = passwordSchema.safeParse(
        "1234567"
      );

      expect(result.success).toBe(false);
    });

    it("rechaza contraseñas mayores a 128 caracteres", () => {
      const result = passwordSchema.safeParse(
        "A".repeat(129)
      );

      expect(result.success).toBe(false);
    });

  });

  describe("registerRequestSchema", () => {

    it("acepta un registro válido", () => {
      const result = registerRequestSchema.safeParse({
        name: "Marco",
        email: "marco@example.com",
        password: "MiClaveSegura2026"
      });

      expect(result.success).toBe(true);
    });

    it("rechaza registros con campos adicionales", () => {
      const result = registerRequestSchema.safeParse({
        name: "Marco",
        email: "marco@example.com",
        password: "MiClaveSegura2026",
        role: "admin"
      });

      expect(result.success).toBe(false);
    });

    it("rechaza registros sin contraseña", () => {
      const result = registerRequestSchema.safeParse({
        name: "Marco",
        email: "marco@example.com"
      });

      expect(result.success).toBe(false);
    });

  });

  describe("loginRequestSchema", () => {

    it("acepta credenciales con formato válido", () => {
      const result = loginRequestSchema.safeParse({
        email: "marco@example.com",
        password: "MiClaveSegura2026"
      });

      expect(result.success).toBe(true);
    });

    it("rechaza contraseñas vacías", () => {
      const result = loginRequestSchema.safeParse({
        email: "marco@example.com",
        password: ""
      });

      expect(result.success).toBe(false);
    });

    it("permite contraseñas antiguas de menos de 8 caracteres", () => {
      const result = loginRequestSchema.safeParse({
        email: "marco@example.com",
        password: "abc123"
      });

      expect(result.success).toBe(true);
    });

  });

  describe("refreshTokenRequestSchema", () => {

    it("acepta un token no vacío", () => {
      const result = refreshTokenRequestSchema.safeParse({
        refreshToken: "token-de-ejemplo"
      });

      expect(result.success).toBe(true);
    });

    it("rechaza tokens vacíos", () => {
      const result = refreshTokenRequestSchema.safeParse({
        refreshToken: ""
      });

      expect(result.success).toBe(false);
    });

  });

  describe("logoutRequestSchema", () => {

    it("acepta una solicitud válida", () => {
      const result = logoutRequestSchema.safeParse({
        refreshToken: "token-de-ejemplo"
      });

      expect(result.success).toBe(true);
    });

    it("rechaza solicitudes sin refreshToken", () => {
      const result = logoutRequestSchema.safeParse({});

      expect(result.success).toBe(false);
    });

  });

});
