import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

const required = (name: string, devFallback: string): string => {
  const value = process.env[name];
  if (value) return value;
  if (isProduction) throw new Error(`Falta la variable de entorno ${name}`);
  return devFallback;
};

export const env = {
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: required('JWT_SECRET', 'dev-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5000,http://localhost:5001,http://localhost:5002')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
} as const;
