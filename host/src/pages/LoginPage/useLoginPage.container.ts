import { useNavigate } from 'react-router-dom';
import { config } from '../../config';
import { useSessionContext } from '../../session/SessionContext';

export const useLoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, notice, login } = useSessionContext();

  const handleLoginSuccess = (token: string) => {
    if (login(token)) navigate('/score', { replace: true });
  };

  return {
    isAuthenticated,
    notice,
    apiUrl: config.apiUrl,
    remoteUrl: config.loginRemoteUrl,
    handleLoginSuccess,
  };
};

export type UseLoginPageResult = ReturnType<typeof useLoginPage>;
