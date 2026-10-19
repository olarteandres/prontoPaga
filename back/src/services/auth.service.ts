import jwt, { type SignOptions } from 'jsonwebtoken';
import type { JwtPayload, LoginRequest } from '@pronto/shared';
import { env } from '../config/env';
import { MOCK_USERS } from '../config/users';
import { AppError } from '../errors/AppError';

export const login = ({ username, password }: LoginRequest): string => {
  const user = MOCK_USERS.find((u) => u.username === username && u.password === password);
  if (!user) throw new AppError(401, 'INVALID_CREDENTIALS', 'Usuario o contrasena incorrectos');

  const payload: JwtPayload = {
    sub: user.id,
    role: user.role,
    ...(user.role === 'user' && user.rut ? { rut: user.rut } : {}),
  };

  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    if (typeof decoded === 'string' || !decoded.sub || !('role' in decoded)) {
      throw AppError.unauthorized('Token invalido');
    }
    return decoded as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError(401, 'TOKEN_EXPIRED', 'La sesion expiro, vuelve a iniciar sesion');
    }
    if (err instanceof AppError) throw err;
    throw AppError.unauthorized('Token invalido');
  }
};
