
import type { User } from "@projection/shared";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
