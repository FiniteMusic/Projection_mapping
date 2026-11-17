import { Router } from "express";
import path from "node:path";
import { requirePlayerAuth } from "../middleware/player-auth.middleware.js";
import { getMediaFileForProject } from "../repositories/media.repository.js";
import { MEDIA_STORAGE_DIRECTORY } from "../services/media.service.js";
export const playerMediaRouter = Router();
playerMediaRouter.get("/media/files/:fileName", requirePlayerAuth, async (req, res, next) => {
    try {
        const fileName = String(req.params.fileName);
        if (!/^[0-9a-f-]{36}\.(jpg|png|webp|mp4)$/.test(fileName)) {
            res.status(404).json({
                error: "MEDIA_NOT_FOUND"
            });
            return;
        }
        const session = res.locals.playerSession;
        if (!session) {
            res.status(401).json({
                error: "UNAUTHORIZED"
            });
            return;
        }
        const media = await getMediaFileForProject(fileName, session.projectId);
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
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=player-media.routes.js.map