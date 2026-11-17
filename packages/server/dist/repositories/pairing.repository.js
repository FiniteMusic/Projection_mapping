import { randomUUID } from "node:crypto";
import { pool } from "../config/database.js";
import { PAIRING_CONFIG } from "@projection/shared";
function mapPairing(row) {
    return {
        id: row.id,
        sessionId: row.session_id,
        status: row.status,
        pairingCode: row.pairing_code,
        pairingTokenHash: row.pairing_token_hash,
        createdAt: row.created_at.toISOString(),
        expiresAt: row.expires_at.toISOString(),
        failedAttempts: row.failed_attempts
    };
}
export async function createPairing(pairingCode, pairingTokenHash, expiresAt) {
    const id = randomUUID();
    await pool.execute(`INSERT INTO pending_pairings
    (id, pairing_code, active_pairing_code,
     pairing_token_hash, expires_at)
   VALUES (?, ?, ?, ?, ?)`, [
        id,
        pairingCode,
        pairingCode,
        pairingTokenHash,
        expiresAt
    ]);
    const pairing = await getPairingById(id);
    if (!pairing) {
        throw new Error("PAIRING_CREATION_FAILED");
    }
    return pairing;
}
export async function getPairingById(id) {
    const [rows] = await pool.execute(`SELECT *
     FROM pending_pairings
     WHERE id = ?
     LIMIT 1`, [id]);
    const row = rows[0];
    return row ? mapPairing(row) : null;
}
export async function getPairingByCode(pairingCode) {
    const [rows] = await pool.execute(`SELECT *
     FROM pending_pairings
     WHERE pairing_code = ?
       AND status = 'pending'
       AND expires_at > CURRENT_TIMESTAMP(3)
     ORDER BY created_at DESC
     LIMIT 1`, [pairingCode]);
    const row = rows[0];
    return row ? mapPairing(row) : null;
}
export async function getPairingByTokenHash(tokenHash) {
    const [rows] = await pool.execute(`SELECT *
     FROM pending_pairings
     WHERE pairing_token_hash = ?
     LIMIT 1`, [tokenHash]);
    const row = rows[0];
    return row ? mapPairing(row) : null;
}
export async function incrementPairingAttempts(pairingId) {
    await pool.execute(`UPDATE pending_pairings
     SET failed_attempts = failed_attempts + 1
     WHERE id = ?
       AND status = 'pending'`, [pairingId]);
}
export async function expirePairing(pairingId) {
    await pool.execute(`UPDATE pending_pairings
     SET status = 'expired',
         active_pairing_code = NULL
     WHERE id = ?
       AND status = 'pending'`, [pairingId]);
}
export async function expirePendingPairings() {
    const [result] = await pool.execute(`UPDATE pending_pairings
     SET status = 'expired',
         active_pairing_code = NULL
     WHERE status = 'pending'
       AND expires_at <= CURRENT_TIMESTAMP(3)`);
    return result.affectedRows;
}
export async function confirmPairing(pairingCode, projectId, userId) {
    const connection = await pool.getConnection();
    let transactionActive = false;
    try {
        await connection.beginTransaction();
        transactionActive = true;
        const [projects] = await connection.execute(`SELECT id, status
       FROM projects
       WHERE id = ? AND owner_id = ?
       LIMIT 1`, [projectId, userId]);
        if (projects.length === 0) {
            throw new Error("PROJECT_NOT_FOUND");
        }
        if (projects[0].status === "archived") {
            throw new Error("PROJECT_ARCHIVED");
        }
        const [rows] = await connection.execute(`SELECT *
       FROM pending_pairings
       WHERE active_pairing_code = ?
       LIMIT 1
       FOR UPDATE`, [pairingCode]);
        const pairing = rows[0];
        if (!pairing) {
            throw new Error("PAIRING_NOT_FOUND");
        }
        if (new Date(pairing.expires_at).getTime() <= Date.now()) {
            await connection.execute(`UPDATE pending_pairings
         SET status = 'expired',
             active_pairing_code = NULL
         WHERE id = ?`, [pairing.id]);
            await connection.commit();
            transactionActive = false;
            throw new Error("PAIRING_EXPIRED");
        }
        if (pairing.failed_attempts >= PAIRING_CONFIG.maxAttempts) {
            throw new Error("PAIRING_MAX_ATTEMPTS");
        }
        const sessionId = randomUUID();
        await connection.execute(`INSERT INTO sessions
        (id, project_id, status, player_connection_status)
       VALUES (?, ?, 'waiting', 'disconnected')`, [sessionId, projectId]);
        await connection.execute(`UPDATE pending_pairings
       SET status = 'paired',
           session_id = ?,
           active_pairing_code = NULL
       WHERE id = ?`, [sessionId, pairing.id]);
        const [sessions] = await connection.execute(`SELECT *
       FROM sessions
       WHERE id = ?
       LIMIT 1`, [sessionId]);
        const session = sessions[0];
        if (!session) {
            throw new Error("SESSION_NOT_FOUND");
        }
        const result = {
            id: session.id,
            projectId: session.project_id,
            status: session.status,
            playerConnectionStatus: session.player_connection_status,
            createdAt: session.created_at.toISOString(),
            updatedAt: session.updated_at.toISOString(),
            endedAt: session.ended_at?.toISOString() ?? null
        };
        await connection.commit();
        transactionActive = false;
        return result;
    }
    catch (error) {
        if (transactionActive) {
            await connection.rollback();
        }
        throw error;
    }
    finally {
        connection.release();
    }
}
export async function getOrCreatePairingCredentialIssue(tokenHash) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [rows] = await connection.execute(`SELECT *
       FROM pending_pairings
       WHERE pairing_token_hash = ?
       LIMIT 1
       FOR UPDATE`, [tokenHash]);
        const pairing = rows[0];
        if (!pairing ||
            pairing.status !== "paired" ||
            !pairing.session_id) {
            await connection.rollback();
            return null;
        }
        const [sessions] = await connection.execute(`SELECT status
       FROM sessions
       WHERE id = ?
       LIMIT 1`, [pairing.session_id]);
        if (sessions.length === 0 ||
            sessions[0].status === "ended") {
            await connection.rollback();
            return null;
        }
        let issuedAt = pairing.credentials_issued_at;
        if (!issuedAt) {
            await connection.execute(`UPDATE pending_pairings
         SET credentials_issued_at = CURRENT_TIMESTAMP(3)
         WHERE id = ?
           AND credentials_issued_at IS NULL`, [pairing.id]);
            const [updated] = await connection.execute(`SELECT credentials_issued_at
         FROM pending_pairings
         WHERE id = ?`, [pairing.id]);
            issuedAt = updated[0]?.credentials_issued_at ?? null;
        }
        if (!issuedAt) {
            throw new Error("CREDENTIAL_ISSUE_FAILED");
        }
        const recoveryWindowMs = 5 * 60 * 1000;
        if (Date.now() - issuedAt.getTime() > recoveryWindowMs) {
            await connection.rollback();
            return null;
        }
        await connection.commit();
        return {
            sessionId: pairing.session_id,
            issuedAt
        };
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
}
//# sourceMappingURL=pairing.repository.js.map