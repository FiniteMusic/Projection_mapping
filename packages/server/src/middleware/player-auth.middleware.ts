
import type {
  Request,
  Response,
  NextFunction
} from "express";

import {
  verifyPlayerToken
} from "../services/player-token.service.js";

import {
  getSessionById
} from "../repositories/session.repository.js";

export async function requirePlayerAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authorization = req.headers.authorization;

    if (
      !authorization ||
      !authorization.startsWith("Bearer ")
    ) {
      res.status(401).json({
        error: "UNAUTHORIZED"
      });
      return;
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      res.status(401).json({
        error: "UNAUTHORIZED"
      });
      return;
    }

    const sessionId = await verifyPlayerToken(token);

    if (!sessionId) {
      res.status(401).json({
        error: "UNAUTHORIZED"
      });
      return;
    }

    const session = await getSessionById(sessionId);

    if (!session || session.status === "ended") {
      res.status(401).json({
        error: "SESSION_NOT_FOUND"
      });
      return;
    }

    res.locals.playerSession = session;

    next();
  } catch (error) {
    console.error(
      "[PLAYER AUTH] Authentication failed:",
      error
    );

    res.status(500).json({
      error: "INTERNAL_ERROR"
    });
  }
}
