import type { ApiErrorCode } from '@pronto/shared';

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }

  static badRequest(message: string) {
    return new AppError(400, 'BAD_REQUEST', message);
  }

  static unauthorized(message = 'No autenticado') {
    return new AppError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'No tienes permisos para realizar esta accion') {
    return new AppError(403, 'FORBIDDEN', message);
  }
}
