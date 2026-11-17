import { verifyAccessToken } from "../services/auth.service.js";
export async function requireAuth(req, res, next) {
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
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=auth.middleware.js.map