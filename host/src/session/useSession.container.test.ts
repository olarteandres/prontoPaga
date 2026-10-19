import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { decodeToken } from './decodeToken';
import { useSession } from './useSession.container';

const b64url = (value: object) => btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fakeToken = (payload: object) => `${b64url({ alg: 'HS256' })}.${b64url(payload)}.firma`;
const inSeconds = (s: number) => Math.floor(Date.now() / 1000) + s;

beforeEach(() => sessionStorage.clear());
afterEach(() => vi.useRealTimers());

describe('decodeToken', () => {
  it('lee un payload valido', () => {
    expect(decodeToken(fakeToken({ sub: 'u-002', role: 'user', rut: '12.345.678-5' }))).toMatchObject({ role: 'user' });
  });

  it('descarta tokens mal formados o con rol desconocido', () => {
    expect(decodeToken('basura')).toBeNull();
    expect(decodeToken(fakeToken({ sub: 'x', role: 'root' }))).toBeNull();
  });
});

describe('useSession', () => {
  it('inicia sesion y persiste el token en sessionStorage', () => {
    const { result } = renderHook(() => useSession());
    const token = fakeToken({ sub: 'u-001', role: 'admin', exp: inSeconds(3600) });

    act(() => {
      result.current.login(token);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.role).toBe('admin');
    expect(sessionStorage.getItem('pronto.session.token')).toBe(token);
  });

  it('rechaza un token expirado', () => {
    const { result } = renderHook(() => useSession());
    let accepted = true;
    act(() => {
      accepted = result.current.login(fakeToken({ sub: 'u-001', role: 'admin', exp: inSeconds(-10) }));
    });
    expect(accepted).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('cierra la sesion automaticamente al expirar el token', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useSession());

    act(() => {
      result.current.login(fakeToken({ sub: 'u-001', role: 'admin', exp: inSeconds(60) }));
    });
    act(() => {
      vi.advanceTimersByTime(61_000);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.notice).toBe('Tu sesión expiró. Inicia sesión de nuevo.');
  });

  it('logout con mensaje deja el aviso para la pantalla de login', () => {
    const { result } = renderHook(() => useSession());
    act(() => {
      result.current.login(fakeToken({ sub: 'u-001', role: 'admin', exp: inSeconds(3600) }));
    });
    act(() => result.current.logout('Tu sesión no es válida. Inicia sesión de nuevo.'));

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.notice).toMatch(/no es válida/);
    expect(sessionStorage.getItem('pronto.session.token')).toBeNull();
  });
});
