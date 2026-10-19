import type { LoginAppProps } from '@pronto/shared';
import { LoginForm } from './components/LoginForm/LoginForm.presentational';
import { useLogin } from './hooks/useLogin.container';

/** Modulo expuesto via Module Federation: une el container (hook) con la vista. */
const LoginApp = (props: LoginAppProps) => <LoginForm {...useLogin(props)} />;

export default LoginApp;
