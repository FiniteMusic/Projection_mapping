import { Router } from "express";
import { createPairingRequestSchema } from "@projection/shared";
import { createPlayerPairing } from "../services/pairing.service.js";
import { pairingStatusRequestSchema } from "@projection/shared";
import { getPlayerPairingStatus } from "../services/pairing.service.js";
import { pairingCreationLimiter, pairingStatusLimiter } from "../middleware/pairing-rate-limit.middleware.js";
export const pairingRouter = Router();
pairingRouter.post("/", pairingCreationLimiter, async (req, res) => {
    const parsed = createPairingRequestSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
        res.status(400).json({
            error: "VALIDATION_ERROR",
            details: parsed.error.flatten()
        });
        return;
    }
    try {
        const pairing = await createPlayerPairing();
        res.status(201).json(pairing);
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "PAIRING_CODE_GENERATION_FAILED") {
            res.status(503).json({
                error: "PAIRING_UNAVAILABLE"
            });
            return;
        }
        throw error;
    }
});
pairingRouter.post("/status", pairingStatusLimiter, async (req, res) => {
    const parsed = pairingStatusRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({
            error: "VALIDATION_ERROR",
            details: parsed.error.flatten()
        });
        return;
    }
    try {
        const result = await getPlayerPairingStatus(parsed.data.pairingToken);
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "PAIRING_NOT_FOUND") {
            res.status(404).json({
                error: "PAIRING_NOT_FOUND"
            });
            return;
        }
        if (error instanceof Error &&
            error.message === "PAIRING_CREDENTIALS_UNAVAILABLE") {
            res.status(409).json({
                error: "PAIRING_CREDENTIALS_UNAVAILABLE"
            });
            return;
        }
        throw error;
    }
});
//# sourceMappingURL=pairing.routes.js.map