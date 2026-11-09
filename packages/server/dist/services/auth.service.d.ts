import type { AuthResponse, AuthTokens, User } from "@projection/shared";
export declare function register(name: string, email: string, password: string): Promise<AuthResponse>;
export declare function login(email: string, password: string): Promise<AuthResponse>;
export declare function verifyAccessToken(token: string): Promise<User | null>;
export declare function refresh(refreshToken: string): Promise<AuthTokens>;
export declare function logout(refreshToken: string): Promise<void>;
