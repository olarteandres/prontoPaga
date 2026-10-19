import type { JwtPayload } from '@pronto/shared';

const isJwtPayload = (value: unknown): value is JwtPayload => {
  if (typeof value !== 'object' || value === null) return false;
  const { sub, role, rut } = value as Record<string, unknown>;
  return typeof sub === 'string' && (role === 'admin' || role === 'user') && (rut === undefined || typeof rut === 'string');
};

/**
 * Lee el payload del JWT solo para la UI (rol, RUT, expiracion).
 * La firma la valida siempre el back; aqui no se confia en el token para autorizar nada.
 */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    const payload: unknown = JSON.parse(json);
    return isJwtPayload(payload) ? payload : null;
  } catch {
    return null;
  }
};

export const isExpired = (payload: JwtPayload, now = Date.now()): boolean =>
  payload.exp !== undefined && payload.exp * 1000 <= now;
