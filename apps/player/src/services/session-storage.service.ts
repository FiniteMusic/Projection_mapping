import type { PlayerCredentials } from "./pairing.service";

const STORAGE_KEY = "projection-player-session";

export function savePlayerSession(
  credentials: PlayerCredentials
): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(credentials)
    );
  } catch (error) {
    console.error(
      "[Player] Failed to save session:",
      error
    );
  }
}

export function loadPlayerSession(): PlayerCredentials | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) return null;

    const credentials: unknown = JSON.parse(stored);

    if (
      typeof credentials !== "object" ||
      credentials === null ||
      !("sessionId" in credentials) ||
      !("playerToken" in credentials) ||
      !("expiresAt" in credentials) ||
      typeof credentials.sessionId !== "string" ||
      typeof credentials.playerToken !== "string" ||
      typeof credentials.expiresAt !== "string" ||
      !credentials.sessionId ||
      !credentials.playerToken
    ) {
      clearPlayerSession();
      return null;
    }

    const expiration = Date.parse(credentials.expiresAt);

    if (
      !Number.isFinite(expiration) ||
      expiration <= Date.now()
    ) {
      clearPlayerSession();
      return null;
    }

    return credentials as PlayerCredentials;
  } catch (error) {
    console.error(
      "[Player] Failed to load session:",
      error
    );

    clearPlayerSession();
    return null;
  }
}

export function clearPlayerSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error(
      "[Player] Failed to clear session:",
      error
    );
  }
}