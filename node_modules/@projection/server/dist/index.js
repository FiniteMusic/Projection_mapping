import "dotenv/config";
import { createServer } from "node:http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { authRouter } from "./routes/auth.routes.js";
import { testDatabaseConnection, pool } from "./config/database.js";
import { projectRouter } from "./routes/project.routes.js";
import { surfaceRouter } from "./routes/surface.routes.js";
import { mediaRouter } from "./routes/media.routes.js";
import { sessionRouter } from "./routes/session.routes.js";
import { pairingRouter } from "./routes/pairing.routes.js";
import { playerMediaRouter } from "./routes/player-media.routes.js";
import { authenticateSocket } from "./middleware/socket-auth.middleware.js";
import { getSessionRoom, quadSchema, SERVER_SOCKET_EVENTS, CLIENT_SOCKET_EVENTS } from "@projection/shared";
import { synchronizePlayerPresence } from "./services/player-presence.service.js";
import { resetPlayerConnections } from "./repositories/session.repository.js";
import { getSessionById } from "./repositories/session.repository.js";
import { getSurfaceById } from "./repositories/surface.repository.js";
import { getProjectById } from "./repositories/project.repository.js";
import { getSurfacesByProject } from "./repositories/surface.repository.js";
import { getMediaByProject } from "./repositories/media.repository.js";
const app = express();
const PORT = Number(process.env.PORT ?? 3000);
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
app.set("io", io);
io.use(authenticateSocket);
app.use(cors());
app.use(express.json());
app.get("/api/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        service: "projection-server"
    });
});
app.use("/api/auth", authRouter);
app.use("/api/sessions/pairing", pairingRouter);
app.use("/api/projects", projectRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/player", playerMediaRouter);
app.use("/api", surfaceRouter);
app.use("/api", mediaRouter);
io.on("connection", async (socket) => {
    const { role, sessionId } = socket.data;
    if ((role !== "controller" && role !== "player") ||
        typeof sessionId !== "string") {
        socket.disconnect(true);
        return;
    }
    const room = getSessionRoom(sessionId);
    try {
        await socket.join(room);
        socket.on("session:test-message", (payload) => {
            if (socket.data.role !== "controller") {
                socket.emit("session:test-error", {
                    error: "FORBIDDEN"
                });
                return;
            }
            if (typeof payload !== "object" ||
                payload === null ||
                !("message" in payload) ||
                typeof payload.message !== "string" ||
                payload.message.length > 200) {
                socket.emit("session:test-error", {
                    error: "INVALID_PAYLOAD"
                });
                return;
            }
            socket.to(room).emit("session:test-message", {
                message: payload.message
            });
        });
        socket.on(CLIENT_SOCKET_EVENTS.SURFACE_UPDATE, async (payload, callback) => {
            const reject = (code, message) => {
                callback({
                    ok: false,
                    error: { code, message }
                });
            };
            if (socket.data.role !== "controller") {
                reject("FORBIDDEN", "Only controllers can update surfaces");
                return;
            }
            if (!payload ||
                typeof payload !== "object" ||
                payload.sessionId !== sessionId ||
                typeof payload.surfaceId !== "string") {
                reject("INVALID_PAYLOAD", "Invalid surface update payload");
                return;
            }
            const corners = quadSchema.safeParse(payload.changes?.corners);
            if (!corners.success) {
                reject("INVALID_CORNERS", "Invalid surface coordinates");
                return;
            }
            try {
                const session = await getSessionById(sessionId);
                if (!session || session.status === "ended") {
                    reject("SESSION_NOT_FOUND", "Session is not active");
                    return;
                }
                const surface = await getSurfaceById(payload.surfaceId);
                if (!surface || surface.projectId !== session.projectId) {
                    reject("SURFACE_NOT_FOUND", "Surface does not belong to this project");
                    return;
                }
                socket.to(room).emit(SERVER_SOCKET_EVENTS.SURFACE_UPDATE, {
                    sessionId,
                    surfaceId: surface.id,
                    changes: {
                        corners: corners.data
                    }
                });
                callback({
                    ok: true,
                    data: {
                        accepted: true
                    }
                });
            }
            catch (error) {
                console.error("[Socket.IO] Surface update failed:", error);
                reject("INTERNAL_ERROR", "Unable to update surface");
            }
        });
        console.log(`[Socket.IO] ${role} joined session ${sessionId}`);
    }
    catch (error) {
        console.error("[Socket.IO] Failed to join session:", error);
        socket.disconnect(true);
        return;
    }
    if (role === "player") {
        try {
            await synchronizePlayerPresence(io, sessionId);
            const session = await getSessionById(sessionId);
            if (!session || session.status === "ended") {
                socket.disconnect(true);
                return;
            }
            const project = await getProjectById(session.projectId);
            if (!project) {
                socket.disconnect(true);
                return;
            }
            const [surfaces, media] = await Promise.all([
                getSurfacesByProject(project.id),
                getMediaByProject(project.id)
            ]);
            socket.emit(SERVER_SOCKET_EVENTS.SCENE_LOAD, {
                sessionId,
                project,
                surfaces,
                media
            });
            console.log(`[Socket.IO] Scene loaded: ${project.id} (${surfaces.length} surfaces)`);
        }
        catch (error) {
            console.error("[Socket.IO] Failed to initialize player scene:", error);
            socket.disconnect(true);
            return;
        }
    }
    socket.on("disconnect", (reason) => {
        console.log(`[Socket.IO] ${role} disconnected from ${sessionId}: ${reason}`);
        if (role === "player") {
            void synchronizePlayerPresence(io, sessionId).catch((error) => {
                console.error("[Socket.IO] Failed to synchronize player disconnection:", error);
            });
        }
    });
});
async function startServer() {
    try {
        await testDatabaseConnection();
        const resetCount = await resetPlayerConnections();
        console.log(`[Server] Reconciled ${resetCount} player connections`);
        httpServer.listen(PORT, () => {
            console.log(`[SERVER] Servidor disponible en http://localhost:${PORT}`);
            console.log("[SOCKET] Socket.IO disponible");
        });
    }
    catch (error) {
        console.error("[SERVER] Error al iniciar:", error);
        await pool.end();
        process.exitCode = 1;
    }
}
void startServer();
//# sourceMappingURL=index.js.map