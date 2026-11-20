
import {
  API_PREFIX,
  DEFAULT_PROJECTION_CANVAS,
  type Project
} from "@projection/shared";

const projectId: Project["id"] = "test-project-id";

console.log("[Mobile] Shared package:", {
  apiPrefix: API_PREFIX,
  canvas: DEFAULT_PROJECTION_CANVAS,
  projectId
});
