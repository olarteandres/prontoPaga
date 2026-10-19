export const config = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  loginRemoteUrl: import.meta.env.VITE_LOGIN_REMOTE_URL ?? 'http://localhost:5001/remoteEntry.js',
  scoreRemoteUrl: import.meta.env.VITE_SCORE_REMOTE_URL ?? 'http://localhost:5002/remoteEntry.js',
} as const;
