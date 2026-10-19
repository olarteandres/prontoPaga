export type RiskLevel = 'high' | 'mid' | 'low';

export interface RiskBand {
  level: RiskLevel;
  label: string;
  min: number;
  max: number;
}

/** Score mas alto = mejor comportamiento crediticio = menor riesgo. */
export const RISK_BANDS: readonly RiskBand[] = [
  { level: 'high', label: 'Riesgo alto', min: 0, max: 39 },
  { level: 'mid', label: 'Riesgo medio', min: 40, max: 69 },
  { level: 'low', label: 'Riesgo bajo', min: 70, max: 100 },
];

export const getRiskBand = (score: number): RiskBand =>
  RISK_BANDS.find((band) => score >= band.min && score <= band.max) ?? RISK_BANDS[0]!;
