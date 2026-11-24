
import * as SecureStore from "expo-secure-store";

import {
  AUTH_ROUTES,
  registerRequestSchema,
  loginRequestSchema,
  type AuthResponse,
  type AuthTokens,
  type LoginRequest,
  type CurrentUserResponse,
  type RefreshTokenResponse,
  type User,
  type RegisterRequest
} from "@projection/shared";

import { apiRequest } from "./api.service";
import {
  clearProjectionSession
} from "./session-storage.service";

const TOKEN_STORAGE_KEY = "projection_auth_tokens";

export async function saveTokens(
  tokens: AuthTokens
): Promise<void> {
  await SecureStore.setItemAsync(
    TOKEN_STORAGE_KEY,
    JSON.stringify(tokens)
  );
}

export async function getStoredTokens(): Promise<AuthTokens | null> {
  const stored = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AuthTokens;
  } catch {
    return null;
  }
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
}

export async function login(
  credentials: LoginRequest
): Promise<AuthResponse> {
  const validated = loginRequestSchema.parse(credentials);

  const response = await apiRequest<AuthResponse>(
    AUTH_ROUTES.login,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(validated)
    }
  );

  await saveTokens(response.tokens);

  return response;
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  const tokens = await getStoredTokens();

  if (!tokens) {
    throw new Error("No authenticated session");
  }

  return apiRequest<CurrentUserResponse>(
    AUTH_ROUTES.me,
    {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    }
  );
}


let refreshPromise: Promise<RefreshTokenResponse> | null = null;

export function refreshSession(): Promise<RefreshTokenResponse> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const currentRefresh = (async () => {
    const tokens = await getStoredTokens();

    if (!tokens) {
      throw new Error("No refresh token available");
    }

    const response = await apiRequest<RefreshTokenResponse>(
      AUTH_ROUTES.refresh,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          refreshToken: tokens.refreshToken
        })
      }
    );

    await saveTokens(response.tokens);

    return response;
  })();

  refreshPromise = currentRefresh;

  void currentRefresh.finally(() => {
    if (refreshPromise === currentRefresh) {
      refreshPromise = null;
    }
  }).catch(() => {});

  return currentRefresh;
}



export async function logout(): Promise<void> {
  const tokens = await getStoredTokens();

  try {
    if (tokens) {
      await apiRequest<void>(
        AUTH_ROUTES.logout,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            refreshToken: tokens.refreshToken
          })
        }
      );
    }
  } finally {
    try {
      await clearProjectionSession();
    } finally {
      await clearTokens();
    }
  }
}


export async function restoreSession(): Promise<User | null> {
  const tokens = await getStoredTokens();

  if (!tokens) {
    return null;
  }

  try {
    const response = await getCurrentUser();
    return response.user;
  } catch (error) {
    const isUnauthorized =
      error instanceof Error &&
      error.message === "API request failed: 401";

    if (!isUnauthorized) {
      throw error;
    }
  }

  try {
    await refreshSession();

    const response = await getCurrentUser();
    return response.user;
  } catch (error) {
    const isUnauthorized =
      error instanceof Error &&
      error.message === "API request failed: 401";

    if (isUnauthorized) {
      await clearTokens();
      return null;
    }

    throw error;
  }
}

export async function register(
  credentials: RegisterRequest
): Promise<AuthResponse> {
  const validated = registerRequestSchema.parse(credentials);

  const response = await apiRequest<AuthResponse>(
    AUTH_ROUTES.register,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(validated)
    }
  );

  await saveTokens(response.tokens);

  return response;
}
