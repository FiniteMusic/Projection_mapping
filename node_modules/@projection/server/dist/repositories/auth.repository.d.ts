import type { RowDataPacket } from "mysql2";
import type { User } from "@projection/shared";
interface RefreshTokenRow extends RowDataPacket {
    id: string;
    user_id: string;
    token_hash: string;
    expires_at: Date;
    revoked_at: Date | null;
}
export declare function createUser(name: string, email: string, passwordHash: string): Promise<User>;
export declare function findUserById(id: string): Promise<User | null>;
export declare function findUserByEmail(email: string): Promise<{
    user: User;
    passwordHash: string;
} | null>;
export declare function saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;
export declare function findRefreshToken(tokenHash: string): Promise<RefreshTokenRow | null>;
export declare function revokeRefreshToken(tokenHash: string): Promise<boolean>;
export declare function rotateRefreshToken(oldToken: string, expiresAt: Date): Promise<{
    userId: string;
    refreshToken: string;
} | null>;
export {};
