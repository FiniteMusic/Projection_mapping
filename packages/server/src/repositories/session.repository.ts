import { randomUUID } from "node:crypto";

import type {
  RowDataPacket
} from "mysql2";

import type {
  ProjectionSession
} from "@projection/shared";

import { pool } from "../config/database.js";

import type { ResultSetHeader } from "mysql2";

interface SessionRow extends RowDataPacket {
  id: string;
  project_id: string;
  status: ProjectionSession["status"];
  player_connection_status:
    ProjectionSession["playerConnectionStatus"];
  created_at: Date;
  updated_at: Date;
  ended_at: Date | null;
}

function mapSession(row: SessionRow): ProjectionSession {
  return {
    id: row.id,
    projectId: row.project_id,
    status: row.status,
    playerConnectionStatus: row.player_connection_status,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    endedAt: row.ended_at?.toISOString() ?? null
  };
}

export async function createSession(
  projectId: string
): Promise<ProjectionSession> {
  const id = randomUUID();

  await pool.execute(
    `INSERT INTO sessions (
      id,
      project_id,
      status,
      player_connection_status
    ) VALUES (?, ?, 'waiting', 'disconnected')`,
    [id, projectId]
  );

  const session = await getSessionById(id);

  if (!session) {
    throw new Error("SESSION_CREATION_FAILED");
  }

  return session;
}

export async function getSessionById(
  sessionId: string
): Promise<ProjectionSession | null> {
  const [rows] = await pool.execute<SessionRow[]>(
    `SELECT
      id,
      project_id,
      status,
      player_connection_status,
      created_at,
      updated_at,
      ended_at
    FROM sessions
    WHERE id = ?
    LIMIT 1`,
    [sessionId]
  );

  return rows.length > 0
    ? mapSession(rows[0]!)
    : null;
}

export async function getSessionForUser(
  sessionId: string,
  userId: string
): Promise<ProjectionSession | null> {
  const [rows] = await pool.execute<SessionRow[]>(
    `SELECT
      s.id,
      s.project_id,
      s.status,
      s.player_connection_status,
      s.created_at,
      s.updated_at,
      s.ended_at
    FROM sessions AS s
    INNER JOIN projects AS p
      ON p.id = s.project_id
    WHERE s.id = ?
      AND p.owner_id = ?
    LIMIT 1`,
    [sessionId, userId]
  );

  return rows.length > 0
    ? mapSession(rows[0]!)
    : null;
}

export async function endSession(
  sessionId: string,
  userId: string
): Promise<ProjectionSession | null> {
  await pool.execute(
    `UPDATE sessions AS s
    INNER JOIN projects AS p
      ON p.id = s.project_id
    SET
      s.status = 'ended',
      s.player_connection_status = 'disconnected',
      s.ended_at = CURRENT_TIMESTAMP(3)
    WHERE s.id = ?
      AND p.owner_id = ?
      AND s.status <> 'ended'`,
    [sessionId, userId]
  );

  return getSessionForUser(sessionId, userId);
}

export async function updatePlayerConnectionStatus(
  sessionId: string,
  status: ProjectionSession["playerConnectionStatus"]
): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE sessions
     SET
       player_connection_status = ?,
       status = CASE
         WHEN ? = 'connected' THEN 'active'
         ELSE status
       END
     WHERE id = ?
       AND status <> 'ended'`,
    [status, status, sessionId]
  );

  return result.affectedRows > 0;
}

export async function resetPlayerConnections(): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE sessions
     SET player_connection_status = 'disconnected'
     WHERE status <> 'ended'
       AND player_connection_status = 'connected'`
  );

  return result.affectedRows;
}