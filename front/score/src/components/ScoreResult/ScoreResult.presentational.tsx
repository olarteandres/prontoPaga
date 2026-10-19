import type { CSSProperties } from 'react';
import type { ScoreResponse } from '@pronto/shared';
import { RISK_BANDS, type RiskBand } from '../../domain/risk';
import styles from './ScoreResult.module.css';

export interface ScoreResultProps {
  result: ScoreResponse;
  riskBand: RiskBand;
}

const dateFormatter = new Intl.DateTimeFormat('es-CL', { dateStyle: 'long', timeStyle: 'short' });

/** Resultado: el score como cifra principal y su posicion sobre la escala de riesgo 0-100. */
export const ScoreResult = ({ result, riskBand }: ScoreResultProps) => (
  <article className={styles.result} data-level={riskBand.level} aria-label={`Score del RUT ${result.rut}`}>
    <div className={styles.headline}>
      <p className={styles.figure}>
        {result.score}
        <span className={styles.outOf}>/100</span>
      </p>
      <div className={styles.meta}>
        <p className={styles.band}>{riskBand.label}</p>
        <p className={styles.rut}>RUT {result.rut}</p>
        <p className={styles.date}>
          Consultado el <time dateTime={result.fecha}>{dateFormatter.format(new Date(result.fecha))}</time>
        </p>
      </div>
    </div>

    <div className={styles.scale}>
      <div className={styles.track} role="img" aria-label={`Score ${result.score} en una escala de 0 a 100`}>
        {RISK_BANDS.map((band) => (
          <span
            key={band.level}
            className={styles.segment}
            data-level={band.level}
            data-active={band.level === riskBand.level}
            style={{ flexGrow: band.max - band.min + 1 }}
          />
        ))}
        <span className={styles.marker} style={{ '--position': `${result.score}%` } as CSSProperties} />
      </div>
      <ol className={styles.legend}>
        {RISK_BANDS.map((band) => (
          <li key={band.level} style={{ flexGrow: band.max - band.min + 1 }}>
            <span className={styles.legendRange}>
              {band.min}–{band.max}
            </span>{' '}
            {band.label}
          </li>
        ))}
      </ol>
    </div>
  </article>
);
