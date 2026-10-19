export type Role = 'admin' | 'user';

export interface JwtPayload {
  sub: string;
  role: Role;
  /** Solo presente cuando role === 'user'. */
  rut?: string;
  iat?: number;
  exp?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface ScoreResponse {
  rut: string;
  score: number;
  fecha: string;
}

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHORIZED'
  | 'TOKEN_EXPIRED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR';

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
  };
}
