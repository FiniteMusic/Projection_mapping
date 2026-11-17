import type { Project, ProjectSettings, ProjectStatus } from "@projection/shared";
export declare function createProject(ownerId: string, name: string, description: string | null, settings: ProjectSettings): Promise<Project>;
export declare function getProjectById(id: string): Promise<Project | null>;
export declare function getProjectForUser(projectId: string, userId: string): Promise<Project | null>;
export declare function getProjectsByOwner(ownerId: string): Promise<Project[]>;
export declare function updateProject(id: string, ownerId: string, changes: {
    name?: string | undefined;
    description?: string | null | undefined;
    status?: ProjectStatus | undefined;
    settings?: ProjectSettings | undefined;
}): Promise<Project | null>;
export declare function getProjectMediaUrls(projectId: string, ownerId: string): Promise<string[] | null>;
export declare function deleteProject(id: string, ownerId: string): Promise<boolean>;
