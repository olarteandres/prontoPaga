import { requestJson, type LoginRequest, type LoginResponse } from '@pronto/shared';

export const loginRequest = (apiUrl: string, credentials: LoginRequest) =>
  requestJson<LoginResponse>(`${apiUrl}/login`, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
