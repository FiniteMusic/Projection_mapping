
import type {
  UUID,
  ISODateString
} from "./common.types.js";

/**
 * Usuario público del sistema.
 *
 * Nunca debe contener contraseñas,
 * hashes ni tokens de autenticación.
 */
export interface User {
  id: UUID;
  name: string;
  email: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/**
 * Datos necesarios para registrar
 * un nuevo usuario.
 *
 * POST /api/auth/register
 */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

/**
 * Credenciales para iniciar sesión.
 *
 * POST /api/auth/login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Tokens devueltos por el servidor.
 *
 * accessToken: utilizado para acceder
 * a rutas protegidas.
 *
 * refreshToken: utilizado para renovar
 * el accessToken cuando expire.
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
}

/**
 * Respuesta del servidor después
 * de un registro o inicio de sesión
 * exitoso.
 */
export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

/**
 * Respuesta de:
 *
 * GET /api/auth/me
 */
export interface CurrentUserResponse {
  user: User;
}

/**
 * Solicitud para renovar el
 * token de acceso.
 *
 * POST /api/auth/refresh
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Respuesta al renovar los tokens.
 *
 * El servidor podrá implementar
 * rotación de refresh tokens.
 */
export interface RefreshTokenResponse {
  tokens: AuthTokens;
}

/**
 * Solicitud para cerrar sesión.
 *
 * POST /api/auth/logout
 */
export interface LogoutRequest {
  refreshToken: string;
}
