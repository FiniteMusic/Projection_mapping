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
import { authenticateSocket } from "./middleware/socket-auth.middleware.js";
import { getSessionRoom } from "@projection/shared";
import { synchronizePlayerPresence } from "./services/player-presence.service.js";
import { resetPlayerConnections } from "./repositories/session.repository.js";

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

app.use("/api", surfaceRouter);
app.use("/api", mediaRouter);

io.on("connection", async (socket) => {
  const { role, sessionId } = socket.data;

  if (
    (role !== "controller" && role !== "player") ||
    typeof sessionId !== "string"
  ) {
    socket.disconnect(true);
    return;
  }

  const room = getSessionRoom(sessionId);

  try {
    await socket.join(room);

    socket.on("session:test-message", (payload: unknown) => {
      if (socket.data.role !== "controller") {
        socket.emit("session:test-error", {
          error: "FORBIDDEN"
        });
        return;
      }

      if (
        typeof payload !== "object" ||
        payload === null ||
        !("message" in payload) ||
        typeof payload.message !== "string" ||
        payload.message.length > 200
      ) {
        socket.emit("session:test-error", {
          error: "INVALID_PAYLOAD"
        });
        return;
      }

      socket.to(room).emit("session:test-message", {
        message: payload.message
      });
    });

    console.log(
      `[Socket.IO] ${role} joined session ${sessionId}`
    );
  } catch (error) {
    console.error(
      "[Socket.IO] Failed to join session:",
      error
    );

    socket.disconnect(true);
    return;
  }

  if (role === "player") {
  try {
    await synchronizePlayerPresence(io, sessionId);
  } catch (error) {
    console.error(
      "[Socket.IO] Failed to synchronize player connection:",
      error
    );

    socket.disconnect(true);
    return;
  }
  }

  socket.on("disconnect", (reason) => {
  console.log(
    `[Socket.IO] ${role} disconnected from ${sessionId}: ${reason}`
  );

  if (role === "player") {
    void synchronizePlayerPresence(io, sessionId).catch(
      (error) => {
        console.error(
          "[Socket.IO] Failed to synchronize player disconnection:",
          error
        );
      }
    );
  }
});
});


async function startServer(): Promise<void> {
  try {
    await testDatabaseConnection();

    const resetCount = await resetPlayerConnections();

    console.log(
      `[Server] Reconciled ${resetCount} player connections`
    );

    httpServer.listen(PORT, () => {
      console.log(
        `[SERVER] Servidor disponible en http://localhost:${PORT}`
      );
      console.log("[SOCKET] Socket.IO disponible");
    });
  } catch (error) {
    console.error("[SERVER] Error al iniciar:", error);
    await pool.end();
    process.exitCode = 1;
  }
}

void startServer();