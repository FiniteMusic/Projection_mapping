import { verifyAccessToken } from "../services/auth.service.js";
import { verifyPlayerToken } from "../services/player-token.service.js";
import { getSessionById, getSessionForUser } from "../repositories/session.repository.js";
export async function authenticateSocket(socket, next) {
    try {
        const { token, role, sessionId } = socket.handshake.auth;
        if (typeof token !== "string" ||
            typeof sessionId !== "string" ||
            (role !== "controller" && role !== "player")) {
            next(new Error("INVALID_SOCKET_AUTH"));
            return;
        }
        if (role === "controller") {
            const user = await verifyAccessToken(token);
            if (!user) {
                next(new Error("UNAUTHORIZED"));
                return;
            }
            const session = await getSessionForUser(sessionId, user.id);
            if (!session || session.status === "ended") {
                next(new Error("SESSION_NOT_FOUND"));
                return;
            }
        }
        else {
            const authorizedSessionId = await verifyPlayerToken(token);
            if (authorizedSessionId !== sessionId) {
                next(new Error("UNAUTHORIZED"));
                return;
            }
            const session = await getSessionById(sessionId);
            if (!session || session.status === "ended") {
                next(new Error("SESSION_NOT_FOUND"));
                return;
            }
        }
        const authData = {
            role,
            sessionId,
            authenticatedAt: Date.now()
        };
        socket.data.role = authData.role;
        socket.data.sessionId = authData.sessionId;
        socket.data.authenticatedAt = authData.authenticatedAt;
        next();
    }
    catch {
        next(new Error("SOCKET_AUTH_FAILED"));
    }
}
//# sourceMappingURL=socket-auth.middleware.js.map