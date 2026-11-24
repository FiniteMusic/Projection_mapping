
import { io, type Socket } from "socket.io-client";

import {
  CLIENT_SOCKET_EVENTS,
  type SurfaceUpdatePayload,
  type SocketAck,
  type SocketOperationAccepted
} from "@projection/shared";

import { getStoredTokens } from "./auth.service";

const SERVER_URL = process.env.EXPO_PUBLIC_API_URL;

export async function createControllerSocket(
  sessionId: string
): Promise<Socket> {
  if (!SERVER_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const tokens = await getStoredTokens();

  if (!tokens) {
    throw new Error("No authenticated session");
  }

  const socket = io(SERVER_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 5000,
    auth: {
      token: tokens.accessToken,
      role: "controller",
      sessionId
    }
  });

  return socket;
}

export function emitSurfaceUpdate(
  socket: Socket,
  payload: SurfaceUpdatePayload
): void {
  if (!socket.connected) return;

  socket.volatile.emit(
    CLIENT_SOCKET_EVENTS.SURFACE_UPDATE,
    payload,
    (response: SocketAck<SocketOperationAccepted>) => {
      if (!response.ok) {
        console.warn(
          "[SOCKET] Surface update rejected:",
          response.error
        );
      }
    }
  );
}
