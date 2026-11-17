import type { Quad, Surface } from "@projection/shared";
type SurfaceChanges = {
    name?: string | undefined;
    corners?: Quad | undefined;
    mediaId?: string | null | undefined;
    visible?: boolean | undefined;
    zIndex?: number | undefined;
    opacity?: number | undefined;
};
export declare function projectBelongsToUser(projectId: string, userId: string): Promise<boolean>;
export declare function mediaBelongsToProject(mediaId: string, projectId: string): Promise<boolean>;
export declare function createSurface(projectId: string, data: {
    name: string;
    corners: Quad;
    mediaId: string | null;
    visible: boolean;
    zIndex: number;
    opacity: number;
}): Promise<Surface>;
export declare function getSurfaceById(id: string): Promise<Surface | null>;
export declare function getSurfacesByProject(projectId: string): Promise<Surface[]>;
export declare function getSurfaceForUser(surfaceId: string, userId: string): Promise<Surface | null>;
export declare function updateSurface(surfaceId: string, userId: string, changes: SurfaceChanges): Promise<Surface | null>;
export declare function deleteSurface(surfaceId: string, userId: string): Promise<boolean>;
export {};
