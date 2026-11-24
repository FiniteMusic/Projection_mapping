
import {
  PROJECT_ROUTES,
  SURFACE_ROUTES,
  type CreateSurfaceRequest,
  type SurfaceListResponse,
  type SurfaceResponse,
  type UpdateSurfaceRequest
} from "@projection/shared";

import {
  authenticatedRequest
} from "./authenticated-api.service";

export async function getSurfaces(
  projectId: string
): Promise<SurfaceListResponse> {
  return authenticatedRequest<SurfaceListResponse>(
    PROJECT_ROUTES.surfaces(projectId)
  );
}

export async function getSurface(
  surfaceId: string
): Promise<SurfaceResponse> {
  return authenticatedRequest<SurfaceResponse>(
    SURFACE_ROUTES.byId(surfaceId)
  );
}

export async function createSurface(
  projectId: string,
  data: CreateSurfaceRequest
): Promise<SurfaceResponse> {
  return authenticatedRequest<SurfaceResponse>(
    PROJECT_ROUTES.surfaces(projectId),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
  );
}

export async function updateSurface(
  surfaceId: string,
  data: UpdateSurfaceRequest
): Promise<SurfaceResponse> {
  return authenticatedRequest<SurfaceResponse>(
    SURFACE_ROUTES.byId(surfaceId),
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
  );
}

export async function deleteSurface(
  surfaceId: string
): Promise<void> {
  return authenticatedRequest<void>(
    SURFACE_ROUTES.byId(surfaceId),
    {
      method: "DELETE"
    }
  );
}
