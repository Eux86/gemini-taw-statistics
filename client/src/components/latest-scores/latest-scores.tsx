import { IScoreByDateDto } from 'gemini-statistics-api/build/dtos/scores-by-date.dto';
import { SortieEvent } from 'gemini-statistics-api/build/enums/sortie-event';
import React from 'react';
import { useScores } from '../../hooks/api/use-scores';
import { SingleScore } from '../single-score/single-score';
import './style.css';

export const LatestScores: React.FunctionComponent<{}> = () => {
  const [scores] = useScores();
  const [totalAirKills, setTotalAirKills] = React.useState(0);
  const [totalDeaths, setTotalDeaths] = React.useState(0);
  const [totalGroundKills, setTotalGroundKills] = React.useState(0);
  const [totalSorties, setTotalSorties] = React.useState(0);

  const getScoresSum = (scores: IScoreByDateDto[], type: SortieEvent) => scores?.filter(score => score.eventType === type).reduce((prev, current) => prev + +current.score, 0);
  React.useEffect(() => {
    if (!scores) return;
    const totalAirKills = getScoresSum(scores, SortieEvent.ShotdownEnemy);
    const totalDeaths = getScoresSum(scores, SortieEvent.WasShotdown);
    const totalGroundKills = getScoresSum(scores, SortieEvent.DestroyedGroundTarget);
    const totalSorties = scores.filter(score => score.eventType === SortieEvent.TakeOff).length;
    setTotalAirKills(totalAirKills || 0);
    setTotalDeaths(totalDeaths || 0);
    setTotalGroundKills(totalGroundKills || 0);
    setTotalSorties(totalSorties || 0);
  }, [scores]);
  
  return (
    <div className="scores">
      <SingleScore title="Total Air Kills" value={totalAirKills + ''} />
      <SingleScore title="Total Ground Kills" value={totalGroundKills + ''} />
      <SingleScore title="Total Deaths" value={totalDeaths + ''} />
      <SingleScore title="Number of sorties" value={Math.ceil(totalSorties) + ''} />
    </div>
  )
}