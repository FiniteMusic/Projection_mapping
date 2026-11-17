
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import {
  mkdir,
  open,
  rename,
  rm,
  stat
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";
import ffprobe from "ffprobe-static";

import {
  MEDIA_LIMITS,
  mediaFileMetadataSchema
} from "@projection/shared";

import type {
  Dimensions,
  MediaType,
  SupportedMediaMimeType
} from "@projection/shared";

const serviceDirectory = path.dirname(
  fileURLToPath(import.meta.url)
);

export const MEDIA_STORAGE_DIRECTORY = path.resolve(
  serviceDirectory,
  "../../storage/media"
);

const MIME_EXTENSIONS: Record<
  SupportedMediaMimeType,
  string
> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "video/mp4": ".mp4"
};

export class MediaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaValidationError";
  }
}

export interface InspectedMedia {
  type: MediaType;
  mimeType: SupportedMediaMimeType;
  sizeBytes: number;
  dimensions: Dimensions;
  durationSeconds: number | null;
}

async function readFileHeader(
  filePath: string,
  length = 16
): Promise<Buffer> {
  const file = await open(filePath, "r");

  try {
    const buffer = Buffer.alloc(length);

    const { bytesRead } = await file.read(
      buffer,
      0,
      length,
      0
    );

    return buffer.subarray(0, bytesRead);
  } finally {
    await file.close();
  }
}

function detectMimeType(
  header: Buffer
): SupportedMediaMimeType | null {
  if (
    header.length >= 3 &&
    header.subarray(0, 3).equals(
      Buffer.from([0xff, 0xd8, 0xff])
    )
  ) {
    return "image/jpeg";
  }

  if (
    header.length >= 8 &&
    header.subarray(0, 8).equals(
      Buffer.from([
        0x89, 0x50, 0x4e, 0x47,
        0x0d, 0x0a, 0x1a, 0x0a
      ])
    )
  ) {
    return "image/png";
  }

  if (
    header.length >= 12 &&
    header.toString("ascii", 0, 4) === "RIFF" &&
    header.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  if (
    header.length >= 12 &&
    header.toString("ascii", 4, 8) === "ftyp"
  ) {
    return "video/mp4";
  }

  return null;
}

interface ProbeResult {
  streams?: Array<{
    codec_type?: string;
    codec_name?: string;
    width?: number;
    height?: number;
  }>;
  format?: {
    duration?: string;
  };
}

async function inspectVideo(
  filePath: string
): Promise<{
  dimensions: Dimensions;
  durationSeconds: number;
}> {
  const executable = ffprobe.path;

  if (!executable) {
    throw new Error("FFprobe executable not available");
  }

  const output = await new Promise<string>(
    (resolve, reject) => {
      const child = spawn(executable, [
        "-v", "error",
        "-show_entries",
        "stream=codec_type,codec_name,width,height:format=duration",
        "-of", "json",
        filePath
      ]);

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", chunk => {
        stdout += chunk.toString();
      });

      child.stderr.on("data", chunk => {
        stderr += chunk.toString();
      });

      child.on("error", reject);

      child.on("close", code => {
        if (code !== 0) {
          reject(new MediaValidationError(
            `FFprobe rejected video: ${stderr}`
          ));
          return;
        }

        resolve(stdout);
      });
    }
  );

  let result: ProbeResult;

  try {
    result = JSON.parse(output) as ProbeResult;
  } catch {
    throw new MediaValidationError(
      "Invalid FFprobe output"
    );
  }

  const videoStream = result.streams?.find(
    stream => stream.codec_type === "video"
  );

  if (
    !videoStream ||
    videoStream.codec_name !== "h264" ||
    !videoStream.width ||
    !videoStream.height
  ) {
    throw new MediaValidationError(
      "Only H.264 MP4 videos are supported"
    );
  }

  const durationSeconds = Number(
    result.format?.duration
  );

  if (
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= 0
  ) {
    throw new MediaValidationError(
      "Video duration could not be determined"
    );
  }

  return {
    dimensions: {
      width: videoStream.width,
      height: videoStream.height
    },
    durationSeconds
  };
}

export async function inspectMediaFile(
  filePath: string
): Promise<InspectedMedia> {
  const fileStats = await stat(filePath);

  if (
    fileStats.size <= 0 ||
    fileStats.size > MEDIA_LIMITS.videoMaxBytes
  ) {
    throw new MediaValidationError(
      "Invalid file size"
    );
  }

  const header = await readFileHeader(filePath);
const mimeType = detectMimeType(header);

  if (!mimeType) {
    throw new MediaValidationError(
      "Unsupported file format"
    );
  }

  const type: MediaType =
    mimeType === "video/mp4" ? "video" : "image";

  let dimensions: Dimensions;
  let durationSeconds: number | null = null;

  if (type === "image") {
    if (fileStats.size > MEDIA_LIMITS.imageMaxBytes) {
      throw new MediaValidationError(
        "Image exceeds maximum size"
      );
    }

    let metadata;

    try {
      metadata = await sharp(filePath).metadata();
    } catch {
      throw new MediaValidationError(
        "Invalid or corrupted image"
      );
    }

    if (!metadata.width || !metadata.height) {
      throw new MediaValidationError(
        "Image dimensions unavailable"
      );
    }

    dimensions = {
      width: metadata.width,
      height: metadata.height
    };
  } else {
    const video = await inspectVideo(filePath);
    dimensions = video.dimensions;
    durationSeconds = video.durationSeconds;
  }

  const inspected: InspectedMedia = {
    type,
    mimeType,
    sizeBytes: fileStats.size,
    dimensions,
    durationSeconds
  };

  const validation = mediaFileMetadataSchema.safeParse(
    inspected
  );

  if (!validation.success) {
    throw new MediaValidationError(
      validation.error.issues
        .map(issue => issue.message)
        .join("; ")
    );
  }

  return inspected;
}

export async function storeMediaFile(
  temporaryPath: string,
  mimeType: SupportedMediaMimeType
): Promise<{
  fileName: string;
  filePath: string;
  url: string;
}> {
  await mkdir(MEDIA_STORAGE_DIRECTORY, {
    recursive: true
  });

  const fileName =
    randomUUID() + MIME_EXTENSIONS[mimeType];

  const filePath = path.join(
    MEDIA_STORAGE_DIRECTORY,
    fileName
  );

  await rename(temporaryPath, filePath);

  return {
    fileName,
    filePath,
    url: `/api/media/files/${fileName}`
  };
}

export async function removeMediaFile(
  filePath: string
): Promise<void> {
  await rm(filePath, { force: true });
}
