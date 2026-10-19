import { config } from '../../config';
import { useSessionContext } from '../../session/SessionContext';

export const useScorePage = () => {
  const { token, user, logout } = useSessionContext();

  return {
    session: token && user ? { token, user } : null,
    userLabel: user?.role === 'admin' ? 'Administrador' : `RUT ${user?.rut ?? ''}`,
    apiUrl: config.apiUrl,
    remoteUrl: config.scoreRemoteUrl,
    handleLogout: () => logout(),
    handleUnauthorized: (message: string) => logout(message),
  };
};

export type UseScorePageResult = ReturnType<typeof useScorePage>;
