import type { Dimensions, MediaType, SupportedMediaMimeType } from "@projection/shared";
export declare const MEDIA_STORAGE_DIRECTORY: string;
export declare class MediaValidationError extends Error {
    constructor(message: string);
}
export interface InspectedMedia {
    type: MediaType;
    mimeType: SupportedMediaMimeType;
    sizeBytes: number;
    dimensions: Dimensions;
    durationSeconds: number | null;
}
export declare function inspectMediaFile(filePath: string): Promise<InspectedMedia>;
export declare function storeMediaFile(temporaryPath: string, mimeType: SupportedMediaMimeType): Promise<{
    fileName: string;
    filePath: string;
    url: string;
}>;
export declare function removeMediaFile(filePath: string): Promise<void>;
