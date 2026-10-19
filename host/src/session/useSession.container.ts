import { useCallback, useEffect, useState } from 'react';
import type { JwtPayload } from '@pronto/shared';
import { decodeToken, isExpired } from './decodeToken';

const STORAGE_KEY = 'pronto.session.token';

interface Session {
  token: string;
  user: JwtPayload;
}

const readStoredSession = (): Session | null => {
  const token = sessionStorage.getItem(STORAGE_KEY);
  if (!token) return null;
  const user = decodeToken(token);
  if (!user || isExpired(user)) {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
  return { token, user };
};

/** Container de la sesion: el host es el unico dueno del token. */
export const useSession = () => {
  const [session, setSession] = useState<Session | null>(readStoredSession);
  const [notice, setNotice] = useState<string | null>(null);

  const logout = useCallback((message?: string) => {
    sessionStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setNotice(message ?? null);
  }, []);

  const login = useCallback((token: string): boolean => {
    const user = decodeToken(token);
    if (!user || isExpired(user)) {
      setNotice('Recibimos una sesión inválida. Intenta iniciar sesión de nuevo.');
      return false;
    }
    sessionStorage.setItem(STORAGE_KEY, token);
    setSession({ token, user });
    setNotice(null);
    return true;
  }, []);

  // Cierra la sesion automaticamente cuando el JWT expira.
  useEffect(() => {
    const exp = session?.user.exp;
    if (exp === undefined) return;
    const timeout = window.setTimeout(
      () => logout('Tu sesión expiró. Inicia sesión de nuevo.'),
      Math.max(exp * 1000 - Date.now(), 0),
    );
    return () => window.clearTimeout(timeout);
  }, [session, logout]);

  return {
    token: session?.token ?? null,
    user: session?.user ?? null,
    isAuthenticated: session !== null,
    notice,
    login,
    logout,
  };
};

export type SessionState = ReturnType<typeof useSession>;
