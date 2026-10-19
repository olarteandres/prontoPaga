import type { ChangeEvent, FormEvent } from 'react';
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ScoreAppProps } from '@pronto/shared';
import { useScoreQuery } from './useScoreQuery.container';

const change = (value: string) => ({ target: { value } }) as ChangeEvent<HTMLInputElement>;
const submitEvent = () => ({ preventDefault: vi.fn() }) as unknown as FormEvent<HTMLFormElement>;

const mockFetch = (status: number, body: unknown) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(body), { status }));

const userProps = (overrides: Partial<ScoreAppProps> = {}): ScoreAppProps => ({
  apiUrl: 'http://api',
  token: 't',
  user: { sub: 'u-002', role: 'user', rut: '12.345.678-5' },
  onUnauthorized: vi.fn(),
  ...overrides,
});

afterEach(() => vi.restoreAllMocks());

describe('useScoreQuery', () => {
  it('precarga el RUT propio cuando el rol es user', () => {
    const { result } = renderHook(() => useScoreQuery(userProps()));
    expect(result.current.rut).toBe('12.345.678-5');
    expect(result.current.isAdmin).toBe(false);
  });

  it('valida el RUT antes de llamar a la API', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { result } = renderHook(() => useScoreQuery(userProps()));

    act(() => result.current.handleRutChange(change('12.345.678-9')));
    await act(() => result.current.handleSubmit(submitEvent()));

    expect(result.current.fieldError).toMatch(/no es válido/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('muestra el score y su banda de riesgo', async () => {
    mockFetch(200, { rut: '12.345.678-5', score: 73, fecha: '2025-06-27T14:35:00Z' });
    const { result } = renderHook(() => useScoreQuery(userProps()));

    await act(() => result.current.handleSubmit(submitEvent()));

    expect(result.current.result?.score).toBe(73);
    expect(result.current.riskBand?.level).toBe('low');
  });

  it('explica el 403 cuando un user consulta otro RUT', async () => {
    mockFetch(403, { error: { code: 'FORBIDDEN', message: 'x' } });
    const { result } = renderHook(() => useScoreQuery(userProps()));

    act(() => result.current.handleRutChange(change('11.111.111-1')));
    await act(() => result.current.handleSubmit(submitEvent()));

    expect(result.current.errorMessage).toBe('Tu cuenta solo puede consultar el score del RUT 12.345.678-5.');
    expect(result.current.result).toBeNull();
  });

  it('avisa al host cuando el token expiro (401)', async () => {
    mockFetch(401, { error: { code: 'TOKEN_EXPIRED', message: 'x' } });
    const onUnauthorized = vi.fn();
    const { result } = renderHook(() => useScoreQuery(userProps({ onUnauthorized })));

    await act(() => result.current.handleSubmit(submitEvent()));

    expect(onUnauthorized).toHaveBeenCalledWith('Tu sesión expiró. Inicia sesión de nuevo.');
  });
});
