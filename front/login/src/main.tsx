import '@pronto/shared/tokens.css';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import LoginApp from './LoginApp';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/** Arnes para correr el microfront en forma aislada (sin host). */
const Standalone = () => {
  const [token, setToken] = useState<string | null>(null);
  if (token) return <pre style={{ padding: 16, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>Token: {token}</pre>;
  return <LoginApp apiUrl={apiUrl} onLoginSuccess={setToken} />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Standalone />
  </StrictMode>,
);
