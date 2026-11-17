import type { Request, Response, NextFunction } from "express";
export declare function requirePlayerAuth(req: Request, res: Response, next: NextFunction): Promise<void>;
