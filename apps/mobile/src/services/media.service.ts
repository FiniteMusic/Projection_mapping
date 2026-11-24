
import {
  MEDIA_ROUTES,
  PROJECT_ROUTES,
  type MediaListResponse,
  type MediaResponse,
  type UpdateMediaRequest
} from "@projection/shared";

import {
  authenticatedRequest
} from "./authenticated-api.service";

import { File } from "expo-file-system";

export async function getProjectMedia(
  projectId: string
): Promise<MediaListResponse> {
  return authenticatedRequest<MediaListResponse>(
    PROJECT_ROUTES.media(projectId)
  );
}

export async function getMedia(
  mediaId: string
): Promise<MediaResponse> {
  return authenticatedRequest<MediaResponse>(
    MEDIA_ROUTES.byId(mediaId)
  );
}

export async function updateMedia(
  mediaId: string,
  data: UpdateMediaRequest
): Promise<MediaResponse> {
  return authenticatedRequest<MediaResponse>(
    MEDIA_ROUTES.byId(mediaId),
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
  );
}

export async function deleteMedia(
  mediaId: string
): Promise<void> {
  return authenticatedRequest<void>(
    MEDIA_ROUTES.byId(mediaId),
    {
      method: "DELETE"
    }
  );
}



export interface UploadMediaFile {
  uri: string;
  name: string;
  mimeType: string;
}

export async function uploadMedia(
  projectId: string,
  file: UploadMediaFile,
  customName?: string
): Promise<MediaResponse> {
  const selectedFile = new File(file.uri);

  const formData = new FormData();

  formData.append("file", selectedFile, file.name);

  if (customName !== undefined) {
    formData.append("name", customName);
  }

  return authenticatedRequest<MediaResponse>(
    PROJECT_ROUTES.media(projectId),
    {
      method: "POST",
      body: formData
    }
  );
}


