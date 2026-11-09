import { createHash, randomBytes } from "node:crypto";
import argon2 from "argon2";
import { SignJWT, jwtVerify } from "jose";
import { createUser, findUserByEmail, findUserById, saveRefreshToken, revokeRefreshToken, rotateRefreshToken } from "../repositories/auth.repository.js";
const ACCESS_TOKEN_SECONDS = 15 * 60;
const REFRESH_TOKEN_DAYS = 7;
function getJwtSecret() {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error("JWT_ACCESS_SECRET must contain at least 32 characters");
    }
    return new TextEncoder().encode(secret);
}
function hashToken(token) {
    return createHash("sha256")
        .update(token)
        .digest("hex");
}
async function createAccessToken(user) {
    return new SignJWT({})
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setSubject(user.id)
        .setIssuedAt()
        .setExpirationTime(`${ACCESS_TOKEN_SECONDS}s`)
        .sign(getJwtSecret());
}
async function issueTokens(user) {
    const accessToken = await createAccessToken(user);
    const refreshToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
    await saveRefreshToken(user.id, hashToken(refreshToken), expiresAt);
    return {
        accessToken,
        refreshToken,
        tokenType: "Bearer",
        expiresIn: ACCESS_TOKEN_SECONDS
    };
}
export async function register(name, email, password) {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        throw new Error("EMAIL_ALREADY_REGISTERED");
    }
    const passwordHash = await argon2.hash(password);
    const user = await createUser(name, email, passwordHash);
    return {
        user,
        tokens: await issueTokens(user)
    };
}
export async function login(email, password) {
    const record = await findUserByEmail(email);
    if (!record) {
        throw new Error("INVALID_CREDENTIALS");
    }
    const validPassword = await argon2.verify(record.passwordHash, password);
    if (!validPassword) {
        throw new Error("INVALID_CREDENTIALS");
    }
    return {
        user: record.user,
        tokens: await issueTokens(record.user)
    };
}
export async function verifyAccessToken(token) {
    try {
        const { payload } = await jwtVerify(token, getJwtSecret(), { algorithms: ["HS256"] });
        if (typeof payload.sub !== "string") {
            return null;
        }
        return await findUserById(payload.sub);
    }
    catch {
        return null;
    }
}
export async function refresh(refreshToken) {
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
    const rotated = await rotateRefreshToken(refreshToken, expiresAt);
    if (!rotated) {
        throw new Error("INVALID_REFRESH_TOKEN");
    }
    const user = await findUserById(rotated.userId);
    if (!user) {
        throw new Error("INVALID_REFRESH_TOKEN");
    }
    return {
        accessToken: await createAccessToken(user),
        refreshToken: rotated.refreshToken,
        tokenType: "Bearer",
        expiresIn: ACCESS_TOKEN_SECONDS
    };
}
export async function logout(refreshToken) {
    await revokeRefreshToken(hashToken(refreshToken));
}
//# sourceMappingURL=auth.service.js.map