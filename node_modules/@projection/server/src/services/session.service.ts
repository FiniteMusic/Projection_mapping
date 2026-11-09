import type {
  ProjectionSession
} from "@projection/shared";

import {
  getProjectForUser
} from "../repositories/project.repository.js";

import {
  createSession as createSessionRecord,
  getSessionForUser,
  endSession as endSessionRecord
} from "../repositories/session.repository.js";

export async function createProjectionSession(
  projectId: string,
  userId: string
): Promise<ProjectionSession> {
  const project = await getProjectForUser(projectId, userId);

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  if (project.status === "archived") {
    throw new Error("PROJECT_ARCHIVED");
  }

  return createSessionRecord(projectId);
}

export async function getProjectionSession(
  sessionId: string,
  userId: string
): Promise<ProjectionSession> {
  const session = await getSessionForUser(
    sessionId,
    userId
  );

  if (!session) {
    throw new Error("SESSION_NOT_FOUND");
  }

  return session;
}

export async function endProjectionSession(
  sessionId: string,
  userId: string
): Promise<ProjectionSession> {
  const session = await getSessionForUser(
    sessionId,
    userId
  );

  if (!session) {
    throw new Error("SESSION_NOT_FOUND");
  }

  if (session.status === "ended") {
    return session;
  }

  const endedSession = await endSessionRecord(
    sessionId,
    userId
  );

  if (!endedSession) {
    throw new Error("SESSION_NOT_FOUND");
  }

  return endedSession;
}