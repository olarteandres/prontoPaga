// Tipos de los modulos remotos: el contrato vive en @pronto/shared.
declare module 'login/LoginApp' {
  import type { ComponentType } from 'react';
  import type { LoginAppProps } from '@pronto/shared';
  const LoginApp: ComponentType<LoginAppProps>;
  export default LoginApp;
}

declare module 'score/ScoreApp' {
  import type { ComponentType } from 'react';
  import type { ScoreAppProps } from '@pronto/shared';
  const ScoreApp: ComponentType<ScoreAppProps>;
  export default ScoreApp;
}
