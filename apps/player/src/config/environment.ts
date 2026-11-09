const configuredServerUrl = import.meta.env.VITE_SERVER_URL;

export const environment = {
  serverUrl:
    configuredServerUrl?.trim() ||
    window.location.origin,
} as const;