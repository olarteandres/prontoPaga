import type { JwtPayload } from '@pronto/shared';

/**
 * Lee el payload del JWT solo para la UI (rol, RUT, expiracion).
 * La firma la valida siempre el back; aqui no se confia en el token para autorizar nada.
 */
export const decodeToken = (token: string): JwtPayload =>
  JSON.parse(atob(token.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/')));

export const isExpired = (payload: JwtPayload, now = Date.now()): boolean =>
  payload.exp !== undefined && payload.exp * 1000 <= now;
