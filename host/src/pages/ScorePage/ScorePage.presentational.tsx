import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { RemoteBoundary } from '../../components/RemoteBoundary/RemoteBoundary';
import type { UseScorePageResult } from './useScorePage.container';
import styles from './ScorePage.module.css';

const ScoreApp = lazy(() => import('score/ScoreApp'));

export type ScorePageProps = UseScorePageResult;

export const ScorePage = ({ session, userLabel, apiUrl, remoteUrl, handleLogout, handleUnauthorized }: ScorePageProps) => {
  if (!session) return <Navigate to="/login" replace />;

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <p className={styles.wordmark}>ProntoPaga</p>
        <div className={styles.account}>
          <span className={styles.user}>{userLabel}</span>
          <button className={styles.logout} type="button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>
      <main>
        <RemoteBoundary name="consulta de score" url={remoteUrl}>
          <ScoreApp apiUrl={apiUrl} token={session.token} user={session.user} onUnauthorized={handleUnauthorized} />
        </RemoteBoundary>
      </main>
    </div>
  );
};
