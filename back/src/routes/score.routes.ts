import { Router } from 'express';
import type { ScoreResponse } from '@pronto/shared';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRutAccess } from '../middlewares/authorize';
import { validateRutParam } from '../middlewares/validateRut';
import { getScore } from '../services/score.service';

export const scoreRouter = Router();

scoreRouter.get<'/score/:rut', { rut: string }, ScoreResponse>(
  '/score/:rut',
  authenticate,
  validateRutParam,
  authorizeRutAccess,
  (req, res) => {
    res.json(getScore(req.params.rut));
  },
);
