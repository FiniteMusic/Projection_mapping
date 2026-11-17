export declare function createPlayerToken(sessionId: string): Promise<{
    playerToken: string;
    expiresAt: string;
}>;
export declare function verifyPlayerToken(token: string): Promise<string | null>;
export declare function createPlayerTokenAt(sessionId: string, issuedAt: Date): Promise<{
    playerToken: string;
    expiresAt: string;
}>;
