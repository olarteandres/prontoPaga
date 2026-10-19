import { LoginPage } from './LoginPage.presentational';
import { useLoginPage } from './useLoginPage.container';

export const LoginRoute = () => <LoginPage {...useLoginPage()} />;
