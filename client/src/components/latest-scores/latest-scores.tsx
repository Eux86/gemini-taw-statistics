import React from 'react';
import { useLatestScores } from '../../api/use-latest-scores';
import { SingleScore } from '../single-score/single-score';
import './style.css';

export const LatestScores: React.FunctionComponent<{}> = () => {
  const [latestData] = useLatestScores();
  const [totalAirKills, setTotalAirKills] = React.useState(0);
  const [totalDeaths, setTotalDeaths] = React.useState(0);
  const [totalGroundKills, setTotalGroundKills] = React.useState(0);
  const [totalSorties, setTotalSorties] = React.useState(0);
  const [totalFlightTime, setTotalFlightTime] = React.useState(0);
  React.useEffect(() => {
    const totalAirKills = latestData?.reduce((prev, current) => prev + +current.airKills, 0)
    const totalDeaths = latestData?.reduce((prev, current) => prev + +current.deaths, 0)
    const totalGroundKills = latestData?.reduce((prev, current) => prev + +current.groundKills, 0)
    const totalSorties = latestData?.reduce((prev, current) => prev + +current.sorties, 0)
    const totalFlightTime = latestData?.reduce((prev, current) => prev + current.flightTimeMinutes, 0)
    setTotalAirKills(totalAirKills || 0);
    setTotalDeaths(totalDeaths || 0);
    setTotalGroundKills(totalGroundKills || 0);
    setTotalSorties(totalSorties || 0);
    setTotalFlightTime(totalFlightTime || 0);
  }, [latestData]);
  return (
    <div className="scores">
      <SingleScore title="Total Air Kills" value={totalAirKills + ''} />
      <SingleScore title="Total Ground Kills" value={totalGroundKills + ''} />
      <SingleScore title="Total Deaths" value={totalDeaths + ''} />
      <SingleScore title="Sorties" value={totalSorties + ''} />
      <SingleScore title="Flown Hours" value={(totalFlightTime / 60).toFixed(2) + ''} />
    </div>
  )
}