
import { randomUUID } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { Quad, Surface } from "@projection/shared";

import { pool } from "../config/database.js";

interface SurfaceRow extends RowDataPacket {
  id: string;
  project_id: string;
  name: string;
  corners: string | Quad;
  media_id: string | null;
  visible: number | boolean;
  z_index: number;
  opacity: number;
  created_at: Date;
  updated_at: Date;
}

type SurfaceChanges = {
  name?: string | undefined;
  corners?: Quad | undefined;
  mediaId?: string | null | undefined;
  visible?: boolean | undefined;
  zIndex?: number | undefined;
  opacity?: number | undefined;
};

function mapSurface(row: SurfaceRow): Surface {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    corners:
      typeof row.corners === "string"
        ? JSON.parse(row.corners) as Quad
        : row.corners,
    mediaId: row.media_id,
    visible: Boolean(row.visible),
    zIndex: row.z_index,
    opacity: row.opacity,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
  };
}

export async function projectBelongsToUser(
  projectId: string,
  userId: string
): Promise<boolean> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id
     FROM projects
     WHERE id = ? AND owner_id = ?
     LIMIT 1`,
    [projectId, userId]
  );

  return rows.length > 0;
}

export async function mediaBelongsToProject(
  mediaId: string,
  projectId: string
): Promise<boolean> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id
     FROM media
     WHERE id = ? AND project_id = ?
     LIMIT 1`,
    [mediaId, projectId]
  );

  return rows.length > 0;
}

export async function createSurface(
  projectId: string,
  data: {
    name: string;
    corners: Quad;
    mediaId: string | null;
    visible: boolean;
    zIndex: number;
    opacity: number;
  }
): Promise<Surface> {
  const id = randomUUID();

  await pool.execute<ResultSetHeader>(
    `INSERT INTO surfaces (
      id, project_id, name, corners,
      media_id, visible, z_index, opacity
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      projectId,
      data.name,
      JSON.stringify(data.corners),
      data.mediaId,
      data.visible ? 1 : 0,
      data.zIndex,
      data.opacity
    ]
  );

  const surface = await getSurfaceById(id);

  if (!surface) {
    throw new Error("Failed to retrieve created surface");
  }

  return surface;
}

export async function getSurfaceById(
  id: string
): Promise<Surface | null> {
  const [rows] = await pool.execute<SurfaceRow[]>(
    "SELECT * FROM surfaces WHERE id = ?",
    [id]
  );

  const row = rows[0];
  return row ? mapSurface(row) : null;
}

export async function getSurfacesByProject(
  projectId: string
): Promise<Surface[]> {
  const [rows] = await pool.execute<SurfaceRow[]>(
    `SELECT *
     FROM surfaces
     WHERE project_id = ?
     ORDER BY z_index ASC, created_at ASC`,
    [projectId]
  );

  return rows.map(mapSurface);
}

export async function getSurfaceForUser(
  surfaceId: string,
  userId: string
): Promise<Surface | null> {
  const [rows] = await pool.execute<SurfaceRow[]>(
    `SELECT s.*
     FROM surfaces s
     INNER JOIN projects p ON p.id = s.project_id
     WHERE s.id = ? AND p.owner_id = ?`,
    [surfaceId, userId]
  );

  const row = rows[0];
  return row ? mapSurface(row) : null;
}

export async function updateSurface(
  surfaceId: string,
  userId: string,
  changes: SurfaceChanges
): Promise<Surface | null> {
  const fields: string[] = [];
  const values: Array<string | number | null> = [];

  if (changes.name !== undefined) {
    fields.push("name = ?");
    values.push(changes.name);
  }

  if (changes.corners !== undefined) {
    fields.push("corners = ?");
    values.push(JSON.stringify(changes.corners));
  }

  if (changes.mediaId !== undefined) {
    fields.push("media_id = ?");
    values.push(changes.mediaId);
  }

  if (changes.visible !== undefined) {
    fields.push("visible = ?");
    values.push(changes.visible ? 1 : 0);
  }

  if (changes.zIndex !== undefined) {
    fields.push("z_index = ?");
    values.push(changes.zIndex);
  }

  if (changes.opacity !== undefined) {
    fields.push("opacity = ?");
    values.push(changes.opacity);
  }

  if (fields.length > 0) {
    await pool.execute(
      `UPDATE surfaces s
       INNER JOIN projects p ON p.id = s.project_id
       SET ${fields.map(field => `s.${field}`).join(", ")}
       WHERE s.id = ? AND p.owner_id = ?`,
      [...values, surfaceId, userId]
    );
  }

  return getSurfaceForUser(surfaceId, userId);
}

export async function deleteSurface(
  surfaceId: string,
  userId: string
): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE s
     FROM surfaces s
     INNER JOIN projects p ON p.id = s.project_id
     WHERE s.id = ? AND p.owner_id = ?`,
    [surfaceId, userId]
  );

  return result.affectedRows > 0;
}
