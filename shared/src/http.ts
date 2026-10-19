import type { ApiErrorBody, ApiErrorCode } from './types';

export type ClientErrorCode = ApiErrorCode | 'NETWORK_ERROR';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ClientErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const isApiErrorBody = (body: unknown): body is ApiErrorBody =>
  typeof body === 'object' && body !== null && 'error' in body && typeof (body as ApiErrorBody).error?.code === 'string';

/** fetch tipado: devuelve el JSON como T o lanza ApiError con el codigo de la API. */
export const requestJson = async <T>(url: string, init: RequestInit = {}): Promise<T> => {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init.headers },
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'No se pudo conectar con el servidor');
  }

  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    if (isApiErrorBody(body)) throw new ApiError(res.status, body.error.code, body.error.message);
    throw new ApiError(res.status, 'INTERNAL_ERROR', `Error inesperado (${res.status})`);
  }
  return body as T;
};
