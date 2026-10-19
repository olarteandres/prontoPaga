import type { JwtPayload } from './types';

/** Props del modulo expuesto `login/LoginApp`. */
export interface LoginAppProps {
  apiUrl: string;
  onLoginSuccess: (token: string) => void;
}

/** Props del modulo expuesto `score/ScoreApp`. */
export interface ScoreAppProps {
  apiUrl: string;
  token: string;
  user: JwtPayload;
  /** Se invoca cuando la API responde 401 (token invalido o expirado). */
  onUnauthorized: (message: string) => void;
}
