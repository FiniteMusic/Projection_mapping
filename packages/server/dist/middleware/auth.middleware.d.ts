import type { Request, Response, NextFunction } from "express";
import type { User } from "@projection/shared";
export interface AuthenticatedRequest extends Request {
    user?: User;
}
export declare function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
