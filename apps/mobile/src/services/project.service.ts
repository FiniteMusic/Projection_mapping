
import {
  PROJECT_ROUTES,
  type CreateProjectRequest,
  type ProjectListResponse,
  type ProjectResponse,
  type UpdateProjectRequest
} from "@projection/shared";

import { apiRequest } from "./api.service";
import { getStoredTokens } from "./auth.service";

async function getAuthorizationHeaders() {
  const tokens = await getStoredTokens();

  if (!tokens) {
    throw new Error("No authenticated session");
  }

  return {
    Authorization: `Bearer ${tokens.accessToken}`
  };
}

export async function getProjects(): Promise<ProjectListResponse> {
  const headers = await getAuthorizationHeaders();

  return apiRequest<ProjectListResponse>(
    PROJECT_ROUTES.base,
    { headers }
  );
}

export async function createProject(
  data: CreateProjectRequest
): Promise<ProjectResponse> {
  const headers = await getAuthorizationHeaders();

  return apiRequest<ProjectResponse>(
    PROJECT_ROUTES.base,
    {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
  );
}

export async function getProject(
  projectId: string
): Promise<ProjectResponse> {
  const headers = await getAuthorizationHeaders();

  return apiRequest<ProjectResponse>(
    PROJECT_ROUTES.byId(projectId),
    { headers }
  );
}

export async function updateProject(
  projectId: string,
  data: UpdateProjectRequest
): Promise<ProjectResponse> {
  const headers = await getAuthorizationHeaders();

  return apiRequest<ProjectResponse>(
    PROJECT_ROUTES.byId(projectId),
    {
      method: "PATCH",
      headers: {
        ...headers,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
  );
}
