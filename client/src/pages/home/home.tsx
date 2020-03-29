import React from 'react';
import './style.css';
import { PerformanceHistory } from '../../components/performance-history/performance-history';

export interface IProps {

}

export const HomePage: React.FunctionComponent<IProps> = (props) => {
  return (
    <div className="main-container">
      <h1>=Gemini= <span className="text-primary">Statistics</span></h1>
      <div className="site-section-heading">
        <h2>Performance history</h2>
      </div>
      <p>How Ground and Air kills compare between each other and the number of deaths.</p>
      <PerformanceHistory />
      <div className="site-section-heading">
        <h2>Scores</h2>
      </div>
      <p>WIP</p>
      <div className="site-section-heading">
        <h2>Personal Scores</h2>
      </div>
      <p>WIP</p>
    </div>
  )
}