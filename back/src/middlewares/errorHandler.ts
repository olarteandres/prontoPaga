import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { ApiErrorBody, ApiErrorCode } from '@pronto/shared';
import { AppError } from '../errors/AppError';

const sendError = (res: Parameters<ErrorRequestHandler>[2], status: number, code: ApiErrorCode, message: string) => {
  const body: ApiErrorBody = { error: { code, message } };
  res.status(status).json(body);
};

export const notFound: RequestHandler = (_req, _res, next) => {
  next(new AppError(404, 'NOT_FOUND', 'Recurso no encontrado'));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    sendError(res, err.status, err.code, err.message);
    return;
  }
  if (err instanceof SyntaxError && 'body' in err) {
    sendError(res, 400, 'BAD_REQUEST', 'JSON invalido');
    return;
  }
  console.error(err);
  sendError(res, 500, 'INTERNAL_ERROR', 'Error interno del servidor');
};
