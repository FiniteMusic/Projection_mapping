import type { MediaAsset } from "@projection/shared";
export declare function insertMedia(data: Pick<MediaAsset, "projectId" | "name" | "type" | "mimeType" | "url" | "sizeBytes" | "dimensions" | "durationSeconds" | "status">): Promise<MediaAsset>;
export declare function getMediaById(id: string): Promise<MediaAsset | null>;
export declare function getMediaForUser(mediaId: string, userId: string): Promise<MediaAsset | null>;
export declare function getMediaByProject(projectId: string): Promise<MediaAsset[]>;
export declare function renameMedia(mediaId: string, userId: string, name: string): Promise<MediaAsset | null>;
export declare function deleteMedia(mediaId: string, userId: string): Promise<boolean>;
export declare function getMediaFileForUser(fileName: string, userId: string): Promise<MediaAsset | null>;
export declare function getMediaFileForProject(fileName: string, projectId: string): Promise<MediaAsset | null>;
