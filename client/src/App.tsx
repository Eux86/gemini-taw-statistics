import React from 'react';
import Chart from 'chart.js';
import './App.css';
import { IScoresTaw } from './models/scores-taw';

function App() {
  const chartRef = React.useRef<HTMLCanvasElement>(null)

  const [data, setData] = React.useState<IScoresTaw[] | null>(null);
  const [totalAirKills, setTotalAirKills] = React.useState(0);
  const [totalDeaths, setTotalDeaths] = React.useState(0);
  const [totalGroundKills, setTotalGroundKills] = React.useState(0);
  const [totalSorties, setTotalSorties] = React.useState(0);
  const [totalFlightTime, setTotalFlightTime] = React.useState(0);

  const getList = async () => {
    const response = await fetch('/api/taw');
    const list = await response.json();
    setData(list);
  }

  React.useEffect(() => {
    getList();
  }, []);

  const parseTimeToMinutes = (timeString: string): number => {
    const hoursMatcher = timeString.match(/(\d*)h.*/);
    const minutesMatcher = timeString.match(/(\d*)m.*/);
    const hours = hoursMatcher ? +hoursMatcher[1] : 0;
    const minutes = minutesMatcher ? +minutesMatcher[1] : 0;
    return (hours * 60) + minutes;
  }

  React.useEffect(() => {
    const totalAirKills = data?.reduce((prev, current) => prev + +current.airKills, 0)
    const totalDeaths = data?.reduce((prev, current) => prev + +current.deaths, 0)
    const totalGroundKills = data?.reduce((prev, current) => prev + +current.groundKills, 0)
    const totalSorties = data?.reduce((prev, current) => prev + +current.sorties, 0)
    const totalFlightTime = data?.reduce((prev, current) => prev + parseTimeToMinutes(current.flightTime), 0)
    setTotalAirKills(totalAirKills || 0);
    setTotalDeaths(totalDeaths || 0);
    setTotalGroundKills(totalGroundKills || 0);
    setTotalSorties(totalSorties || 0);
    setTotalFlightTime(totalFlightTime || 0);
  }, [data]);

  React.useEffect(() => {
    if (!chartRef || !chartRef.current) return;
    const labels = ['Air Kills', 'Deaths', 'Ground Kills'];
    new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Current Scores',
          data: [totalAirKills, totalDeaths, totalGroundKills],
          backgroundColor: '#112233'
        }]
      }
    });
  }, [chartRef, totalAirKills, totalDeaths, totalGroundKills]);

  return (
    <div className="App">
      <h1>Gemini Statistics</h1>
      <canvas ref={chartRef} />
      <div className="scores">
      <div className="score">
          <label>Air Kills per Hour</label>
          <p>{(totalAirKills/(totalFlightTime/60)).toFixed(2)}</p>
        </div>
        <div className="score">
          <label>Ground Kills per Hour</label>
          <p>{(totalGroundKills/(totalFlightTime/60)).toFixed(2)}</p>
        </div>
        <div className="score">
          <label>Sorties</label>
          <p>{totalSorties}</p>
        </div>
        <div className="score">
          <label>Flight Time (hours)</label>
          <p>{(totalFlightTime / 60).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
