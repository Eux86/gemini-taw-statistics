import React from 'react';
import './style.css';
import { PerformanceByMonth } from '../../components/performance-history/performance-history';
import { LatestScores } from '../../components/latest-scores/latest-scores';

export interface IProps {

}

var monthsName = new Array();
monthsName[0] = "January";
monthsName[1] = "February";
monthsName[2] = "March";
monthsName[3] = "April";
monthsName[4] = "May";
monthsName[5] = "June";
monthsName[6] = "July";
monthsName[7] = "August";
monthsName[8] = "September";
monthsName[9] = "October";
monthsName[10] = "November";
monthsName[11] = "December";

export const HomePage: React.FunctionComponent<IProps> = (props) => {
  const today = new Date(Date.now());
  const month = today.getMonth();
  const year = today.getFullYear();

  return (
    <>
      <div className="header">
        <h1>=Gemini= <span className="text-accent">Statistics</span></h1>
      </div>
      <div className="main-container">
        <h2 className="centered">{monthsName[month]} - {year}</h2>
        <div className="site-section-heading">
          <h2>Performance history</h2>
        </div>
        <p>How Ground and Air kills compare between each other and the number of deaths.</p>
        <PerformanceByMonth month={month} year={year} />
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