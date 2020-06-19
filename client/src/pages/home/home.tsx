import React, { useContext } from 'react';
import { AvailableMonthsSelect } from '../../components/available-months-select/available-months-select';
import { AvailableServersSelect } from '../../components/available-servers-select/available-servers-select';
import { KillsList } from '../../components/kills-list/kills-list';
import { LatestScores } from '../../components/latest-scores/latest-scores';
import { PerformanceByMonth } from '../../components/performance-history/performance-history';
import { useLatestEvents } from '../../hooks/api/use-latest-events';
import './style.css';
import { SortieEvent } from 'gemini-statistics-api/build/enums/sortie-event';

export interface IProps {

}

export const HomePage: React.FunctionComponent<IProps> = (props) => {
  const [latestShotdown] = useLatestEvents(SortieEvent.ShotdownEnemy);
  const [latestEnemyShotdown] = useLatestEvents(SortieEvent.WasShotdown);
  return (
    <>
      <div className="header">
        <h1>=Gemini= <span className="text-accent">Statistics</span></h1>
        <div className="header-right">
          {/* empty for now */}
        </div>
      </div>
      <div className="main-container">
        <div>
          <AvailableMonthsSelect />
        </div>
        <div>
          <AvailableServersSelect />
        </div>
        <div className="site-section-heading">
          <h2>Monthly Activity</h2>
        </div>
        <p>Kills and Deaths from <span className="text-primary">WIP</span> to <span className="text-primary">WIP</span></p>
        <PerformanceByMonth />
        <div className="site-section-heading">
          <h2>Scores</h2>
        </div>
        <LatestScores />
        <div className="site-section-heading">
          <h2>Latest Events</h2>
        </div>
        {/* this should be its own component */}
        <div className="latest-events-container">
          <div>
            <h2>Shotdown</h2>
            <KillsList kills={latestShotdown} color="#00ffb0" />
          </div>
          <div>
            <h2>Enemy Shotdown</h2>
            <KillsList kills={latestEnemyShotdown} color="#da5737" />
          </div>
        </div>
      </div>
    </>
  )
}