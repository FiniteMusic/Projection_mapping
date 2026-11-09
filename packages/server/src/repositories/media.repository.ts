
import { randomUUID } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type {
  Dimensions,
  MediaAsset,
  MediaStatus,
  MediaType,
  SupportedMediaMimeType
} from "@projection/shared";

import { pool } from "../config/database.js";

interface MediaRow extends RowDataPacket {
  id: string;
  project_id: string;
  name: string;
  type: MediaType;
  mime_type: SupportedMediaMimeType;
  url: string;
  size_bytes: number | string;
  dimensions: string | Dimensions;
  duration_seconds: number | null;
  status: MediaStatus;
  created_at: Date;
  updated_at: Date;
}

function mapMedia(row: MediaRow): MediaAsset {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    type: row.type,
    mimeType: row.mime_type,
    url: row.url,
    sizeBytes: Number(row.size_bytes),
    dimensions:
      typeof row.dimensions === "string"
        ? JSON.parse(row.dimensions) as Dimensions
        : row.dimensions,
    durationSeconds: row.duration_seconds,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
  };
}

export async function insertMedia(
  data: Pick<
    MediaAsset,
    | "projectId"
    | "name"
    | "type"
    | "mimeType"
    | "url"
    | "sizeBytes"
    | "dimensions"
    | "durationSeconds"
    | "status"
  >
): Promise<MediaAsset> {
  const id = randomUUID();

  await pool.execute<ResultSetHeader>(
    `INSERT INTO media (
      id, project_id, name, type, mime_type,
      url, size_bytes, dimensions,
      duration_seconds, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.projectId,
      data.name,
      data.type,
      data.mimeType,
      data.url,
      data.sizeBytes,
      JSON.stringify(data.dimensions),
      data.durationSeconds,
      data.status
    ]
  );

  const media = await getMediaById(id);

  if (!media) {
    throw new Error("Failed to retrieve created media");
  }

  return media;
}

export async function getMediaById(
  id: string
): Promise<MediaAsset | null> {
  const [rows] = await pool.execute<MediaRow[]>(
    "SELECT * FROM media WHERE id = ?",
    [id]
  );

  const row = rows[0];
  return row ? mapMedia(row) : null;
}

export async function getMediaForUser(
  mediaId: string,
  userId: string
): Promise<MediaAsset | null> {
  const [rows] = await pool.execute<MediaRow[]>(
    `SELECT m.*
     FROM media m
     INNER JOIN projects p ON p.id = m.project_id
     WHERE m.id = ? AND p.owner_id = ?`,
    [mediaId, userId]
  );

  const row = rows[0];
  return row ? mapMedia(row) : null;
}

export async function getMediaByProject(
  projectId: string
): Promise<MediaAsset[]> {
  const [rows] = await pool.execute<MediaRow[]>(
    `SELECT *
     FROM media
     WHERE project_id = ?
     ORDER BY created_at DESC`,
    [projectId]
  );

  return rows.map(mapMedia);
}

export async function renameMedia(
  mediaId: string,
  userId: string,
  name: string
): Promise<MediaAsset | null> {
  await pool.execute(
    `UPDATE media m
     INNER JOIN projects p ON p.id = m.project_id
     SET m.name = ?
     WHERE m.id = ? AND p.owner_id = ?`,
    [name, mediaId, userId]
  );

  return getMediaForUser(mediaId, userId);
}

export async function deleteMedia(
  mediaId: string,
  userId: string
): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE m
     FROM media m
     INNER JOIN projects p ON p.id = m.project_id
     WHERE m.id = ? AND p.owner_id = ?`,
    [mediaId, userId]
  );

  return result.affectedRows > 0;
}


export async function getMediaFileForUser(
  fileName: string,
  userId: string
): Promise<MediaAsset | null> {
  const [rows] = await pool.execute<MediaRow[]>(
    `SELECT m.*
     FROM media m
     INNER JOIN projects p ON p.id = m.project_id
     WHERE m.url = ? AND p.owner_id = ?
     LIMIT 1`,
    [`/api/media/files/${fileName}`, userId]
  );

  const row = rows[0];
  return row ? mapMedia(row) : null;
}
