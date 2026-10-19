import { cleanRut, requestJson, type ScoreResponse } from '@pronto/shared';

export const getScoreRequest = (apiUrl: string, token: string, rut: string) =>
  requestJson<ScoreResponse>(`${apiUrl}/score/${encodeURIComponent(cleanRut(rut))}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
