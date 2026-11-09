import { createHash, randomBytes, randomInt } from "node:crypto";
import { PAIRING_CONFIG } from "@projection/shared";
import { createPairing, getPairingByCode, getPairingByTokenHash, expirePairing, expirePendingPairings, confirmPairing, getOrCreatePairingCredentialIssue } from "../repositories/pairing.repository.js";
import { createPlayerTokenAt } from "./player-token.service.js";
function generatePairingCode() {
    const max = 10 ** PAIRING_CONFIG.codeLength;
    return randomInt(0, max)
        .toString()
        .padStart(PAIRING_CONFIG.codeLength, "0");
}
function generatePairingToken() {
    return randomBytes(32).toString("hex");
}
function hashPairingToken(token) {
    return createHash("sha256")
        .update(token)
        .digest("hex");
}
export async function createPlayerPairing() {
    await expirePendingPairings();
    const maxRetries = 10;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const pairingCode = generatePairingCode();
        const existingPairing = await getPairingByCode(pairingCode);
        if (existingPairing) {
            continue;
        }
        const pairingToken = generatePairingToken();
        const pairingTokenHash = hashPairingToken(pairingToken);
        const expiresAt = new Date(Date.now() + PAIRING_CONFIG.expirationSeconds * 1000);
        try {
            const pairing = await createPairing(pairingCode, pairingTokenHash, expiresAt);
            return {
                pairingCode,
                pairingToken,
                expiresAt: pairing.expiresAt
            };
        }
        catch (error) {
            const databaseError = error;
            if (databaseError.code === "ER_DUP_ENTRY") {
                continue;
            }
            throw error;
        }
    }
    throw new Error("PAIRING_CODE_GENERATION_FAILED");
}
export async function getPlayerPairingStatus(pairingToken) {
    const tokenHash = hashPairingToken(pairingToken);
    const pairing = await getPairingByTokenHash(tokenHash);
    if (!pairing) {
        throw new Error("PAIRING_NOT_FOUND");
    }
    if (pairing.status === "expired") {
        return { status: "expired" };
    }
    if (pairing.status === "pending") {
        if (new Date(pairing.expiresAt).getTime() <= Date.now()) {
            await expirePairing(pairing.id);
            return { status: "expired" };
        }
        return { status: "pending" };
    }
    const credentialIssue = await getOrCreatePairingCredentialIssue(tokenHash);
    if (!credentialIssue) {
        throw new Error("PAIRING_CREDENTIALS_UNAVAILABLE");
    }
    const credentials = await createPlayerTokenAt(credentialIssue.sessionId, credentialIssue.issuedAt);
    return {
        status: "paired",
        credentials: {
            sessionId: credentialIssue.sessionId,
            playerToken: credentials.playerToken,
            expiresAt: credentials.expiresAt
        }
    };
}
export async function confirmPlayerPairing(pairingCode, projectId, userId) {
    const session = await confirmPairing(pairingCode, projectId, userId);
    return { session };
}
//# sourceMappingURL=pairing.service.js.map