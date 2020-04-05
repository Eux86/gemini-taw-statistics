import React from 'react';
import './style.css';
import { PerformanceByMonth } from '../../components/performance-history/performance-history';
import { LatestScores } from '../../components/latest-scores/latest-scores';
import { AvailableMonthsSelect } from '../../components/available-months-select/available-months-select';
import { AvailableServersSelect } from '../../components/available-servers-select/available-servers-select';

export interface IProps {

}

// const monthsName = new Array();
// monthsName[0] = "January";
// monthsName[1] = "February";
// monthsName[2] = "March";
// monthsName[3] = "April";
// monthsName[4] = "May";
// monthsName[5] = "June";
// monthsName[6] = "July";
// monthsName[7] = "August";
// monthsName[8] = "September";
// monthsName[9] = "October";
// monthsName[10] = "November";
// monthsName[11] = "December";

export const HomePage: React.FunctionComponent<IProps> = (props) => {

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
          <h2>Performance history</h2>
        </div>
        <p>Comparison among the trends of Air Kills, Ground Kills and Deths</p>
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