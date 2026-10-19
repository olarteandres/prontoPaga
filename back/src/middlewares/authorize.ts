import type { RequestHandler } from 'express';
import { sameRut } from '@pronto/shared';
import { AppError } from '../errors/AppError';

/** admin: cualquier RUT. user: solo el RUT de su token. */
export const authorizeRutAccess: RequestHandler<{ rut: string }> = (req, _res, next) => {
  const user = req.user!;
  if (user.role === 'admin') return next();
  if (user.rut && sameRut(user.rut, req.params.rut)) return next();
  throw AppError.forbidden('Solo puedes consultar tu propio RUT');
};
