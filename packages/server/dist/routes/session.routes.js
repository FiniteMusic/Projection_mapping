import { Router } from "express";
import { createSessionRequestSchema, sessionIdParamsSchema, endSessionRequestSchema, pairSessionRequestSchema } from "@projection/shared";
import { requireAuth } from "../middleware/auth.middleware.js";
import { createProjectionSession, getProjectionSession, endProjectionSession } from "../services/session.service.js";
import { confirmPlayerPairing } from "../services/pairing.service.js";
import { pairingConfirmationLimiter } from "../middleware/pairing-rate-limit.middleware.js";
import { getSessionRoom } from "@projection/shared";
export const sessionRouter = Router();
sessionRouter.use(requireAuth);
sessionRouter.post("/pair", pairingConfirmationLimiter, async (req, res) => {
    const parsed = pairSessionRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({
            error: "VALIDATION_ERROR",
            details: parsed.error.flatten()
        });
        return;
    }
    try {
        const result = await confirmPlayerPairing(parsed.data.pairingCode, parsed.data.projectId, req.user.id);
        res.status(201).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            switch (error.message) {
                case "PROJECT_NOT_FOUND":
                case "PAIRING_NOT_FOUND":
                    res.status(404).json({
                        error: error.message
                    });
                    return;
                case "PROJECT_ARCHIVED":
                case "PAIRING_EXPIRED":
                case "PAIRING_MAX_ATTEMPTS":
                    res.status(409).json({
                        error: error.message
                    });
                    return;
            }
        }
        throw error;
    }
});
sessionRouter.post("/", async (req, res) => {
    const parsed = createSessionRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({
            error: "VALIDATION_ERROR",
            details: parsed.error.flatten()
        });
        return;
    }
    try {
        const session = await createProjectionSession(parsed.data.projectId, req.user.id);
        res.status(201).json({ session });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "PROJECT_NOT_FOUND") {
                res.status(404).json({
                    error: "PROJECT_NOT_FOUND"
                });
                return;
            }
            if (error.message === "PROJECT_ARCHIVED") {
                res.status(409).json({
                    error: "PROJECT_ARCHIVED"
                });
                return;
            }
        }
        throw error;
    }
});
sessionRouter.get("/:sessionId", async (req, res) => {
    const parsed = sessionIdParamsSchema.safeParse(req.params);
    if (!parsed.success) {
        res.status(400).json({
            error: "VALIDATION_ERROR",
            details: parsed.error.flatten()
        });
        return;
    }
    try {
        const session = await getProjectionSession(parsed.data.sessionId, req.user.id);
        res.status(200).json({ session });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "SESSION_NOT_FOUND") {
            res.status(404).json({
                error: "SESSION_NOT_FOUND"
            });
            return;
        }
        throw error;
    }
});
sessionRouter.post("/:sessionId/end", async (req, res) => {
    const params = sessionIdParamsSchema.safeParse(req.params);
    const body = endSessionRequestSchema.safeParse(req.body ?? {});
    if (!params.success || !body.success) {
        res.status(400).json({
            error: "VALIDATION_ERROR"
        });
        return;
    }
    try {
        const session = await endProjectionSession(params.data.sessionId, req.user.id);
        const io = req.app.get("io");
        const room = getSessionRoom(session.id);
        io.to(room).emit("session:ended", {
            sessionId: session.id
        });
        io.in(room).disconnectSockets(true);
        res.status(200).json({ session });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "SESSION_NOT_FOUND") {
            res.status(404).json({
                error: "SESSION_NOT_FOUND"
            });
            return;
        }
        throw error;
    }
});
//# sourceMappingURL=session.routes.js.map