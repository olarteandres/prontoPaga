import { createHash } from 'node:crypto';
import { cleanRut, formatRut, type ScoreResponse } from '@pronto/shared';

/**
 * Score deterministico: el mismo RUT siempre produce el mismo score (0-100),
 * independiente del formato en que venga (con/sin puntos o guion).
 */
export const computeScore = (rut: string): number => {
  const normalized = cleanRut(rut).replace(/^0+/, '');
  const hash = createHash('sha256').update(normalized).digest();
  return hash.readUInt32BE(0) % 101;
};

export const getScore = (rut: string, now: Date = new Date()): ScoreResponse => ({
  rut: formatRut(rut),
  score: computeScore(rut),
  fecha: now.toISOString().replace(/\.\d{3}Z$/, 'Z'),
});
