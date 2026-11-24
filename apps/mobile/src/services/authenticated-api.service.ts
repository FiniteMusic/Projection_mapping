
import { apiRequest } from "./api.service";
import {
  getStoredTokens,
  refreshSession,
  clearTokens
} from "./auth.service";

import {
  notifySessionExpired
} from "./session-events.service";

function isUnauthorized(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message === "API request failed: 401"
  );
}

export async function authenticatedRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const tokens = await getStoredTokens();

  if (!tokens) {
    throw new Error("No authenticated session");
  }

  async function sendRequest(accessToken: string): Promise<T> {
    return apiRequest<T>(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  try {
    return await sendRequest(tokens.accessToken);
  } catch (error) {
    if (!isUnauthorized(error)) {
      console.error("[API] Request failed:", error);
      throw error;
    }
  }

  try {
    const latestTokens = await getStoredTokens();

    if (!latestTokens) {
      throw new Error("No authenticated session");
    }

    if (latestTokens.accessToken !== tokens.accessToken) {
      return await sendRequest(latestTokens.accessToken);
    }

    const refreshed = await refreshSession();

    return await sendRequest(refreshed.tokens.accessToken);
  } catch (error) {
    console.error("[AUTH] Token refresh failed:", error);

    if (isUnauthorized(error)) {
        await clearTokens();
        notifySessionExpired();
        }

    throw error;
  }
}
