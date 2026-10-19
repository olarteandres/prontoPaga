import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { errorHandler, notFound } from './middlewares/errorHandler';
import { authRouter } from './routes/auth.routes';
import { scoreRouter } from './routes/score.routes';

export const createApp = () => {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: env.corsOrigins }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  app.use(authRouter);
  app.use(scoreRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
};
