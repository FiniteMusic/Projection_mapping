import { type ProjectionSession } from "@projection/shared";
export interface PairingRecord {
    id: string;
    sessionId: string | null;
    status: "pending" | "paired" | "expired";
    pairingCode: string;
    pairingTokenHash: string;
    createdAt: string;
    expiresAt: string;
    failedAttempts: number;
}
export declare function createPairing(pairingCode: string, pairingTokenHash: string, expiresAt: Date): Promise<PairingRecord>;
export declare function getPairingById(id: string): Promise<PairingRecord | null>;
export declare function getPairingByCode(pairingCode: string): Promise<PairingRecord | null>;
export declare function getPairingByTokenHash(tokenHash: string): Promise<PairingRecord | null>;
export declare function incrementPairingAttempts(pairingId: string): Promise<void>;
export declare function expirePairing(pairingId: string): Promise<void>;
export declare function expirePendingPairings(): Promise<number>;
export declare function confirmPairing(pairingCode: string, projectId: string, userId: string): Promise<ProjectionSession>;
export declare function getOrCreatePairingCredentialIssue(tokenHash: string): Promise<{
    sessionId: string;
    issuedAt: Date;
} | null>;
