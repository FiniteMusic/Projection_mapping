
import { environment } from "../config/environment";

export interface PairingRequest {
  pairingCode: string;
  pairingToken: string;
  expiresAt: string;
}

export interface PlayerCredentials {
  sessionId: string;
  playerToken: string;
  expiresAt: string;
}

export interface PairingStatus {
  status: "pending" | "paired" | "expired";
  credentials?: PlayerCredentials;
}

async function post<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  const response = await fetch(
    `${environment.serverUrl}${endpoint}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  );

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}: ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

export async function requestPairing(): Promise<PairingRequest> {
  return post<PairingRequest>(
    "/api/sessions/pairing",
    {}
  );
}

export async function checkPairingStatus(
  pairingToken: string
): Promise<PairingStatus> {
  return post<PairingStatus>(
    "/api/sessions/pairing/status",
    { pairingToken }
  );
}

