import { randomUUID } from "node:crypto";
import { pool } from "../config/database.js";
function mapProject(row) {
    return {
        id: row.id,
        ownerId: row.owner_id,
        name: row.name,
        description: row.description,
        status: row.status,
        settings: typeof row.settings === "string"
            ? JSON.parse(row.settings)
            : row.settings,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString()
    };
}
export async function createProject(ownerId, name, description, settings) {
    const id = randomUUID();
    await pool.execute(`INSERT INTO projects
      (id, owner_id, name, description, status, settings)
     VALUES (?, ?, ?, ?, 'draft', ?)`, [id, ownerId, name, description, JSON.stringify(settings)]);
    const project = await getProjectById(id);
    if (!project) {
        throw new Error("Failed to retrieve created project");
    }
    return project;
}
export async function getProjectById(id) {
    const [rows] = await pool.execute("SELECT * FROM projects WHERE id = ?", [id]);
    const row = rows[0];
    return row ? mapProject(row) : null;
}
export async function getProjectForUser(projectId, userId) {
    const [rows] = await pool.execute(`SELECT *
     FROM projects
     WHERE id = ? AND owner_id = ?
     LIMIT 1`, [projectId, userId]);
    const row = rows[0];
    return row ? mapProject(row) : null;
}
export async function getProjectsByOwner(ownerId) {
    const [rows] = await pool.execute(`SELECT * FROM projects
     WHERE owner_id = ?
     ORDER BY created_at DESC`, [ownerId]);
    return rows.map(mapProject);
}
export async function updateProject(id, ownerId, changes) {
    const fields = [];
    const values = [];
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
        await pool.execute(`UPDATE projects
       SET ${fields.join(", ")}
       WHERE id = ? AND owner_id = ?`, [...values, id, ownerId]);
    }
    const [rows] = await pool.execute(`SELECT * FROM projects
     WHERE id = ? AND owner_id = ?`, [id, ownerId]);
    const row = rows[0];
    return row ? mapProject(row) : null;
}
export async function getProjectMediaUrls(projectId, ownerId) {
    const [projects] = await pool.execute(`SELECT *
     FROM projects
     WHERE id = ? AND owner_id = ?`, [projectId, ownerId]);
    if (projects.length === 0) {
        return null;
    }
    const [rows] = await pool.execute(`SELECT m.url
     FROM media m
     INNER JOIN projects p ON p.id = m.project_id
     WHERE m.project_id = ? AND p.owner_id = ?`, [projectId, ownerId]);
    return rows.map(row => row.url);
}
export async function deleteProject(id, ownerId) {
    const [result] = await pool.execute("DELETE FROM projects WHERE id = ? AND owner_id = ?", [id, ownerId]);
    return result.affectedRows > 0;
}
//# sourceMappingURL=project.repository.js.map