import { describe, expect, it } from 'vitest';
import { cleanRut, computeDv, formatRut, isValidRut, sameRut } from './rut';

describe('rut', () => {
  it('limpia formato', () => {
    expect(cleanRut('12.345.678-5')).toBe('123456785');
    expect(cleanRut('9.999.999-k')).toBe('9999999K');
  });

  it('calcula digito verificador', () => {
    expect(computeDv('12345678')).toBe('5');
    expect(computeDv('11111111')).toBe('1');
  });

  it('valida RUTs', () => {
    expect(isValidRut('12.345.678-5')).toBe(true);
    expect(isValidRut('123456785')).toBe(true);
    expect(isValidRut('12.345.678-9')).toBe(false);
    expect(isValidRut('abc')).toBe(false);
    expect(isValidRut('')).toBe(false);
  });

  it('formatea RUTs', () => {
    expect(formatRut('123456785')).toBe('12.345.678-5');
    expect(formatRut('11111111-1')).toBe('11.111.111-1');
  });

  it('compara RUTs ignorando formato', () => {
    expect(sameRut('12.345.678-5', '123456785')).toBe(true);
    expect(sameRut('12.345.678-5', '11.111.111-1')).toBe(false);
  });
});
