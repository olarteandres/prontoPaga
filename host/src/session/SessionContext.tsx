import { createContext, useContext, type ReactNode } from 'react';
import { useSession, type SessionState } from './useSession.container';

const SessionContext = createContext<SessionState | null>(null);

export const SessionProvider = ({ children }: { children: ReactNode }) => (
  <SessionContext.Provider value={useSession()}>{children}</SessionContext.Provider>
);

export const useSessionContext = (): SessionState => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSessionContext debe usarse dentro de <SessionProvider>');
  return ctx;
};
