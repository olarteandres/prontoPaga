import type { ChangeEvent, FormEvent } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useLogin } from './useLogin.container';

const change = (value: string) => ({ target: { value } }) as ChangeEvent<HTMLInputElement>;
const submitEvent = () => ({ preventDefault: vi.fn() }) as unknown as FormEvent<HTMLFormElement>;

const mockFetch = (status: number, body: unknown) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(body), { status }));

afterEach(() => vi.restoreAllMocks());

describe('useLogin', () => {
  it('valida campos vacios sin llamar a la API', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { result } = renderHook(() => useLogin({ apiUrl: 'http://api', onLoginSuccess: vi.fn() }));

    await act(() => result.current.handleSubmit(submitEvent()));

    expect(result.current.fieldErrors).toEqual({ username: 'Ingresa tu usuario', password: 'Ingresa tu contraseña' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('entrega el token al host cuando el login es exitoso', async () => {
    mockFetch(200, { token: 'abc' });
    const onLoginSuccess = vi.fn();
    const { result } = renderHook(() => useLogin({ apiUrl: 'http://api', onLoginSuccess }));

    act(() => result.current.handleChange('username')(change('juan')));
    act(() => result.current.handleChange('password')(change('juan123')));
    await act(() => result.current.handleSubmit(submitEvent()));

    expect(onLoginSuccess).toHaveBeenCalledWith('abc');
  });

  it('muestra un mensaje claro ante credenciales invalidas', async () => {
    mockFetch(401, { error: { code: 'INVALID_CREDENTIALS', message: 'x' } });
    const onLoginSuccess = vi.fn();
    const { result } = renderHook(() => useLogin({ apiUrl: 'http://api', onLoginSuccess }));

    act(() => result.current.handleChange('username')(change('juan')));
    act(() => result.current.handleChange('password')(change('mala')));
    await act(() => result.current.handleSubmit(submitEvent()));

    await waitFor(() => expect(result.current.errorMessage).toMatch(/incorrectos/));
    expect(result.current.isSubmitting).toBe(false);
    expect(onLoginSuccess).not.toHaveBeenCalled();
  });
});
