import type { ScoreAppProps } from '@pronto/shared';
import { ScoreQuery } from './components/ScoreQuery/ScoreQuery.presentational';
import { useScoreQuery } from './hooks/useScoreQuery.container';

/** Modulo expuesto via Module Federation: une el container (hook) con la vista. */
const ScoreApp = (props: ScoreAppProps) => <ScoreQuery {...useScoreQuery(props)} />;

export default ScoreApp;
