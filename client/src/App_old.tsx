import React from 'react';
import Chart from 'chart.js';
import './App.css';
import { IPlayerScoresDto } from 'gemini-statistics-api/build/dtos/player-scores.dto';

function App_OLD() {
  const chartRef = React.useRef<HTMLCanvasElement>(null);
  const historyChartRef = React.useRef<HTMLCanvasElement>(null);

  const [data, setData] = React.useState<IPlayerScoresDto[] | null>(null);
  const [latestUpdateDate, setLatestUpdateDate] = React.useState<Date | undefined>(new Date(0));
  const [totalAirKills, setTotalAirKills] = React.useState(0);
  const [totalDeaths, setTotalDeaths] = React.useState(0);
  const [totalGroundKills, setTotalGroundKills] = React.useState(0);
  const [totalSorties, setTotalSorties] = React.useState(0);
  const [totalFlightTime, setTotalFlightTime] = React.useState(0);

  const getList = async () => {
    const response = await fetch('/api/scores');
    const list = await response.json();
    setData(list);
  }

  React.useEffect(() => {
    getList();
  }, []);

  React.useEffect(() => {
    const latestDate = data?.map(x => x.updateDate).reduce((prev: Date, current?: string) => (!current || (prev > new Date(current))) ? prev : new Date(current), new Date(0));
    setLatestUpdateDate(latestDate ? new Date(latestDate) : undefined);
  }, [data]);

  React.useEffect(() => {
    const latesData = data?.filter((score: IPlayerScoresDto) => new Date(score.updateDate || 0).getTime() === latestUpdateDate?.getTime());
    console.log(latesData);
    const totalAirKills = latesData?.reduce((prev, current) => prev + +current.airKills, 0)
    const totalDeaths = latesData?.reduce((prev, current) => prev + +current.deaths, 0)
    const totalGroundKills = latesData?.reduce((prev, current) => prev + +current.groundKills, 0)
    const totalSorties = latesData?.reduce((prev, current) => prev + +current.sorties, 0)
    const totalFlightTime = latesData?.reduce((prev, current) => prev + current.flightTimeMinutes, 0)
    setTotalAirKills(totalAirKills || 0);
    setTotalDeaths(totalDeaths || 0);
    setTotalGroundKills(totalGroundKills || 0);
    setTotalSorties(totalSorties || 0);
    setTotalFlightTime(totalFlightTime || 0);
  }, [data, latestUpdateDate]);

  React.useEffect(() => {
    if (!chartRef || !chartRef.current) return;
    chartRef.current.height = 500;

    const totalAirKillsByDate = data?.reduce((prev, current) => {
      prev[current.updateDate] = (prev[current.updateDate] || 0) + +current.airKills;
      return prev;
    }, {} as { [key: string]: number })

    const totalGroundKillsByDate = data?.reduce((prev, current) => {
      prev[current.updateDate] = (prev[current.updateDate] || 0) + +current.groundKills;
      return prev;
    }, {} as { [key: string]: number })

    const totalDeathsByDate = data?.reduce((prev, current) => {
      prev[current.updateDate] = (prev[current.updateDate] || 0) + +current.deaths;
      return prev;
    }, {} as { [key: string]: number })

    new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: Object.keys(totalAirKillsByDate || {}),
        datasets: [
          {
            label: 'Total Air Kills',
            data: Object.values(totalAirKillsByDate || {}),
            borderColor: '#552211'
          },
          {
            label: 'Total Ground Kills',
            data: Object.values(totalGroundKillsByDate || {}),
            borderColor: '#112255'
          },
          {
            label: 'Total Deaths',
            data: Object.values(totalDeathsByDate || {}),
            borderColor: '#990000'
          }
        ]
      },
    });
  }, [chartRef, totalAirKills, totalDeaths, totalGroundKills]);

  React.useEffect(() => {
    if (!historyChartRef || !historyChartRef.current) return;
    
    if (!data) return;

    const totalAirKillsByDate = data.reduce((prev, current) => {
      prev[current.updateDate] = (prev[current.updateDate] || 0) + +current.airKills;
      return prev;
    }, {} as { [key: string]: number })

    const totalGroundKillsByDate = data.reduce((prev, current) => {
      prev[current.updateDate] = (prev[current.updateDate] || 0) + +current.groundKills;
      return prev;
    }, {} as { [key: string]: number })

    const totalDeathsByDate = data.reduce((prev, current) => {
      prev[current.updateDate] = (prev[current.updateDate] || 0) + +current.deaths;
      return prev;
    }, {} as { [key: string]: number })

    new Chart(historyChartRef.current, {
      type: 'line',
      data: {
        labels: Object.keys(totalAirKillsByDate),
        datasets: [
          {
            label: 'Air Kills',
            data: Object.values(totalAirKillsByDate),
            backgroundColor: '#552211'
          },
          {
            label: 'Ground Kills',
            data: Object.values(totalGroundKillsByDate),
            backgroundColor: '#112255'
          },
          {
            label: 'Deaths',
            data: Object.values(totalDeathsByDate),
            backgroundColor: '#990000'
          }
        ]
      },
      options: {
        responsive: true,
        // scales: {
        //   xAxes: [{
        //     stacked: true
        //   }],
        //   yAxes: [{
        //     stacked: true
        //   }]
        // }
      }
    });
  }, [historyChartRef, totalAirKills, totalDeaths, totalGroundKills]);

  return (
    <div className="App">
      <h1>Gemini Statistics</h1>
      <h4>Latest update: {latestUpdateDate?.toLocaleDateString()}</h4>
      <div className="graph-container">
        <canvas ref={chartRef} />
        {/* <canvas ref={historyChartRef} height="500" /> */}
      </div>
      <div className="scores">
        <div className="score">
          <label>Total Air Kills</label>
          <p>{totalAirKills}</p>
        </div>
        <div className="score">
          <label>Total Deaths</label>
          <p>{totalDeaths}</p>
        </div>
        <div className="score">
          <label>Total Ground Kills</label>
          <p>{totalGroundKills}</p>
        </div>
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

export default App_OLD;
