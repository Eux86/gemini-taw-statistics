import React from 'react';
import Chart from 'chart.js';
import './App.css';
import { IPlayerScoresDto } from 'gemini-statistics-api/build/dtos/player-scores.dto';

function App() {
  const chartRef = React.useRef<HTMLCanvasElement>(null)

  const [data, setData] = React.useState<IPlayerScoresDto[] | null>(null);
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

  React.useEffect(() => {
    const totalAirKills = data?.reduce((prev, current) => prev + +current.airKills, 0)
    const totalDeaths = data?.reduce((prev, current) => prev + +current.deaths, 0)
    const totalGroundKills = data?.reduce((prev, current) => prev + +current.groundKills, 0)
    const totalSorties = data?.reduce((prev, current) => prev + +current.sorties, 0)
    const totalFlightTime = data?.reduce((prev, current) => prev + current.flightTimeMinutes, 0)
    setTotalAirKills(totalAirKills || 0);
    setTotalDeaths(totalDeaths || 0);
    setTotalGroundKills(totalGroundKills || 0);
    setTotalSorties(totalSorties || 0);
    setTotalFlightTime(totalFlightTime || 0);
  }, [data]);

  React.useEffect(() => {
    if (!chartRef || !chartRef.current) return;
    chartRef.current.height = 500;
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
      },
      options: {
        responsive: true,
      }
    });
  }, [chartRef, totalAirKills, totalDeaths, totalGroundKills]);

  return (
    <div className="App">
      <h1>Gemini Statistics</h1>
      <div className="graph-container">
        <canvas ref={chartRef} />
      </div>
      <div className="scores">
        <div className="score">
          <label>Air Kills per Hour</label>
          <p>{(totalAirKills / (totalFlightTime / 60)).toFixed(2)}</p>
        </div>
        <div className="score">
          <label>Ground Kills per Hour</label>
          <p>{(totalGroundKills / (totalFlightTime / 60)).toFixed(2)}</p>
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
