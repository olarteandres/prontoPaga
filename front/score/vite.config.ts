import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const PORT = 5002;

export default defineConfig({
  base: `http://localhost:${PORT}/`,
  server: { port: PORT, strictPort: true, origin: `http://localhost:${PORT}` },
  preview: { port: PORT, strictPort: true },
  plugins: [
    react(),
    federation({
      name: 'score',
      filename: 'remoteEntry.js',
      exposes: {
        './ScoreApp': './src/ScoreApp.tsx',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
      dts: false,
    }),
  ],
  build: { target: 'esnext' },
});
