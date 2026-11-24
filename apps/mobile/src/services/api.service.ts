
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error("EXPO_PUBLIC_API_URL is not configured");
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorBody = await response.text();

      if (response.status !== 401) {
        console.error("[API] HTTP error:", {
          url: response.url,
          status: response.status,
          body: errorBody
        });
      }

      throw new Error(`API request failed: ${response.status}`);
    }
    return response.json() as Promise<T>;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "API request failed: 401"
    ) {
      throw error;
    }

    console.error("[API] Request error:", error);
    throw error;
  }
}
