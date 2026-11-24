
import type {
  PairSessionRequest,
  PairSessionResponse,
  SessionResponse
} from "@projection/shared";

import {
  authenticatedRequest
} from "./authenticated-api.service";

export async function pairSession(
  data: PairSessionRequest
): Promise<PairSessionResponse> {
  return authenticatedRequest<PairSessionResponse>(
    "/api/sessions/pair",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
  );
}

export async function getSession(
  sessionId: string
): Promise<SessionResponse> {
  return authenticatedRequest<SessionResponse>(
    `/api/sessions/${encodeURIComponent(sessionId)}`
  );
}

export async function endSession(
  sessionId: string
): Promise<SessionResponse> {
  return authenticatedRequest<SessionResponse>(
    `/api/sessions/${encodeURIComponent(sessionId)}/end`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    }
  );
}
