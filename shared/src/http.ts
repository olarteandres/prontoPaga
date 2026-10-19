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

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const error = (body as ApiErrorBody | null)?.error;
    if (error) throw new ApiError(res.status, error.code, error.message);
    throw new ApiError(res.status, 'INTERNAL_ERROR', `Error inesperado (${res.status})`);
  }
  return body as T;
};
