
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from "react";

import type { Socket } from "socket.io-client";

import {
  isValidQuad,
  type ProjectionSession,
  type Quad
} from "@projection/shared";

import {
  createControllerSocket,
  emitSurfaceUpdate
} from "@/services/socket.service";

import { getSession } from "@/services/session.service";

import {
  saveProjectionSession,
  getStoredProjectionSession,
  clearProjectionSession
} from "@/services/session-storage.service";

interface ProjectionSessionContextValue {
  session: ProjectionSession | null;
  connected: boolean;
  restoring: boolean;
  restoreError: string | null;
  restoreSession: () => Promise<void>;
  setSession: (session: ProjectionSession | null) => void;
  updateSurfaceCorners: (
    projectId: string,
    surfaceId: string,
    corners: Quad
  ) => void;
}

const ProjectionSessionContext =
  createContext<ProjectionSessionContextValue | null>(null);

interface ProviderProps {
  children: ReactNode;
}

export function ProjectionSessionProvider({
  children
}: ProviderProps) {
  const [session, setSessionState] =
    useState<ProjectionSession | null>(null);

  const [connected, setConnected] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [restoreError, setRestoreError] =
    useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const restoringRef = useRef(false);
  const storageQueueRef = useRef<Promise<void>>(
    Promise.resolve()
  );

  const setSession = useCallback(
    (nextSession: ProjectionSession | null) => {
      setSessionState(nextSession);
      setRestoreError(null);

      storageQueueRef.current = storageQueueRef.current
        .then(async () => {
          if (
            nextSession &&
            nextSession.status !== "ended"
          ) {
            await saveProjectionSession(nextSession.id);
          } else {
            await clearProjectionSession();
          }
        })
        .catch((error) => {
          console.warn(
            "[SESSION] Storage error:",
            error
          );
        });
    },
    []
  );

  const restoreSession = useCallback(async () => {
    if (restoringRef.current) return;

    restoringRef.current = true;
    setRestoring(true);
    setRestoreError(null);

    try {
      await storageQueueRef.current;

     const storedSessionId =
  await getStoredProjectionSession();

      if (!storedSessionId) {
        setSessionState(null);
        return;
      }

      const response = await getSession(storedSessionId);

      if (response.session.status === "ended") {
        await clearProjectionSession();
        setSessionState(null);
        return;
      }

      await saveProjectionSession(response.session.id);

        setSessionState(response.session);

      console.log(
        "[SESSION] Restored:",
        response.session.id
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "";

      if (message === "API request failed: 404") {
        try {
          await clearProjectionSession();
          setSessionState(null);
        } catch (storageError) {
          setRestoreError(
            "No fue posible eliminar la referencia local."
          );

          console.warn(
            "[SESSION] Storage error:",
            storageError
          );
        }
      } else {
        setRestoreError(
          "No fue posible recuperar la sesión de proyección."
        );

        console.warn(
          "[SESSION] Restoration failed:",
          error
        );
      }
    } finally {
      restoringRef.current = false;
      setRestoring(false);
    }
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const sessionId =
    session?.status !== "ended" ? session?.id : undefined;

  useEffect(() => {
    let cancelled = false;
    let socket: Socket | null = null;

    setConnected(false);

    if (!sessionId) return;

    async function connect() {
      try {
        const controllerSocket =
          await createControllerSocket(sessionId!);

        if (cancelled) {
          controllerSocket.disconnect();
          return;
        }

        socket = controllerSocket;
        socketRef.current = controllerSocket;

        controllerSocket.on("connect", () => {
          setConnected(true);

          console.log(
            "[SOCKET] Controller connected:",
            sessionId
          );
        });

        controllerSocket.on("disconnect", (reason) => {
          setConnected(false);

          console.log(
            "[SOCKET] Controller disconnected:",
            reason
          );
        });

        controllerSocket.on("connect_error", (error) => {
          setConnected(false);

          console.warn(
            "[SOCKET] Connection error:",
            error.message
          );
        });

        controllerSocket.on(
          "session:ended",
          (payload: { sessionId: string }) => {
            if (payload.sessionId !== sessionId) return;

            setSession(null);
          }
        );

        controllerSocket.connect();
      } catch (error) {
        if (!cancelled) {
          console.error(
            "[SOCKET] Initialization failed:",
            error
          );
        }
      }
    }

    void connect();

    return () => {
      cancelled = true;

      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
      }

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [sessionId, setSession]);

  const updateSurfaceCorners = useCallback(
    (
      projectId: string,
      surfaceId: string,
      corners: Quad
    ) => {
      const socket = socketRef.current;

      if (
        !socket?.connected ||
        !session ||
        session.status === "ended" ||
        session.projectId !== projectId ||
        !isValidQuad(corners)
      ) {
        return;
      }

      emitSurfaceUpdate(socket, {
        sessionId: session.id,
        surfaceId,
        changes: {
          corners
        }
      });
    },
    [session]
  );

  return (
    <ProjectionSessionContext.Provider
      value={{
        session,
        connected,
        restoring,
        restoreError,
        restoreSession,
        setSession,
        updateSurfaceCorners
      }}
    >
      {children}
    </ProjectionSessionContext.Provider>
  );
}

export function useProjectionSession() {
  const context = useContext(ProjectionSessionContext);

  if (!context) {
    throw new Error(
      "useProjectionSession must be used within ProjectionSessionProvider"
    );
  }

  return context;
}
