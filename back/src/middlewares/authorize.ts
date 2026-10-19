import type { RequestHandler } from 'express';
import { sameRut, type Role } from '@pronto/shared';
import { AppError } from '../errors/AppError';

export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) throw AppError.unauthorized();
    if (!roles.includes(req.user.role)) throw AppError.forbidden();
    next();
  };

/** admin: cualquier RUT. user: solo el RUT de su token. */
export const authorizeRutAccess: RequestHandler<{ rut: string }> = (req, _res, next) => {
  const user = req.user;
  if (!user) throw AppError.unauthorized();
  if (user.role === 'admin') return next();
  if (user.role === 'user' && user.rut && sameRut(user.rut, req.params.rut)) return next();
  throw AppError.forbidden('Solo puedes consultar tu propio RUT');
};
