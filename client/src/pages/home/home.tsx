import React, { useContext } from 'react';
import './style.css';
import { PerformanceByMonth } from '../../components/performance-history/performance-history';
import { LatestScores } from '../../components/latest-scores/latest-scores';
import { AvailableMonthsSelect } from '../../components/available-months-select/available-months-select';
import { AvailableServersSelect } from '../../components/available-servers-select/available-servers-select';
import { FiltersContext } from '../../data/filters-context';
import { getMonthNameByIndex } from '../../utilities';

export interface IProps {

}

export const HomePage: React.FunctionComponent<IProps> = (props) => {
  const { state } = useContext(FiltersContext);
  const selectedMonthName = state.month ? state.month === 'all' ? 'every month' : getMonthNameByIndex(+state.month.split('-')[0]) : '';
  const selectedYear = state.month?.split('-')[1]
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
        <p>Kills and Deaths during <span className="text-primary">{selectedMonthName} {selectedYear}</span></p>
        <PerformanceByMonth />
        <div className="site-section-heading">
          <h2>Scores</h2>
        </div>
        <LatestScores />
        <div className="site-section-heading">
          <h2>Personal Scores</h2>
        </div>
        <p>WIP</p>
      </div>
    </>
  )
}