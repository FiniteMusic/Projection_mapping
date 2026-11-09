
import type {
  Request,
  Response,
  NextFunction
} from "express";

import type { User } from "@projection/shared";

import { verifyAccessToken } from "../services/auth.service.js";

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({
      error: "UNAUTHORIZED"
    });
    return;
  }

  const token = authorization.slice(7);

  try {
    const user = await verifyAccessToken(token);

    if (!user) {
      res.status(401).json({
        error: "UNAUTHORIZED"
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
