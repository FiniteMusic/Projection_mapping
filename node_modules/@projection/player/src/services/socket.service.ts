
import { io, type Socket } from "socket.io-client";
import { environment } from "../config/environment";
import type { PlayerCredentials } from "./pairing.service";

import {
  SERVER_SOCKET_EVENTS,
  type SurfaceUpdatedPayload,
  type SurfaceMediaUpdatePayload,
  type SceneLoadPayload
} from "@projection/shared";


let playerSocket: Socket | null = null;


export function connectPlayer(
  credentials: PlayerCredentials,
  onConnected: () => void,
  onDisconnected: (reason: string) => void,
  onError: (message: string) => void,
  onAuthenticationRejected: () => void,
  onSessionEnded: () => void,
 
  onSurfaceUpdated: (
    payload: SurfaceUpdatedPayload
  ) => void,
  onSceneLoaded: (
    payload: SceneLoadPayload
  ) => void,
  onSurfaceMediaUpdated: (
    payload: SurfaceMediaUpdatePayload
  ) => void
): void {

  disconnectPlayer();

  const socket = io(environment.serverUrl, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    randomizationFactor: 0.5,
    timeout: 5000,
    auth: {
      token: credentials.playerToken,
      role: "player",
      sessionId: credentials.sessionId
    }
  });

  playerSocket = socket;

  socket.on("connect", () => {
    console.log("[Player] Socket.IO connected");
    onConnected();
  });

  socket.on("disconnect", (reason) => {
    console.log("[Player] Socket.IO disconnected:", reason);
    onDisconnected(reason);
  });

  socket.on("connect_error", (error) => {
  console.error("[Player] Socket.IO error:", error.message);

  const authenticationErrors = [
    "INVALID_SOCKET_AUTH",
    "UNAUTHORIZED",
    "SESSION_NOT_FOUND"
  ];

  if (authenticationErrors.includes(error.message)) {
    onAuthenticationRejected();
    return;
  }

  onError(error.message);
});

socket.on("session:ended", (payload: unknown) => {
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("sessionId" in payload) ||
    payload.sessionId !== credentials.sessionId
  ) {
    return;
  }

  console.log("[Player] Session ended:", credentials.sessionId);

  onSessionEnded();
});


socket.on(
  SERVER_SOCKET_EVENTS.SURFACE_UPDATE,
  (payload: SurfaceUpdatedPayload) => {
    if (payload.sessionId !== credentials.sessionId) {
      return;
    }

    onSurfaceUpdated(payload);
  }
);

socket.on(
  SERVER_SOCKET_EVENTS.SCENE_LOAD,
  (payload: SceneLoadPayload) => {
    if (payload.sessionId !== credentials.sessionId) {
      return;
    }

    onSceneLoaded(payload);
  }
);



socket.on(
  SERVER_SOCKET_EVENTS.SURFACE_MEDIA_UPDATE,
  (payload: SurfaceMediaUpdatePayload) => {
    if (payload.sessionId !== credentials.sessionId) {
      return;
    }

    onSurfaceMediaUpdated(payload);
  }
);




  socket.connect();
}

export function disconnectPlayer(): void {
  if (!playerSocket) return;

  playerSocket.removeAllListeners();
  playerSocket.disconnect();
  playerSocket = null;
}
