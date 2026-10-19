import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoginRoute } from './pages/LoginPage/LoginPage';
import { ScoreRoute } from './pages/ScorePage/ScorePage';
import { SessionProvider } from './session/SessionContext';

export const App = () => (
  <SessionProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/score" element={<ScoreRoute />} />
        <Route path="*" element={<Navigate to="/score" replace />} />
      </Routes>
    </BrowserRouter>
  </SessionProvider>
);
