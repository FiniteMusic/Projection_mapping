import { Router } from "express";
import multer from "multer";
import path from "node:path";
import os from "node:os";
import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { MEDIA_LIMITS, uploadMediaFieldsSchema, updateMediaRequestSchema } from "@projection/shared";
import { requireAuth } from "../middleware/auth.middleware.js";
import { insertMedia, getMediaForUser, getMediaByProject, getMediaFileForUser, renameMedia, deleteMedia } from "../repositories/media.repository.js";
import { inspectMediaFile, storeMediaFile, removeMediaFile, MEDIA_STORAGE_DIRECTORY, MediaValidationError } from "../services/media.service.js";
import { projectBelongsToUser } from "../repositories/surface.repository.js";
export const mediaRouter = Router();
function resolveMediaName(providedName, originalName) {
    const candidate = providedName ??
        path.parse(originalName).name;
    const name = candidate.trim();
    if (name.length === 0 ||
        name.length > 120 ||
        /[\u0000-\u001F\u007F]/.test(name)) {
        throw new MediaValidationError("Invalid media name");
    }
    return name;
}
mediaRouter.use(requireAuth);
const upload = multer({
    storage: multer.diskStorage({
        destination: os.tmpdir(),
        filename: (_req, _file, callback) => {
            callback(null, `projection-${randomUUID()}.tmp`);
        }
    }),
    limits: {
        fileSize: MEDIA_LIMITS.videoMaxBytes,
        files: 1,
        fields: 1
    }
});
function receiveFile(req, res, next) {
    upload.single("file")(req, res, error => {
        if (error) {
            if (error instanceof multer.MulterError) {
                res.status(400).json({
                    error: "UPLOAD_ERROR",
                    message: error.message
                });
                return;
            }
            next(error);
            return;
        }
        next();
    });
}
mediaRouter.post("/projects/:projectId/media", receiveFile, async (req, res) => {
    const temporaryPath = req.file?.path;
    let storedPath = null;
    try {
        const projectId = String(req.params.projectId);
        if (!(await projectBelongsToUser(projectId, req.user.id))) {
            res.status(404).json({
                error: "PROJECT_NOT_FOUND"
            });
            return;
        }
        if (!req.file) {
            res.status(400).json({
                error: "FILE_REQUIRED"
            });
            return;
        }
        const fields = uploadMediaFieldsSchema.safeParse(req.body);
        if (!fields.success) {
            res.status(400).json({
                error: "VALIDATION_ERROR",
                details: fields.error.flatten()
            });
            return;
        }
        const inspected = await inspectMediaFile(req.file.path);
        const stored = await storeMediaFile(req.file.path, inspected.mimeType);
        storedPath = stored.filePath;
        const media = await insertMedia({
            projectId,
            name: resolveMediaName(fields.data.name, req.file.originalname),
            type: inspected.type,
            mimeType: inspected.mimeType,
            url: stored.url,
            sizeBytes: inspected.sizeBytes,
            dimensions: inspected.dimensions,
            durationSeconds: inspected.durationSeconds,
            status: "ready"
        });
        res.status(201).json({ media });
    }
    catch (error) {
        if (storedPath) {
            await removeMediaFile(storedPath).catch(cleanupError => console.error("[MEDIA] Cleanup failed:", cleanupError));
        }
        if (error instanceof MediaValidationError) {
            res.status(400).json({
                error: "INVALID_MEDIA",
                message: error.message
            });
            return;
        }
        throw error;
    }
    finally {
        if (temporaryPath) {
            await rm(temporaryPath, { force: true }).catch(error => console.error("[MEDIA] Temporary cleanup failed:", error));
        }
    }
});
mediaRouter.get("/projects/:projectId/media", async (req, res) => {
    const projectId = String(req.params.projectId);
    if (!(await projectBelongsToUser(projectId, req.user.id))) {
        res.status(404).json({
            error: "PROJECT_NOT_FOUND"
        });
        return;
    }
    const media = await getMediaByProject(projectId);
    res.status(200).json({ media });
});
mediaRouter.get("/media/files/:fileName", async (req, res, next) => {
    const fileName = String(req.params.fileName);
    if (!/^[0-9a-f-]{36}\.(jpg|png|webp|mp4)$/.test(fileName)) {
        res.status(404).json({
            error: "MEDIA_NOT_FOUND"
        });
        return;
    }
    const media = await getMediaFileForUser(fileName, req.user.id);
    if (!media) {
        res.status(404).json({
            error: "MEDIA_NOT_FOUND"
        });
        return;
    }
    const filePath = path.join(MEDIA_STORAGE_DIRECTORY, fileName);
    res.type(media.mimeType);
    res.sendFile(filePath, error => {
        if (error && !res.headersSent) {
            next(error);
        }
    });
});
mediaRouter.get("/media/:mediaId", async (req, res) => {
    const media = await getMediaForUser(String(req.params.mediaId), req.user.id);
    if (!media) {
        res.status(404).json({
            error: "MEDIA_NOT_FOUND"
        });
        return;
    }
    res.status(200).json({ media });
});
mediaRouter.patch("/media/:mediaId", async (req, res) => {
    const parsed = updateMediaRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({
            error: "VALIDATION_ERROR",
            details: parsed.error.flatten()
        });
        return;
    }
    const media = await renameMedia(String(req.params.mediaId), req.user.id, parsed.data.name);
    if (!media) {
        res.status(404).json({
            error: "MEDIA_NOT_FOUND"
        });
        return;
    }
    res.status(200).json({ media });
});
mediaRouter.delete("/media/:mediaId", async (req, res) => {
    const mediaId = String(req.params.mediaId);
    const existing = await getMediaForUser(mediaId, req.user.id);
    if (!existing) {
        res.status(404).json({
            error: "MEDIA_NOT_FOUND"
        });
        return;
    }
    const deleted = await deleteMedia(mediaId, req.user.id);
    if (!deleted) {
        res.status(404).json({
            error: "MEDIA_NOT_FOUND"
        });
        return;
    }
    const filePath = path.join(MEDIA_STORAGE_DIRECTORY, path.basename(existing.url));
    try {
        await removeMediaFile(filePath);
    }
    catch (error) {
        console.error("[MEDIA] File cleanup failed:", error);
    }
    res.status(204).send();
});
//# sourceMappingURL=media.routes.js.map