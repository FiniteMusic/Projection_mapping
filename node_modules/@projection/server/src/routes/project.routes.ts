
import { Router } from "express";

import {
  createProjectRequestSchema,
  updateProjectRequestSchema
} from "@projection/shared";

import path from "node:path";

import {
  MEDIA_STORAGE_DIRECTORY,
  removeMediaFile
} from "../services/media.service.js";


import { requireAuth } from "../middleware/auth.middleware.js";

import {
  createProject,
  getProjectById,
  getProjectsByOwner,
  updateProject,
  deleteProject,
  getProjectMediaUrls
} from "../repositories/project.repository.js";

export const projectRouter = Router();

projectRouter.use(requireAuth);

projectRouter.post("/", async (req, res) => {
  const parsed = createProjectRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "VALIDATION_ERROR",
      details: parsed.error.flatten()
    });
    return;
  }

  const user = req.user!;

  const project = await createProject(
    user.id,
    parsed.data.name,
    parsed.data.description ?? null,
    parsed.data.settings ?? {
      canvas: { width: 1920, height: 1080 },
      backgroundColor: "#000000"
    }
  );

  res.status(201).json({ project });
});

projectRouter.get("/", async (req, res) => {
  const projects = await getProjectsByOwner(req.user!.id);
  res.status(200).json({ projects });
});

projectRouter.get("/:projectId", async (req, res) => {
  const project = await getProjectById(
    String(req.params.projectId)
  );

  if (!project || project.ownerId !== req.user!.id) {
    res.status(404).json({ error: "PROJECT_NOT_FOUND" });
    return;
  }

  res.status(200).json({ project });
});

projectRouter.patch("/:projectId", async (req, res) => {
  const parsed = updateProjectRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "VALIDATION_ERROR",
      details: parsed.error.flatten()
    });
    return;
  }

  const project = await updateProject(
    String(req.params.projectId),
    req.user!.id,
    parsed.data
  );

  if (!project) {
    res.status(404).json({ error: "PROJECT_NOT_FOUND" });
    return;
  }

  res.status(200).json({ project });
});






projectRouter.delete("/:projectId", async (req, res) => {
  const projectId = String(req.params.projectId);
  const userId = req.user!.id;

  const mediaUrls = await getProjectMediaUrls(
    projectId,
    userId
  );

  if (mediaUrls === null) {
    res.status(404).json({
      error: "PROJECT_NOT_FOUND"
    });
    return;
  }

  const deleted = await deleteProject(
    projectId,
    userId
  );

  if (!deleted) {
    res.status(404).json({
      error: "PROJECT_NOT_FOUND"
    });
    return;
  }

  for (const url of mediaUrls) {
    const fileName = path.basename(url);

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|mp4)$/.test(
        fileName
      )
    ) {
      console.error(
        "[PROJECT] Invalid media file name:",
        url
      );
      continue;
    }

    const filePath = path.join(
      MEDIA_STORAGE_DIRECTORY,
      fileName
    );

    try {
      await removeMediaFile(filePath);
    } catch (error) {
      console.error(
        "[PROJECT] Media cleanup failed:",
        filePath,
        error
      );
    }
  }

  res.status(204).send();
});

