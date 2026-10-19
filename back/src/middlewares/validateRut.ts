import type { RequestHandler } from 'express';
import { isValidRut } from '@pronto/shared';
import { AppError } from '../errors/AppError';

export const validateRutParam: RequestHandler<{ rut: string }> = (req, _res, next) => {
  if (!isValidRut(req.params.rut)) throw AppError.badRequest('El RUT ingresado no es valido');
  next();
};
