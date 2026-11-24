
import * as SecureStore from "expo-secure-store";

const SESSION_STORAGE_KEY = "projection_active_session";

export async function saveProjectionSession(
  sessionId: string
): Promise<void> {
  await SecureStore.setItemAsync(
    SESSION_STORAGE_KEY,
    sessionId
  );
}

export async function getStoredProjectionSession(): Promise<string | null> {
  return SecureStore.getItemAsync(SESSION_STORAGE_KEY);
}

export async function clearProjectionSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
}
