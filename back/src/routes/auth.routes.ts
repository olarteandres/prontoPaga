import { Router } from 'express';
import type { LoginRequest, LoginResponse } from '@pronto/shared';
import { login } from '../services/auth.service';

export const authRouter = Router();

authRouter.post<'/login', Record<string, never>, LoginResponse, LoginRequest>('/login', (req, res) => {
  res.json({ token: login(req.body) });
});
