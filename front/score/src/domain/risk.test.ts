import { describe, expect, it } from 'vitest';
import { getRiskBand } from './risk';

describe('getRiskBand', () => {
  it.each([
    [0, 'high'],
    [39, 'high'],
    [40, 'mid'],
    [69, 'mid'],
    [70, 'low'],
    [100, 'low'],
  ])('score %i -> %s', (score, level) => {
    expect(getRiskBand(score).level).toBe(level);
  });
});
