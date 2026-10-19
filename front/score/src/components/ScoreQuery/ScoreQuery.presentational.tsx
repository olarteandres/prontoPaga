import type { UseScoreQueryResult } from '../../hooks/useScoreQuery.container';
import { ScoreResult } from '../ScoreResult/ScoreResult.presentational';
import styles from './ScoreQuery.module.css';

export type ScoreQueryProps = UseScoreQueryResult;

/** Vista pura de la consulta: formulario, errores y resultado. */
export const ScoreQuery = ({
  rut,
  fieldError,
  errorMessage,
  result,
  riskBand,
  isLoading,
  isAdmin,
  ownRut,
  handleRutChange,
  handleRutBlur,
  handleSubmit,
}: ScoreQueryProps) => (
  <section className={styles.wrapper} aria-labelledby="score-title">
    <header className={styles.intro}>
      <h1 id="score-title" className={styles.title}>
        Consulta de score
      </h1>
      <p className={styles.scope}>
        {isAdmin ? 'Como administrador puedes consultar cualquier RUT.' : `Tu cuenta puede consultar el RUT ${ownRut ?? ''}.`}
      </p>
    </header>

    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="score-rut">RUT</label>
        <input
          id="score-rut"
          name="rut"
          inputMode="text"
          autoComplete="off"
          placeholder="12.345.678-5"
          value={rut}
          onChange={handleRutChange}
          onBlur={handleRutBlur}
          aria-invalid={Boolean(fieldError)}
          aria-describedby={fieldError ? 'score-rut-error' : undefined}
        />
      </div>
      <button className={styles.submit} type="submit" disabled={isLoading}>
        {isLoading ? 'Consultando…' : 'Consultar score'}
      </button>
      {fieldError && (
        <span id="score-rut-error" className={styles.fieldError}>
          {fieldError}
        </span>
      )}
    </form>

    {errorMessage && (
      <p className={styles.alert} role="alert">
        {errorMessage}
      </p>
    )}

    <div aria-live="polite">{result && riskBand && <ScoreResult result={result} riskBand={riskBand} />}</div>
  </section>
);
