import { createApp } from './app';
import { env } from './config/env';

createApp().listen(env.port, () => {
  console.log(`API escuchando en http://localhost:${env.port}`);
});
