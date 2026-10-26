
export type {
  UUID,
  ISODateString,
  NormalizedCoordinate,
  Point,
  Quad,
  Dimensions,
  Timestamps
} from "./types/common.types.js";

export type {
  User,
  RegisterRequest,
  LoginRequest,
  AuthTokens,
  AuthResponse,
  CurrentUserResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest
} from "./types/auth.types.js";

export type {
  ProjectStatus,
  ProjectSettings,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectResponse,
  ProjectListResponse
} from "./types/project.types.js";

export type {
  Surface,
  CreateSurfaceRequest,
  UpdateSurfaceRequest,
  SurfaceResponse,
  SurfaceListResponse
} from "./types/surface.types.js";


export type {
  MediaType,
  SupportedMediaMimeType,
  MediaStatus,
  MediaAsset,
  UploadMediaFields,
  UpdateMediaRequest,
  MediaResponse,
  MediaListResponse
} from "./types/media.types.js";



export type {
  ProjectionSessionStatus,
  PlayerConnectionStatus,
  ProjectionSession,
  CreateSessionRequest,
  SessionResponse,
  PairSessionRequest,
  CreatePairingRequest,
  CreatePairingResponse,
  PairingStatusRequest,
  PairingStatus,
  PairingStatusResponse,
  PlayerCredentials,
  PairSessionResponse,
  SessionStatusResponse,
  EndSessionRequest,
  PendingPairing,
  PendingPairingStatus
} from "./types/session.types.js";



export type {
  ApiErrorCode,
  ValidationIssue,
  ApiError,
  ApiErrorResponse,
  PaginationQuery,
  PaginationMeta,
  PaginatedResponse,
  ApiSuccess,
  ApiFailure,
  ApiResult
} from "./types/api.types.js";


export type {
  SocketClientRole,
  SessionJoinPayload,
  SessionJoinResponse,
  SessionStatePayload,
  SceneLoadPayload,
  SurfaceCreatePayload,
  SurfaceUpdatePayload,
  SurfaceUpdatedPayload,
  SurfaceDeletePayload,
  MediaPlaybackTarget,
  MediaPlayPayload,
  MediaPausePayload,
  MediaSeekPayload,
  MediaPlaybackStatePayload,
  SocketErrorPayload,
  SocketAck,
  SocketOperationAccepted,
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
   SurfaceCalibrationChanges
} from "./types/socket.types.js";


export {
  userNameSchema,
  emailSchema,
  passwordSchema,
  registerRequestSchema,
  loginRequestSchema,
  refreshTokenRequestSchema,
  logoutRequestSchema
} from "./schemas/auth.schema.js";


export {
  projectNameSchema,
  projectDescriptionSchema,
  projectStatusSchema,
  canvasDimensionsSchema,
  backgroundColorSchema,
  projectSettingsSchema,
  DEFAULT_PROJECT_SETTINGS,
  createProjectRequestSchema,
  updateProjectRequestSchema
} from "./schemas/project.schema.js";


export {
  normalizedCoordinateSchema,
  pointSchema,
  isValidQuad,
  quadSchema,
  surfaceNameSchema,
  surfaceOpacitySchema,
  surfaceZIndexSchema,
  surfaceMediaIdSchema,
  DEFAULT_SURFACE_CORNERS,
  createSurfaceRequestSchema,
  updateSurfaceRequestSchema
} from "./schemas/surface.schema.js";


export {
  MEBIBYTE,
  MEDIA_LIMITS,
  mediaTypeSchema,
  supportedMediaMimeTypeSchema,
  mediaStatusSchema,
  mediaNameSchema,
  mediaDimensionsSchema,
  mediaSizeBytesSchema,
  mediaDurationSchema,
  isMediaMimeCompatible,
  mediaFileMetadataSchema,
  uploadMediaFieldsSchema,
  updateMediaRequestSchema
} from "./schemas/media.schema.js";



export {
  PAIRING_CONFIG,
  sessionUUIDSchema,
  projectionSessionStatusSchema,
  playerConnectionStatusSchema,
  pairingCodeSchema,
  createSessionRequestSchema,
  createPairingRequestSchema,
  createPairingResponseSchema,
  pairSessionRequestSchema,
  pairingStatusRequestSchema,
  pairingStatusResponseSchema,
  endSessionRequestSchema,
  playerTokenSchema,
  playerCredentialsSchema,
  sessionIdParamsSchema
} from "./schemas/session.schema.js";


export {
  API_PREFIX,
  API_VERSION,
  AUTH_ROUTES,
  PROJECT_ROUTES,
  SURFACE_ROUTES,
  MEDIA_ROUTES,
  SESSION_ROUTES,
  API_ROUTES,
  HTTP_METHOD,
  HTTP_STATUS,
  HTTP_HEADERS,
  CONTENT_TYPES,
  PAGINATION_DEFAULTS
} from "./constants/api.constants.js";


export {
  CLIENT_SOCKET_EVENTS,
  SERVER_SOCKET_EVENTS,
  SOCKET_EVENTS,
  SOCKET_CONFIG,
  SOCKET_ROOM_PREFIX,
  getSessionRoom
} from "./constants/socket-events.js";

export type {
  ClientSocketEventName,
  ServerSocketEventName
} from "./constants/socket-events.js";


export {
  DEFAULT_PROJECTION_CANVAS,
  DEFAULT_PROJECTION_CORNERS,
  NORMALIZED_COORDINATE_RANGE,
  QUAD_CORNER_INDEX,
  QUAD_CORNER_COUNT,
  PROJECTION_GEOMETRY,
  DEFAULT_PROJECTION_SURFACE,
  PROJECTION_LIMITS,
  PLAYER_RENDER_CONFIG,
  PLAYBACK_CONFIG,
  SURFACE_EDITOR_CONFIG,
  normalizedToPixels,
  pixelsToNormalized,
  clampNormalized
} from "./constants/projection.constants.js";
