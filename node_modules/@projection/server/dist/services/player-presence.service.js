import { getSessionRoom } from "@projection/shared";
import { updatePlayerConnectionStatus } from "../repositories/session.repository.js";
const synchronizationQueue = new Map();
export function synchronizePlayerPresence(io, sessionId) {
    const previous = synchronizationQueue.get(sessionId) ?? Promise.resolve();
    const current = previous
        .catch(() => undefined)
        .then(async () => {
        const room = getSessionRoom(sessionId);
        const sockets = await io.in(room).fetchSockets();
        const hasPlayer = sockets.some((socket) => socket.data.role === "player" &&
            socket.data.sessionId === sessionId);
        await updatePlayerConnectionStatus(sessionId, hasPlayer ? "connected" : "disconnected");
    });
    synchronizationQueue.set(sessionId, current);
    void current.finally(() => {
        if (synchronizationQueue.get(sessionId) === current) {
            synchronizationQueue.delete(sessionId);
        }
    }).catch(() => undefined);
    return current;
}
//# sourceMappingURL=player-presence.service.js.map