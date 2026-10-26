
import {
  describe,
  expect,
  it
} from "vitest";

import {
  PAIRING_CONFIG,
  sessionUUIDSchema,
  projectionSessionStatusSchema,
  playerConnectionStatusSchema,
  pairingCodeSchema,
  createSessionRequestSchema,
  pairSessionRequestSchema,
  endSessionRequestSchema,
  playerTokenSchema,
  playerCredentialsSchema,
  sessionIdParamsSchema
} from "../src/index.js";

import {
  pairingStatusRequestSchema,
  pairingStatusResponseSchema,
  createPairingRequestSchema,
  createPairingResponseSchema
} from "../src/schemas/session.schema.js";

describe("Session Schemas", () => {


      
describe("createPairingRequestSchema", () => {
  it("acepta una solicitud vacía", () => {
    expect(
      createPairingRequestSchema.safeParse({}).success
    ).toBe(true);
  });

  it("rechaza propiedades adicionales", () => {
    expect(
      createPairingRequestSchema.safeParse({
        projectId: "550e8400-e29b-41d4-a716-446655440000"
      }).success
    ).toBe(false);
  });

  it("rechaza null", () => {
    expect(
      createPairingRequestSchema.safeParse(null).success
    ).toBe(false);
  });
});

describe("createPairingResponseSchema", () => {
  const validResponse = {
    pairingCode: "123456",
    pairingToken: "temporary-pairing-token-123",
    expiresAt: "2026-10-18T12:00:00Z"
  };

  it("acepta una respuesta válida", () => {
    expect(
      createPairingResponseSchema.safeParse(validResponse).success
    ).toBe(true);
  });

  it("acepta códigos con ceros a la izquierda", () => {
    expect(
      createPairingResponseSchema.safeParse({
        ...validResponse,
        pairingCode: "000123"
      }).success
    ).toBe(true);
  });

  it("acepta fechas con desplazamiento horario", () => {
    expect(
      createPairingResponseSchema.safeParse({
        ...validResponse,
        expiresAt: "2026-10-18T06:00:00-06:00"
      }).success
    ).toBe(true);
  });

  it("rechaza respuestas sin pairingCode", () => {
    const { pairingCode, ...response } = validResponse;

    expect(
      createPairingResponseSchema.safeParse(response).success
    ).toBe(false);
  });

  it("rechaza códigos inválidos", () => {
    expect(
      createPairingResponseSchema.safeParse({
        ...validResponse,
        pairingCode: "12345"
      }).success
    ).toBe(false);
  });

  it("rechaza tokens vacíos", () => {
    expect(
      createPairingResponseSchema.safeParse({
        ...validResponse,
        pairingToken: ""
      }).success
    ).toBe(false);
  });

  it("rechaza fechas sin zona horaria", () => {
    expect(
      createPairingResponseSchema.safeParse({
        ...validResponse,
        expiresAt: "2026-10-18T12:00:00"
      }).success
    ).toBe(false);
  });

  it("rechaza fechas inválidas", () => {
    expect(
      createPairingResponseSchema.safeParse({
        ...validResponse,
        expiresAt: "fecha-invalida"
      }).success
    ).toBe(false);
  });

  it("rechaza propiedades adicionales", () => {
    expect(
      createPairingResponseSchema.safeParse({
        ...validResponse,
        sessionId: "550e8400-e29b-41d4-a716-446655440000"
      }).success
    ).toBe(false);
  });
});

      describe("pairingStatusResponseSchema", () => {
        const validCredentials = {
          sessionId: "550e8400-e29b-41d4-a716-446655440000",
          playerToken: "valid-player-token",
          expiresAt: "2026-10-18T12:00:00Z"
        };

        it("acepta el estado pending sin credenciales", () => {
          const result = pairingStatusResponseSchema.safeParse({
            status: "pending"
          });

          expect(result.success).toBe(true);
        });

        it("acepta el estado expired sin credenciales", () => {
          const result = pairingStatusResponseSchema.safeParse({
            status: "expired"
          });

          expect(result.success).toBe(true);
        });

        it("acepta el estado paired con credenciales válidas", () => {
          const result = pairingStatusResponseSchema.safeParse({
            status: "paired",
            credentials: validCredentials
          });

          expect(result.success).toBe(true);
        });

        it("rechaza paired sin credenciales", () => {
          const result = pairingStatusResponseSchema.safeParse({
            status: "paired"
          });

          expect(result.success).toBe(false);
        });

        it("rechaza pending con credenciales", () => {
          const result = pairingStatusResponseSchema.safeParse({
            status: "pending",
            credentials: validCredentials
          });

          expect(result.success).toBe(false);
        });

        it("rechaza expired con credenciales", () => {
          const result = pairingStatusResponseSchema.safeParse({
            status: "expired",
            credentials: validCredentials
          });

          expect(result.success).toBe(false);
        });

        it("rechaza estados desconocidos", () => {
          const result = pairingStatusResponseSchema.safeParse({
            status: "connected"
          });

          expect(result.success).toBe(false);
        });

        it("rechaza credenciales inválidas en paired", () => {
          const result = pairingStatusResponseSchema.safeParse({
            status: "paired",
            credentials: {
              ...validCredentials,
              sessionId: "invalid-uuid"
            }
          });

          expect(result.success).toBe(false);
        });

        it("rechaza propiedades adicionales", () => {
          const result = pairingStatusResponseSchema.safeParse({
            status: "pending",
            unexpected: true
          });

          expect(result.success).toBe(false);
        });
      });


  describe("pairingStatusRequestSchema", () => {
  it("acepta un token de vinculación válido", () => {
    const result = pairingStatusRequestSchema.safeParse({
      pairingToken: "temporary-pairing-token-123"
    });

    expect(result.success).toBe(true);
  });

  it("rechaza solicitudes sin pairingToken", () => {
    const result = pairingStatusRequestSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("rechaza tokens vacíos", () => {
      const result = pairingStatusRequestSchema.safeParse({
        pairingToken: ""
      });

      expect(result.success).toBe(false);
      });

      it("rechaza tokens de tipo numérico", () => {
        const result = pairingStatusRequestSchema.safeParse({
          pairingToken: 123456
        });

        expect(result.success).toBe(false);
      });

      it("rechaza propiedades adicionales", () => {
        const result = pairingStatusRequestSchema.safeParse({
          pairingToken: "temporary-pairing-token-123",
          projectId: "550e8400-e29b-41d4-a716-446655440000"
        });

        expect(result.success).toBe(false);
      });
    });

  const validSessionId =
    "550e8400-e29b-41d4-a716-446655440000";

  const validProjectId =
    "123e4567-e89b-42d3-a456-426614174000";

  describe("sessionUUIDSchema", () => {

    it("acepta un UUID válido", () => {
      expect(
        sessionUUIDSchema.safeParse(validSessionId).success
      ).toBe(true);
    });

    it("rechaza un identificador arbitrario", () => {
      expect(
        sessionUUIDSchema.safeParse("session-123").success
      ).toBe(false);
    });

    it("rechaza un UUID incompleto", () => {
      expect(
        sessionUUIDSchema.safeParse(
          "550e8400-e29b-41d4-a716"
        ).success
      ).toBe(false);
    });

    it("rechaza una cadena vacía", () => {
      expect(
        sessionUUIDSchema.safeParse("").success
      ).toBe(false);
    });

    it("rechaza valores numéricos", () => {
      expect(
        sessionUUIDSchema.safeParse(123456).success
      ).toBe(false);
    });

  });

  describe("projectionSessionStatusSchema", () => {

    it.each([
      "waiting",
      "active",
      "ended"
    ])("acepta el estado %s", (status) => {
      expect(
        projectionSessionStatusSchema.safeParse(status).success
      ).toBe(true);
    });

    it("rechaza estados desconocidos", () => {
      expect(
        projectionSessionStatusSchema.safeParse(
          "paused"
        ).success
      ).toBe(false);
    });

  });

  describe("playerConnectionStatusSchema", () => {

    it("acepta el estado disconnected", () => {
      expect(
        playerConnectionStatusSchema.safeParse(
          "disconnected"
        ).success
      ).toBe(true);
    });

    it("acepta el estado connected", () => {
      expect(
        playerConnectionStatusSchema.safeParse(
          "connected"
        ).success
      ).toBe(true);
    });

    it("rechaza estados desconocidos", () => {
      expect(
        playerConnectionStatusSchema.safeParse(
          "connecting"
        ).success
      ).toBe(false);
    });

  });

  describe("pairingCodeSchema", () => {

    it("acepta un código de seis dígitos", () => {
      expect(
        pairingCodeSchema.safeParse("123456").success
      ).toBe(true);
    });

    it("conserva los ceros a la izquierda", () => {
      expect(
        pairingCodeSchema.parse("001234")
      ).toBe("001234");
    });

    it("acepta el código 000000", () => {
      expect(
        pairingCodeSchema.safeParse("000000").success
      ).toBe(true);
    });

    it("acepta el código 999999", () => {
      expect(
        pairingCodeSchema.safeParse("999999").success
      ).toBe(true);
    });

    it("rechaza códigos de cinco dígitos", () => {
      expect(
        pairingCodeSchema.safeParse("12345").success
      ).toBe(false);
    });

    it("rechaza códigos de siete dígitos", () => {
      expect(
        pairingCodeSchema.safeParse("1234567").success
      ).toBe(false);
    });

    it("rechaza códigos con letras", () => {
      expect(
        pairingCodeSchema.safeParse("12AB56").success
      ).toBe(false);
    });

    it("rechaza códigos con espacios", () => {
      expect(
        pairingCodeSchema.safeParse(" 123456 ").success
      ).toBe(false);
    });

    it("rechaza códigos numéricos", () => {
      expect(
        pairingCodeSchema.safeParse(123456).success
      ).toBe(false);
    });

    it("rechaza códigos con símbolos", () => {
      expect(
        pairingCodeSchema.safeParse("123-56").success
      ).toBe(false);
    });

  });

  describe("createSessionRequestSchema", () => {

    it("acepta una solicitud válida", () => {
      expect(
        createSessionRequestSchema.safeParse({
          projectId: validProjectId
        }).success
      ).toBe(true);
    });

    it("rechaza solicitudes sin projectId", () => {
      expect(
        createSessionRequestSchema.safeParse({}).success
      ).toBe(false);
    });

    it("rechaza un projectId inválido", () => {
      expect(
        createSessionRequestSchema.safeParse({
          projectId: "project-123"
        }).success
      ).toBe(false);
    });

    it("rechaza propiedades adicionales", () => {
      expect(
        createSessionRequestSchema.safeParse({
          projectId: validProjectId,
          userId: validSessionId
        }).success
      ).toBe(false);
    });

  });

  describe("pairSessionRequestSchema", () => {

        
    it("acepta un código válido asociado a un proyecto", () => {
      const result = pairSessionRequestSchema.safeParse({
        pairingCode: "482913",
        projectId: "550e8400-e29b-41d4-a716-446655440000"
      });

      expect(result.success).toBe(true);
    });

    it("rechaza una vinculación sin projectId", () => {
      const result = pairSessionRequestSchema.safeParse({
        pairingCode: "482913"
      });

      expect(result.success).toBe(false);
    });

    it("rechaza un projectId con formato inválido", () => {
      const result = pairSessionRequestSchema.safeParse({
        pairingCode: "482913",
        projectId: "proyecto-123"
      });

      expect(result.success).toBe(false);
    });


    it("acepta una solicitud de emparejamiento válida", () => {
      expect(
        pairSessionRequestSchema.safeParse({
          pairingCode: "123456",
          projectId: "550e8400-e29b-41d4-a716-446655440000"
        }).success
      ).toBe(true);
    });

    it("acepta códigos con ceros a la izquierda", () => {
      expect(
        pairSessionRequestSchema.safeParse({
          pairingCode: "000123",
          projectId: "550e8400-e29b-41d4-a716-446655440000"
        }).success
      ).toBe(true);
    });

    it("rechaza solicitudes sin código", () => {
      expect(
        pairSessionRequestSchema.safeParse({}).success
      ).toBe(false);
    });

    it("rechaza códigos incorrectos en estructura", () => {
      expect(
        pairSessionRequestSchema.safeParse({
          pairingCode: "123"
        }).success
      ).toBe(false);
    });

    it("rechaza propiedades adicionales", () => {
      expect(
        pairSessionRequestSchema.safeParse({
          pairingCode: "123456",
          sessionId: validSessionId
        }).success
      ).toBe(false);
    });

  });

  describe("endSessionRequestSchema", () => {

    it("acepta una solicitud vacía", () => {
      expect(
        endSessionRequestSchema.safeParse({}).success
      ).toBe(true);
    });

    it("rechaza propiedades adicionales", () => {
      expect(
        endSessionRequestSchema.safeParse({
          reason: "manual"
        }).success
      ).toBe(false);
    });

    it("rechaza null", () => {
      expect(
        endSessionRequestSchema.safeParse(null).success
      ).toBe(false);
    });

  });

  describe("playerTokenSchema", () => {

    it("acepta un token no vacío", () => {
      expect(
        playerTokenSchema.safeParse(
          "player-token-123"
        ).success
      ).toBe(true);
    });

    it("rechaza una cadena vacía", () => {
      expect(
        playerTokenSchema.safeParse("").success
      ).toBe(false);
    });

    it("rechaza valores null", () => {
      expect(
        playerTokenSchema.safeParse(null).success
      ).toBe(false);
    });

    it("rechaza valores numéricos", () => {
      expect(
        playerTokenSchema.safeParse(123456).success
      ).toBe(false);
    });

  });

  describe("playerCredentialsSchema", () => {

    const validCredentials = {
      sessionId: validSessionId,
      playerToken: "player-token-123",
      expiresAt: "2026-10-17T20:00:00Z"
    };

    it("acepta credenciales válidas con UTC", () => {
      expect(
        playerCredentialsSchema.safeParse(
          validCredentials
        ).success
      ).toBe(true);
    });

    it("acepta fechas con desplazamiento horario", () => {
      expect(
        playerCredentialsSchema.safeParse({
          ...validCredentials,
          expiresAt: "2026-10-17T14:00:00-06:00"
        }).success
      ).toBe(true);
    });

    it("rechaza credenciales sin sessionId", () => {
      const {
        sessionId: _sessionId,
        ...withoutSessionId
      } = validCredentials;

      expect(
        playerCredentialsSchema.safeParse(
          withoutSessionId
        ).success
      ).toBe(false);
    });

    it("rechaza identificadores de sesión inválidos", () => {
      expect(
        playerCredentialsSchema.safeParse({
          ...validCredentials,
          sessionId: "invalid-session"
        }).success
      ).toBe(false);
    });

    it("rechaza tokens vacíos", () => {
      expect(
        playerCredentialsSchema.safeParse({
          ...validCredentials,
          playerToken: ""
        }).success
      ).toBe(false);
    });

    it("rechaza fechas sin zona horaria", () => {
      expect(
        playerCredentialsSchema.safeParse({
          ...validCredentials,
          expiresAt: "2026-10-17T20:00:00"
        }).success
      ).toBe(false);
    });

    it("rechaza fechas con formato incorrecto", () => {
      expect(
        playerCredentialsSchema.safeParse({
          ...validCredentials,
          expiresAt: "17/10/2026"
        }).success
      ).toBe(false);
    });

    it("rechaza propiedades adicionales", () => {
      expect(
        playerCredentialsSchema.safeParse({
          ...validCredentials,
          admin: true
        }).success
      ).toBe(false);
    });

  });

  describe("sessionIdParamsSchema", () => {

    it("acepta parámetros válidos", () => {
      expect(
        sessionIdParamsSchema.safeParse({
          sessionId: validSessionId
        }).success
      ).toBe(true);
    });

    it("rechaza parámetros sin sessionId", () => {
      expect(
        sessionIdParamsSchema.safeParse({}).success
      ).toBe(false);
    });

    it("rechaza identificadores inválidos", () => {
      expect(
        sessionIdParamsSchema.safeParse({
          sessionId: "123"
        }).success
      ).toBe(false);
    });

    it("rechaza parámetros adicionales", () => {
      expect(
        sessionIdParamsSchema.safeParse({
          sessionId: validSessionId,
          projectId: validProjectId
        }).success
      ).toBe(false);
    });

  });

  describe("PAIRING_CONFIG", () => {

    it("establece códigos de seis dígitos", () => {
      expect(
        PAIRING_CONFIG.codeLength
      ).toBe(6);
    });

    it("establece una caducidad de 300 segundos", () => {
      expect(
        PAIRING_CONFIG.expirationSeconds
      ).toBe(300);
    });

    it("establece un máximo de cinco intentos", () => {
      expect(
        PAIRING_CONFIG.maxAttempts
      ).toBe(5);
    });

  });

});
