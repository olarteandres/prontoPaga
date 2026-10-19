import { ScorePage } from './ScorePage.presentational';
import { useScorePage } from './useScorePage.container';

export const ScoreRoute = () => <ScorePage {...useScorePage()} />;
