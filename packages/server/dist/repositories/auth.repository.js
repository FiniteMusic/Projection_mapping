import { randomUUID, randomBytes, createHash } from "node:crypto";
import { pool } from "../config/database.js";
function mapUser(row) {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString()
    };
}
export async function createUser(name, email, passwordHash) {
    const id = randomUUID();
    await pool.execute(`INSERT INTO users (id, name, email, password_hash)
     VALUES (?, ?, ?, ?)`, [id, name, email, passwordHash]);
    const user = await findUserById(id);
    if (!user) {
        throw new Error("Failed to retrieve created user");
    }
    return user;
}
export async function findUserById(id) {
    const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [id]);
    const row = rows[0];
    return row ? mapUser(row) : null;
}
export async function findUserByEmail(email) {
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
    const row = rows[0];
    if (!row) {
        return null;
    }
    return {
        user: mapUser(row),
        passwordHash: row.password_hash
    };
}
export async function saveRefreshToken(userId, tokenHash, expiresAt) {
    await pool.execute(`INSERT INTO refresh_tokens
      (id, user_id, token_hash, expires_at)
     VALUES (?, ?, ?, ?)`, [randomUUID(), userId, tokenHash, expiresAt]);
}
export async function findRefreshToken(tokenHash) {
    const [rows] = await pool.execute(`SELECT *
     FROM refresh_tokens
     WHERE token_hash = ?
       AND revoked_at IS NULL
       AND expires_at > UTC_TIMESTAMP(3)`, [tokenHash]);
    return rows[0] ?? null;
}
export async function revokeRefreshToken(tokenHash) {
    const [result] = await pool.execute(`UPDATE refresh_tokens
     SET revoked_at = UTC_TIMESTAMP(3)
     WHERE token_hash = ?
       AND revoked_at IS NULL`, [tokenHash]);
    return result.affectedRows > 0;
}
export async function rotateRefreshToken(oldToken, expiresAt) {
    const oldHash = createHash("sha256")
        .update(oldToken)
        .digest("hex");
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [rows] = await connection.execute(`SELECT *
       FROM refresh_tokens
       WHERE token_hash = ?
       FOR UPDATE`, [oldHash]);
        const storedToken = rows[0];
        if (!storedToken ||
            storedToken.revoked_at !== null ||
            storedToken.expires_at.getTime() <= Date.now()) {
            await connection.rollback();
            return null;
        }
        const refreshToken = randomBytes(32).toString("hex");
        const newHash = createHash("sha256")
            .update(refreshToken)
            .digest("hex");
        await connection.execute(`UPDATE refresh_tokens
       SET revoked_at = UTC_TIMESTAMP(3)
       WHERE id = ?`, [storedToken.id]);
        await connection.execute(`INSERT INTO refresh_tokens
         (id, user_id, token_hash, expires_at)
       VALUES (?, ?, ?, ?)`, [
            randomUUID(),
            storedToken.user_id,
            newHash,
            expiresAt
        ]);
        await connection.commit();
        return {
            userId: storedToken.user_id,
            refreshToken
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
//# sourceMappingURL=auth.repository.js.map