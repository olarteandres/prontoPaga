import type { RequestHandler } from 'express';
import { AppError } from '../errors/AppError';
import { verifyToken } from '../services/auth.service';

/** Valida firma y expiracion del JWT enviado como "Authorization: Bearer <token>". */
export const authenticate: RequestHandler = (req, _res, next) => {
  const [scheme, token] = req.headers.authorization?.split(' ') ?? [];
  if (scheme !== 'Bearer' || !token) {
    throw AppError.unauthorized('Falta el token de autenticacion');
  }
  req.user = verifyToken(token);
  next();
};
