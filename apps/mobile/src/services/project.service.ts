
import {
  PROJECT_ROUTES,
  type CreateProjectRequest,
  type ProjectListResponse,
  type ProjectResponse,
  type UpdateProjectRequest
} from "@projection/shared";

import {
  authenticatedRequest
} from "./authenticated-api.service";

export async function getProjects(): Promise<ProjectListResponse> {
  return authenticatedRequest<ProjectListResponse>(
    PROJECT_ROUTES.base
  );
}

export async function createProject(
  data: CreateProjectRequest
): Promise<ProjectResponse> {
  return authenticatedRequest<ProjectResponse>(
    PROJECT_ROUTES.base,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
  );
}

export async function getProject(
  projectId: string
): Promise<ProjectResponse> {
  return authenticatedRequest<ProjectResponse>(
    PROJECT_ROUTES.byId(projectId)
  );
}

export async function updateProject(
  projectId: string,
  data: UpdateProjectRequest
): Promise<ProjectResponse> {
  return authenticatedRequest<ProjectResponse>(
    PROJECT_ROUTES.byId(projectId),
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
  );
}


export async function deleteProject(
  projectId: string
): Promise<void> {
  return authenticatedRequest<void>(
    PROJECT_ROUTES.byId(projectId),
    {
      method: "DELETE"
    }
  );
}
