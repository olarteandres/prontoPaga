import { Router } from 'express';
import type { LoginRequest, LoginResponse } from '@pronto/shared';
import { AppError } from '../errors/AppError';
import { login } from '../services/auth.service';

export const authRouter = Router();

const isLoginRequest = (body: unknown): body is LoginRequest =>
  typeof body === 'object' &&
  body !== null &&
  typeof (body as LoginRequest).username === 'string' &&
  typeof (body as LoginRequest).password === 'string';

authRouter.post<'/login', Record<string, never>, LoginResponse>('/login', (req, res) => {
  const body: unknown = req.body;
  if (!isLoginRequest(body) || !body.username || !body.password) {
    throw AppError.badRequest('Debes enviar usuario y contrasena');
  }
  res.json({ token: login(body) });
});
