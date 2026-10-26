
import type {
  UUID,
  ISODateString,
  Dimensions
} from "./common.types.js";

/**
 * Estado de un proyecto.
 *
 * draft: proyecto en preparación.
 * ready: proyecto configurado para proyectarse.
 * archived: proyecto archivado.
 */
export type ProjectStatus =
  | "draft"
  | "ready"
  | "archived";

/**
 * Configuración general del área de proyección.
 *
 * Las dimensiones se expresan en píxeles.
 * No representan necesariamente la resolución
 * física del proyector.
 */
export interface ProjectSettings {
  canvas: Dimensions;
  backgroundColor: string;
}

/**
 * Proyecto almacenado en la base de datos.
 *
 * Las superficies y recursos multimedia
 * se definirán mediante sus propios tipos.
 */
export interface Project {
  id: UUID;
  ownerId: UUID;

  name: string;
  description: string | null;

  status: ProjectStatus;
  settings: ProjectSettings;

  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/**
 * Solicitud para crear un proyecto.
 *
 * POST /api/projects
 *
 * El servidor obtiene ownerId del
 * usuario autenticado.
 */
export interface CreateProjectRequest {
  name: string;
  description?: string | null;
  settings?: ProjectSettings;
}

/**
 * Solicitud para actualizar un proyecto.
 *
 * PATCH /api/projects/:projectId
 *
 * Todos los campos son opcionales
 * porque se trata de una actualización parcial.
 */
export interface UpdateProjectRequest {
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
  settings?: ProjectSettings;
}

/**
 * Respuesta al consultar un proyecto.
 *
 * GET /api/projects/:projectId
 */
export interface ProjectResponse {
  project: Project;
}

/**
 * Respuesta al consultar la lista de proyectos.
 *
 * GET /api/projects
 */
export interface ProjectListResponse {
  projects: Project[];
}
