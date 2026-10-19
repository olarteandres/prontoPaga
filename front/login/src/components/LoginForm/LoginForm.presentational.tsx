import type { UseLoginResult } from '../../hooks/useLogin.container';
import styles from './LoginForm.module.css';

export type LoginFormProps = UseLoginResult;

/** Vista pura del login: solo pinta lo que le entrega useLogin. */
export const LoginForm = ({ values, fieldErrors, errorMessage, isSubmitting, handleChange, handleSubmit }: LoginFormProps) => (
  <div className={styles.screen}>
    <section className={styles.brand} aria-label="Consulta de Riesgo Financiero">
      <p className={styles.wordmark}>ProntoPaga</p>
      <h1 className={styles.title}>Consulta de Riesgo Financiero</h1>
      <p className={styles.lede}>Revisa el score crediticio de personas y empresas a partir de su RUT.</p>
    </section>

    <main className={styles.panel}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <h2 className={styles.heading}>Inicia sesión</h2>

        {errorMessage && (
          <p className={styles.alert} role="alert">
            {errorMessage}
          </p>
        )}

        <div className={styles.field}>
          <label htmlFor="login-username">Usuario</label>
          <input
            id="login-username"
            name="username"
            autoComplete="username"
            value={values.username}
            onChange={handleChange('username')}
            aria-invalid={Boolean(fieldErrors.username)}
            aria-describedby={fieldErrors.username ? 'login-username-error' : undefined}
          />
          {fieldErrors.username && (
            <span id="login-username-error" className={styles.fieldError}>
              {fieldErrors.username}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="login-password">Contraseña</label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={handleChange('password')}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
          />
          {fieldErrors.password && (
            <span id="login-password-error" className={styles.fieldError}>
              {fieldErrors.password}
            </span>
          )}
        </div>

        <button className={styles.submit} type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
        </button>

        <details className={styles.demo}>
          <summary>Cuentas de prueba</summary>
          <dl>
            <dt>Administrador</dt>
            <dd>admin / admin123</dd>
            <dt>Usuario con RUT 12.345.678-5</dt>
            <dd>juan / juan123</dd>
            <dt>Usuario con RUT 11.111.111-1</dt>
            <dd>maria / maria123</dd>
          </dl>
        </details>
      </form>
    </main>
  </div>
);
