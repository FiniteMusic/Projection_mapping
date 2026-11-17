
import type { MediaAsset } from "@projection/shared";

import { environment } from "../config/environment";
import { loadPlayerSession } from "./session-storage.service";

export async function fetchMediaBlob(
  media: MediaAsset
): Promise<Blob> {
  const credentials = loadPlayerSession();

  if (!credentials) {
    throw new Error("Player session is not available");
  }

  const fileName = media.url.split("/").pop();

  if (
    !fileName ||
    !/^[0-9a-f-]{36}\.(jpg|png|webp|mp4)$/.test(fileName)
  ) {
    throw new Error("Invalid media file name");
  }

  const url = new URL(
    `/api/player/media/files/${fileName}`,
    environment.serverUrl
  );

   console.log("[Player] HTTP authentication:", {
    hasToken: Boolean(credentials.playerToken),
    tokenLength: credentials.playerToken.length,
    sessionId: credentials.sessionId
    });

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${credentials.playerToken}`
      
    }
  });

  if (!response.ok) {
    throw new Error(
      `Media request failed: HTTP ${response.status}`
    );
  }

  return response.blob();
}
