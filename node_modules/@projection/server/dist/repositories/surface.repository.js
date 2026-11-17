import { randomUUID } from "node:crypto";
import { pool } from "../config/database.js";
function mapSurface(row) {
    return {
        id: row.id,
        projectId: row.project_id,
        name: row.name,
        corners: typeof row.corners === "string"
            ? JSON.parse(row.corners)
            : row.corners,
        mediaId: row.media_id,
        visible: Boolean(row.visible),
        zIndex: row.z_index,
        opacity: row.opacity,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString()
    };
}
export async function projectBelongsToUser(projectId, userId) {
    const [rows] = await pool.execute(`SELECT id
     FROM projects
     WHERE id = ? AND owner_id = ?
     LIMIT 1`, [projectId, userId]);
    return rows.length > 0;
}
export async function mediaBelongsToProject(mediaId, projectId) {
    const [rows] = await pool.execute(`SELECT id
     FROM media
     WHERE id = ? AND project_id = ?
     LIMIT 1`, [mediaId, projectId]);
    return rows.length > 0;
}
export async function createSurface(projectId, data) {
    const id = randomUUID();
    await pool.execute(`INSERT INTO surfaces (
      id, project_id, name, corners,
      media_id, visible, z_index, opacity
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
        id,
        projectId,
        data.name,
        JSON.stringify(data.corners),
        data.mediaId,
        data.visible ? 1 : 0,
        data.zIndex,
        data.opacity
    ]);
    const surface = await getSurfaceById(id);
    if (!surface) {
        throw new Error("Failed to retrieve created surface");
    }
    return surface;
}
export async function getSurfaceById(id) {
    const [rows] = await pool.execute("SELECT * FROM surfaces WHERE id = ?", [id]);
    const row = rows[0];
    return row ? mapSurface(row) : null;
}
export async function getSurfacesByProject(projectId) {
    const [rows] = await pool.execute(`SELECT *
     FROM surfaces
     WHERE project_id = ?
     ORDER BY z_index ASC, created_at ASC`, [projectId]);
    return rows.map(mapSurface);
}
export async function getSurfaceForUser(surfaceId, userId) {
    const [rows] = await pool.execute(`SELECT s.*
     FROM surfaces s
     INNER JOIN projects p ON p.id = s.project_id
     WHERE s.id = ? AND p.owner_id = ?`, [surfaceId, userId]);
    const row = rows[0];
    return row ? mapSurface(row) : null;
}
export async function updateSurface(surfaceId, userId, changes) {
    const fields = [];
    const values = [];
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
        await pool.execute(`UPDATE surfaces s
       INNER JOIN projects p ON p.id = s.project_id
       SET ${fields.map(field => `s.${field}`).join(", ")}
       WHERE s.id = ? AND p.owner_id = ?`, [...values, surfaceId, userId]);
    }
    return getSurfaceForUser(surfaceId, userId);
}
export async function deleteSurface(surfaceId, userId) {
    const [result] = await pool.execute(`DELETE s
     FROM surfaces s
     INNER JOIN projects p ON p.id = s.project_id
     WHERE s.id = ? AND p.owner_id = ?`, [surfaceId, userId]);
    return result.affectedRows > 0;
}
//# sourceMappingURL=surface.repository.js.map