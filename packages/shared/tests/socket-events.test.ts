
import {
  describe,
  expect,
  it
} from "vitest";



import {
  CLIENT_SOCKET_EVENTS,
  SERVER_SOCKET_EVENTS,
  SOCKET_EVENTS,
  SOCKET_CONFIG,
  SOCKET_ROOM_PREFIX,
  getSessionRoom
} from "../src/index.js";

import type {
  ClientSocketEventName,
  ServerSocketEventName,
  ClientToServerEvents,
  ServerToClientEvents,
  SocketAck,
  SocketOperationAccepted,
  SessionJoinResponse,
  SurfaceCalibrationChanges,
  SurfaceUpdatePayload,
  SurfaceUpdatedPayload
} from "../src/index.js";

describe("Socket Events", () => {

  describe("CLIENT_SOCKET_EVENTS", () => {

    it("define el evento de incorporación a sesión", () => {
      expect(
        CLIENT_SOCKET_EVENTS.SESSION_JOIN
      ).toBe("session:join");
    });

    it("define el evento de estado multimedia", () => {
    expect(
        CLIENT_SOCKET_EVENTS.MEDIA_STATE
    ).toBe("media:state");
    });

    it("define el evento de actualización de superficie", () => {
      expect(
        CLIENT_SOCKET_EVENTS.SURFACE_UPDATE
      ).toBe("surface:update");
    });

    it("define el evento de reproducción", () => {
      expect(
        CLIENT_SOCKET_EVENTS.MEDIA_PLAY
      ).toBe("media:play");
    });

    it("define el evento de pausa", () => {
      expect(
        CLIENT_SOCKET_EVENTS.MEDIA_PAUSE
      ).toBe("media:pause");
    });

    it("define el evento de búsqueda de reproducción", () => {
      expect(
        CLIENT_SOCKET_EVENTS.MEDIA_SEEK
      ).toBe("media:seek");
    });

    it("no contiene nombres de eventos duplicados", () => {
      const events = Object.values(CLIENT_SOCKET_EVENTS);

      expect(
        new Set(events).size
      ).toBe(events.length);
    });

    it("contiene seis eventos", () => {
      expect(
        Object.keys(CLIENT_SOCKET_EVENTS)
      ).toHaveLength(6);
    });

  });

  describe("SERVER_SOCKET_EVENTS", () => {

    it("define el evento de estado de sesión", () => {
      expect(
        SERVER_SOCKET_EVENTS.SESSION_STATE
      ).toBe("session:state");
    });

    it("define el evento de carga de escena", () => {
      expect(
        SERVER_SOCKET_EVENTS.SCENE_LOAD
      ).toBe("scene:load");
    });

    it("define el evento de creación de superficie", () => {
      expect(
        SERVER_SOCKET_EVENTS.SURFACE_CREATE
      ).toBe("surface:create");
    });

    it("define el evento de actualización de superficie", () => {
      expect(
        SERVER_SOCKET_EVENTS.SURFACE_UPDATE
      ).toBe("surface:update");
    });

    it("define el evento de eliminación de superficie", () => {
      expect(
        SERVER_SOCKET_EVENTS.SURFACE_DELETE
      ).toBe("surface:delete");
    });

    it("define el evento de reproducción", () => {
      expect(
        SERVER_SOCKET_EVENTS.MEDIA_PLAY
      ).toBe("media:play");
    });

    it("define el evento de pausa", () => {
      expect(
        SERVER_SOCKET_EVENTS.MEDIA_PAUSE
      ).toBe("media:pause");
    });

    it("define el evento de búsqueda", () => {
      expect(
        SERVER_SOCKET_EVENTS.MEDIA_SEEK
      ).toBe("media:seek");
    });

    it("define el evento de estado multimedia", () => {
      expect(
        SERVER_SOCKET_EVENTS.MEDIA_STATE
      ).toBe("media:state");
    });

    it("no contiene nombres de eventos duplicados", () => {
      const events = Object.values(SERVER_SOCKET_EVENTS);

      expect(
        new Set(events).size
      ).toBe(events.length);
    });

    it("contiene nueve eventos", () => {
      expect(
        Object.keys(SERVER_SOCKET_EVENTS)
      ).toHaveLength(9);
    });

  });

  describe("SOCKET_EVENTS", () => {

    it("agrupa los eventos del cliente", () => {
      expect(
        SOCKET_EVENTS.CLIENT
      ).toBe(CLIENT_SOCKET_EVENTS);
    });

    it("agrupa los eventos del servidor", () => {
      expect(
        SOCKET_EVENTS.SERVER
      ).toBe(SERVER_SOCKET_EVENTS);
    });

    it("mantiene separadas las direcciones", () => {
      expect(
        SOCKET_EVENTS.CLIENT
      ).not.toBe(SOCKET_EVENTS.SERVER);
    });

  });

  describe("Eventos compartidos", () => {

        it.each([
        "SURFACE_UPDATE",
        "MEDIA_PLAY",
        "MEDIA_PAUSE",
        "MEDIA_SEEK",
        "MEDIA_STATE"
        ] as const)(
      "mantiene consistente el evento %s",
      (eventName) => {
        expect(
          CLIENT_SOCKET_EVENTS[eventName]
        ).toBe(
          SERVER_SOCKET_EVENTS[eventName]
        );
      }
    );

    it("mantiene session:join exclusivo del cliente", () => {
      expect(
        Object.values(CLIENT_SOCKET_EVENTS)
      ).toContain("session:join");

      expect(
        Object.values(SERVER_SOCKET_EVENTS)
      ).not.toContain("session:join");
    });

    it("mantiene scene:load exclusivo del servidor", () => {
      expect(
        Object.values(SERVER_SOCKET_EVENTS)
      ).toContain("scene:load");

      expect(
        Object.values(CLIENT_SOCKET_EVENTS)
      ).not.toContain("scene:load");
    });

  });

  describe("SOCKET_CONFIG", () => {

    it("establece actualizaciones de superficie cada 50 ms", () => {
      expect(
        SOCKET_CONFIG.surfaceUpdateIntervalMs
      ).toBe(50);
    });

    it("establece cinco segundos para confirmaciones", () => {
      expect(
        SOCKET_CONFIG.acknowledgmentTimeoutMs
      ).toBe(5000);
    });

    it("establece diez intentos de reconexión", () => {
      expect(
        SOCKET_CONFIG.reconnectionAttempts
      ).toBe(10);
    });

    it("establece un retraso inicial de reconexión", () => {
      expect(
        SOCKET_CONFIG.reconnectionDelayMs
      ).toBe(1000);
    });

    it("establece un retraso máximo de reconexión", () => {
      expect(
        SOCKET_CONFIG.reconnectionDelayMaxMs
      ).toBe(5000);
    });

    it("mantiene el retraso máximo mayor o igual al inicial", () => {
      expect(
        SOCKET_CONFIG.reconnectionDelayMaxMs
      ).toBeGreaterThanOrEqual(
        SOCKET_CONFIG.reconnectionDelayMs
      );
    });

    it("mantiene un intervalo de actualización positivo", () => {
      expect(
        SOCKET_CONFIG.surfaceUpdateIntervalMs
      ).toBeGreaterThan(0);
    });

    it("mantiene un tiempo de confirmación positivo", () => {
      expect(
        SOCKET_CONFIG.acknowledgmentTimeoutMs
      ).toBeGreaterThan(0);
    });

  });

  describe("SOCKET_ROOM_PREFIX", () => {

    it("establece session como prefijo", () => {
      expect(
        SOCKET_ROOM_PREFIX
      ).toBe("session");
    });

  });

  describe("getSessionRoom", () => {

    const sessionId =
      "550e8400-e29b-41d4-a716-446655440000";

    it("construye una sala con el identificador", () => {
      expect(
        getSessionRoom(sessionId)
      ).toBe(`session:${sessionId}`);
    });

    it("utiliza el prefijo configurado", () => {
      expect(
        getSessionRoom(sessionId)
      ).toBe(`${SOCKET_ROOM_PREFIX}:${sessionId}`);
    });

    it("produce salas diferentes para sesiones diferentes", () => {
      const first = getSessionRoom("session-a");
      const second = getSessionRoom("session-b");

      expect(first).not.toBe(second);
    });

    it("produce siempre la misma sala para una sesión", () => {
      expect(
        getSessionRoom(sessionId)
      ).toBe(
        getSessionRoom(sessionId)
      );
    });

    it("conserva el identificador recibido", () => {
      expect(
        getSessionRoom("abc-123")
      ).toBe("session:abc-123");
    });

  });

  describe("Contratos TypeScript", () => {

    it("restringe los nombres de eventos del cliente", () => {
      const eventName: ClientSocketEventName =
        CLIENT_SOCKET_EVENTS.SESSION_JOIN;

      const typedEvent: keyof ClientToServerEvents =
        eventName;

      expect(typedEvent).toBe("session:join");
    });

    it("restringe los nombres de eventos del servidor", () => {
      const eventName: ServerSocketEventName =
        SERVER_SOCKET_EVENTS.SCENE_LOAD;

      const typedEvent: keyof ServerToClientEvents =
        eventName;

      expect(typedEvent).toBe("scene:load");
    });

    it("admite confirmaciones exitosas tipadas", () => {
      const response: SocketAck<SocketOperationAccepted> = {
        ok: true,
        data: {
          accepted: true
        }
      };

      expect(response.ok).toBe(true);

      if (response.ok) {
        expect(response.data.accepted).toBe(true);
      }
    });

    it("admite confirmaciones de error tipadas", () => {
      const response: SocketAck<SocketOperationAccepted> = {
        ok: false,
        error: {
          code: "SESSION_NOT_FOUND",
          message: "La sesión no existe."
        }
      };

      expect(response.ok).toBe(false);

      if (!response.ok) {
        expect(response.error.code).toBe(
          "SESSION_NOT_FOUND"
        );
      }
    });

    it("admite respuestas de incorporación tipadas", () => {
      const response: SocketAck<SessionJoinResponse> = {
        ok: true,
        data: {
          sessionId:
            "550e8400-e29b-41d4-a716-446655440000",
          role: "player",
          joined: true
        }
      };

      expect(response.ok).toBe(true);

      if (response.ok) {
        expect(response.data.role).toBe("player");
        expect(response.data.joined).toBe(true);
      }
    });

  });



  
describe("Contratos de calibración", () => {
  const corners: SurfaceCalibrationChanges["corners"] = [
    { x: 0.1, y: 0.1 },
    { x: 0.9, y: 0.1 },
    { x: 0.9, y: 0.9 },
    { x: 0.1, y: 0.9 }
  ];

  it("define cuatro esquinas para la calibración", () => {
    const changes: SurfaceCalibrationChanges = {
      corners
    };

    expect(changes.corners).toHaveLength(4);
  });

  it("permite construir una actualización temporal", () => {
    const payload: SurfaceUpdatePayload = {
      sessionId: "session-1",
      surfaceId: "surface-1",
      changes: { corners }
    };

    expect(payload.changes.corners).toEqual(corners);
  });

  it("permite construir una actualización retransmitida", () => {
    const payload: SurfaceUpdatedPayload = {
      sessionId: "session-1",
      surfaceId: "surface-1",
      changes: { corners }
    };

    expect(payload.changes.corners).toEqual(corners);
  });

  it("mantiene el mismo contrato en ambas direcciones", () => {
    const changes: SurfaceCalibrationChanges = {
      corners
    };

    const clientPayload: SurfaceUpdatePayload = {
      sessionId: "session-1",
      surfaceId: "surface-1",
      changes
    };

    const serverPayload: SurfaceUpdatedPayload = {
      ...clientPayload
    };

    expect(serverPayload).toEqual(clientPayload);
  });

  it("no admite propiedades persistentes en el contrato de calibración", () => {
    // @ts-expect-error name no pertenece a SurfaceCalibrationChanges
    const invalidName: SurfaceCalibrationChanges = { name: "Nueva superficie", corners };

    // @ts-expect-error opacity no pertenece a SurfaceCalibrationChanges
    const invalidOpacity: SurfaceCalibrationChanges = { opacity: 0.5, corners };

    expect(invalidName).toHaveProperty("name");
    expect(invalidOpacity).toHaveProperty("opacity");
  });
});


});
