import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { RemoteBoundary } from '../../components/RemoteBoundary/RemoteBoundary';
import type { UseLoginPageResult } from './useLoginPage.container';
import styles from './LoginPage.module.css';

const LoginApp = lazy(() => import('login/LoginApp'));

export type LoginPageProps = UseLoginPageResult;

export const LoginPage = ({ isAuthenticated, notice, apiUrl, remoteUrl, handleLoginSuccess }: LoginPageProps) => {
  if (isAuthenticated) return <Navigate to="/score" replace />;

  return (
    <>
      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}
      <RemoteBoundary name="inicio de sesión" url={remoteUrl}>
        <LoginApp apiUrl={apiUrl} onLoginSuccess={handleLoginSuccess} />
      </RemoteBoundary>
    </>
  );
};
