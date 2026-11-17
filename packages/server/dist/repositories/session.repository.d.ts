import type { ProjectionSession } from "@projection/shared";
export declare function createSession(projectId: string): Promise<ProjectionSession>;
export declare function getSessionById(sessionId: string): Promise<ProjectionSession | null>;
export declare function getSessionForUser(sessionId: string, userId: string): Promise<ProjectionSession | null>;
export declare function endSession(sessionId: string, userId: string): Promise<ProjectionSession | null>;
export declare function updatePlayerConnectionStatus(sessionId: string, status: ProjectionSession["playerConnectionStatus"]): Promise<boolean>;
export declare function resetPlayerConnections(): Promise<number>;
export declare function getActiveSessionIdsByProject(projectId: string): Promise<string[]>;
