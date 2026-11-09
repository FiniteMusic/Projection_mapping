
import { randomUUID } from "node:crypto";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

import { pool } from "../config/database.js";

import type {
  Project,
  ProjectSettings,
  ProjectStatus
} from "@projection/shared";

interface ProjectRow extends RowDataPacket {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  settings: string | ProjectSettings;
  created_at: Date;
  updated_at: Date;
}

function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    description: row.description,
    status: row.status,
    settings:
      typeof row.settings === "string"
        ? JSON.parse(row.settings) as ProjectSettings
        : row.settings,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
  };
}

export async function createProject(
  ownerId: string,
  name: string,
  description: string | null,
  settings: ProjectSettings
): Promise<Project> {
  const id = randomUUID();

  await pool.execute<ResultSetHeader>(
    `INSERT INTO projects
      (id, owner_id, name, description, status, settings)
     VALUES (?, ?, ?, ?, 'draft', ?)`,
    [id, ownerId, name, description, JSON.stringify(settings)]
  );

  const project = await getProjectById(id);

  if (!project) {
    throw new Error("Failed to retrieve created project");
  }

  return project;
}

export async function getProjectById(
  id: string
): Promise<Project | null> {
  const [rows] = await pool.execute<ProjectRow[]>(
    "SELECT * FROM projects WHERE id = ?",
    [id]
  );

  const row = rows[0];

  return row ? mapProject(row) : null;
}

export async function getProjectForUser(
  projectId: string,
  userId: string
): Promise<Project | null> {
  const [rows] = await pool.execute<ProjectRow[]>(
    `SELECT *
     FROM projects
     WHERE id = ? AND owner_id = ?
     LIMIT 1`,
    [projectId, userId]
  );

  const row = rows[0];

  return row ? mapProject(row) : null;
}

export async function getProjectsByOwner(
  ownerId: string
): Promise<Project[]> {
  const [rows] = await pool.execute<ProjectRow[]>(
    `SELECT * FROM projects
     WHERE owner_id = ?
     ORDER BY created_at DESC`,
    [ownerId]
  );

  return rows.map(mapProject);
}


export async function updateProject(
  id: string,
  ownerId: string,
  changes: {
    name?: string | undefined;
    description?: string | null | undefined;
    status?: ProjectStatus | undefined;
    settings?: ProjectSettings | undefined;
  }
): Promise<Project | null> {
  const fields: string[] = [];
  const values: Array<string | null> = [];

  if (changes.name !== undefined) {
    fields.push("name = ?");
    values.push(changes.name);
  }

  if (changes.description !== undefined) {
    fields.push("description = ?");
    values.push(changes.description);
  }

  if (changes.status !== undefined) {
    fields.push("status = ?");
    values.push(changes.status);
  }

  if (changes.settings !== undefined) {
    fields.push("settings = ?");
    values.push(JSON.stringify(changes.settings));
  }

  if (fields.length > 0) {
    await pool.execute(
      `UPDATE projects
       SET ${fields.join(", ")}
       WHERE id = ? AND owner_id = ?`,
      [...values, id, ownerId]
    );
  }

  const [rows] = await pool.execute<ProjectRow[]>(
    `SELECT * FROM projects
     WHERE id = ? AND owner_id = ?`,
    [id, ownerId]
  );

  const row = rows[0];
  return row ? mapProject(row) : null;
}


interface ProjectMediaRow extends RowDataPacket {
  url: string;
}

export async function getProjectMediaUrls(
  projectId: string,
  ownerId: string
): Promise<string[] | null> {
  const [projects] = await pool.execute<ProjectRow[]>(
    `SELECT *
     FROM projects
     WHERE id = ? AND owner_id = ?`,
    [projectId, ownerId]
  );

  if (projects.length === 0) {
    return null;
  }

  const [rows] = await pool.execute<ProjectMediaRow[]>(
    `SELECT m.url
     FROM media m
     INNER JOIN projects p ON p.id = m.project_id
     WHERE m.project_id = ? AND p.owner_id = ?`,
    [projectId, ownerId]
  );

  return rows.map(row => row.url);
}



interface ProjectMediaRow extends RowDataPacket {
  url: string;
}

export async function deleteProject(
  id: string,
  ownerId: string
): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    "DELETE FROM projects WHERE id = ? AND owner_id = ?",
    [id, ownerId]
  );

  return result.affectedRows > 0;
}
