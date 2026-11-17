import { Router } from "express";
import { createSurfaceRequestSchema, updateSurfaceRequestSchema, getSessionRoom, SERVER_SOCKET_EVENTS } from "@projection/shared";
import { requireAuth } from "../middleware/auth.middleware.js";
import { createSurface, deleteSurface, getSurfaceForUser, getSurfacesByProject, mediaBelongsToProject, projectBelongsToUser, updateSurface } from "../repositories/surface.repository.js";
import { getActiveSessionIdsByProject } from "../repositories/session.repository.js";
import { getProjectById } from "../repositories/project.repository.js";
import { getMediaByProject } from "../repositories/media.repository.js";
export const surfaceRouter = Router();
surfaceRouter.use(requireAuth);
surfaceRouter.post("/projects/:projectId/surfaces", async (req, res) => {
    const projectId = String(req.params.projectId);
    const ownsProject = await projectBelongsToUser(projectId, req.user.id);
    if (!ownsProject) {
        res.status(404).json({
            error: "PROJECT_NOT_FOUND"
        });
        return;
    }
    const parsed = createSurfaceRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({
            error: "VALIDATION_ERROR",
            details: parsed.error.flatten()
        });
        return;
    }
    const data = parsed.data;
    if (data.mediaId !== null &&
        !(await mediaBelongsToProject(data.mediaId, projectId))) {
        res.status(400).json({
            error: "INVALID_MEDIA_REFERENCE"
        });
        return;
    }
    const surface = await createSurface(projectId, data);
    res.status(201).json({ surface });
});
surfaceRouter.get("/projects/:projectId/surfaces", async (req, res) => {
    const projectId = String(req.params.projectId);
    if (!(await projectBelongsToUser(projectId, req.user.id))) {
        res.status(404).json({
            error: "PROJECT_NOT_FOUND"
        });
        return;
    }
    const surfaces = await getSurfacesByProject(projectId);
    res.status(200).json({ surfaces });
});
surfaceRouter.get("/surfaces/:surfaceId", async (req, res) => {
    const surface = await getSurfaceForUser(String(req.params.surfaceId), req.user.id);
    if (!surface) {
        res.status(404).json({
            error: "SURFACE_NOT_FOUND"
        });
        return;
    }
    res.status(200).json({ surface });
});
surfaceRouter.patch("/surfaces/:surfaceId", async (req, res) => {
    const surfaceId = String(req.params.surfaceId);
    const existing = await getSurfaceForUser(surfaceId, req.user.id);
    if (!existing) {
        res.status(404).json({
            error: "SURFACE_NOT_FOUND"
        });
        return;
    }
    const parsed = updateSurfaceRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({
            error: "VALIDATION_ERROR",
            details: parsed.error.flatten()
        });
        return;
    }
    const changes = parsed.data;
    if (changes.mediaId !== undefined &&
        changes.mediaId !== null &&
        !(await mediaBelongsToProject(changes.mediaId, existing.projectId))) {
        res.status(400).json({
            error: "INVALID_MEDIA_REFERENCE"
        });
        return;
    }
    const surface = await updateSurface(surfaceId, req.user.id, changes);
    if (!surface) {
        res.status(404).json({
            error: "SURFACE_NOT_FOUND"
        });
        return;
    }
    res.status(200).json({ surface });
    if (changes.mediaId !== undefined) {
        try {
            const io = req.app.get("io");
            const projectId = surface.projectId;
            const sessionIds = await getActiveSessionIdsByProject(projectId);
            if (sessionIds.length > 0) {
                const project = await getProjectById(projectId);
                if (!project) {
                    console.warn("[Socket.IO] Project not found:", projectId);
                    return;
                }
                const [surfaces, media] = await Promise.all([
                    getSurfacesByProject(projectId),
                    getMediaByProject(projectId)
                ]);
                for (const sessionId of sessionIds) {
                    io.to(getSessionRoom(sessionId)).emit(SERVER_SOCKET_EVENTS.SCENE_LOAD, {
                        sessionId,
                        project,
                        surfaces,
                        media
                    });
                }
                console.log(`[Socket.IO] Scene synchronized for ${sessionIds.length} sessions`);
            }
        }
        catch (error) {
            console.error("[Socket.IO] Scene synchronization failed:", error);
        }
    }
});
surfaceRouter.delete("/surfaces/:surfaceId", async (req, res) => {
    const deleted = await deleteSurface(String(req.params.surfaceId), req.user.id);
    if (!deleted) {
        res.status(404).json({
            error: "SURFACE_NOT_FOUND"
        });
        return;
    }
    res.status(204).send();
});
//# sourceMappingURL=surface.routes.js.map