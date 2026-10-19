import '@pronto/shared/tokens.css';
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { requestJson, type JwtPayload, type LoginResponse } from '@pronto/shared';
import ScoreApp from './ScoreApp';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const devUser = new URLSearchParams(location.search).get('as') ?? 'admin';

const decode = (token: string): JwtPayload => JSON.parse(atob(token.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/')));

/** Arnes para correr el microfront aislado: inicia sesion con un usuario mock (?as=juan). */
const Standalone = () => {
  const [token, setToken] = useState<string | null>(null);
  const [message, setMessage] = useState('Iniciando sesión de prueba…');

  useEffect(() => {
    requestJson<LoginResponse>(`${apiUrl}/login`, {
      method: 'POST',
      body: JSON.stringify({ username: devUser, password: `${devUser}123` }),
    })
      .then(({ token }) => setToken(token))
      .catch((err: Error) => setMessage(err.message));
  }, []);

  if (!token) return <p style={{ padding: 16 }}>{message}</p>;
  return <ScoreApp apiUrl={apiUrl} token={token} user={decode(token)} onUnauthorized={setMessage} />;
};

const root = document.getElementById('root');
if (!root) throw new Error('No se encontro #root');

createRoot(root).render(
  <StrictMode>
    <Standalone />
  </StrictMode>,
);
