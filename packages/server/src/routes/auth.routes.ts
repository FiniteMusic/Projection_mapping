
import { Router } from "express";

import {
  registerRequestSchema,
  loginRequestSchema,
  refreshTokenRequestSchema,
  logoutRequestSchema
} from "@projection/shared";

import {
  register,
  login,
  verifyAccessToken,
  refresh,
  logout
} from "../services/auth.service.js";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const parsed = registerRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "VALIDATION_ERROR",
      details: parsed.error.flatten()
    });
    return;
  }

  try {
    const { name, email, password } = parsed.data;
    const result = await register(name, email, password);

    res.status(201).json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "EMAIL_ALREADY_REGISTERED"
    ) {
      res.status(409).json({
        error: "EMAIL_ALREADY_REGISTERED"
      });
      return;
    }

    console.error("[AUTH] Registration error:", error);
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "VALIDATION_ERROR",
      details: parsed.error.flatten()
    });
    return;
  }

  try {
    const { email, password } = parsed.data;
    const result = await login(email, password);

    res.status(200).json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_CREDENTIALS"
    ) {
      res.status(401).json({
        error: "INVALID_CREDENTIALS"
      });
      return;
    }

    console.error("[AUTH] Login error:", error);
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

authRouter.get("/me", async (req, res) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return;
  }

  const token = authorization.slice(7);
  const user = await verifyAccessToken(token);

  if (!user) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return;
  }

  res.status(200).json({ user });
});

authRouter.post("/refresh", async (req, res) => {
  const parsed = refreshTokenRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "VALIDATION_ERROR",
      details: parsed.error.flatten()
    });
    return;
  }

  try {
    const tokens = await refresh(parsed.data.refreshToken);
    res.status(200).json({ tokens });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_REFRESH_TOKEN"
    ) {
      res.status(401).json({
        error: "INVALID_REFRESH_TOKEN"
      });
      return;
    }

    console.error("[AUTH] Refresh error:", error);
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

authRouter.post("/logout", async (req, res) => {
  const parsed = logoutRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "VALIDATION_ERROR",
      details: parsed.error.flatten()
    });
    return;
  }

  try {
    await logout(parsed.data.refreshToken);
    res.status(204).send();
  } catch (error) {
    console.error("[AUTH] Logout error:", error);
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});
