import type { ProjectionSession } from "@projection/shared";
export declare function createProjectionSession(projectId: string, userId: string): Promise<ProjectionSession>;
export declare function getProjectionSession(sessionId: string, userId: string): Promise<ProjectionSession>;
export declare function endProjectionSession(sessionId: string, userId: string): Promise<ProjectionSession>;
