import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const PORT = 5000;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const remote = (name: string, entry: string) => ({
    type: 'module',
    name,
    entry,
    entryGlobalName: name,
    shareScope: 'default',
  });

  return {
    server: { port: PORT, strictPort: true, origin: `http://localhost:${PORT}` },
    preview: { port: PORT, strictPort: true },
    plugins: [
      react(),
      federation({
        name: 'host',
        remotes: {
          login: remote('login', env.VITE_LOGIN_REMOTE_URL ?? 'http://localhost:5001/remoteEntry.js'),
          score: remote('score', env.VITE_SCORE_REMOTE_URL ?? 'http://localhost:5002/remoteEntry.js'),
        },
        shared: {
          react: { singleton: true },
          'react-dom': { singleton: true },
        },
        dts: false,
      }),
    ],
    build: { target: 'esnext' },
  };
});
