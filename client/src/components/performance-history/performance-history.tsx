import React, { FunctionComponent } from 'react';
import Chart from 'chart.js';
import { useScores } from '../../api/use-scores';

export const PerformanceHistory: FunctionComponent<{}> = (props) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [chart, setChart] = React.useState<Chart | undefined>(undefined);

  const [data] = useScores();
  const [totalAirKillsByDate, setTotalAirKillsByDate] = React.useState<{ [key: string]: number } | undefined>(undefined);
  const [totalGroundKillsByDate, setTotalGroundKillsByDate] = React.useState<{ [key: string]: number } | undefined>(undefined);
  const [totalDeathsByDate, setTotalDeathsByDate] = React.useState<{ [key: string]: number } | undefined>(undefined);

  React.useEffect(() => {
    const totalAirKillsByDate = data?.reduce((prev, current) => {
      prev[current.updateDate] = (prev[current.updateDate] || 0) + +current.airKills;
      return prev;
    }, {} as { [key: string]: number })
    setTotalAirKillsByDate(totalAirKillsByDate);

    const totalGroundKillsByDate = data?.reduce((prev, current) => {
      prev[current.updateDate] = (prev[current.updateDate] || 0) + +current.groundKills;
      return prev;
    }, {} as { [key: string]: number })
    setTotalGroundKillsByDate(totalGroundKillsByDate);

    const totalDeathsByDate = data?.reduce((prev, current) => {
      prev[current.updateDate] = (prev[current.updateDate] || 0) + +current.deaths;
      return prev;
    }, {} as { [key: string]: number })
    setTotalDeathsByDate(totalDeathsByDate);
    console.log('deaths', totalDeathsByDate);
  }, [data]);

  React.useEffect(() => {
    if (!canvasRef?.current) {
      return;
    }
    Chart.defaults.global.defaultFontColor = 'white';
    const newChart = new Chart(canvasRef.current, {
      type: 'line',
      options: {
        responsive: true,
        maintainAspectRatio: false
      },
      data: {
        labels: Object.keys(totalAirKillsByDate || {}).map(formatDate),
        datasets: [
          {
            label: 'Total Air Kills',
            data: Object.values(totalAirKillsByDate || {}),
            borderColor: '#54d400',
            backgroundColor: 'rgba(0, 0, 0, 0.0)',
          },
          {
            label: 'Total Ground Kills',
            data: Object.values(totalGroundKillsByDate || {}),
            borderColor: '#f09b00',
            backgroundColor: 'rgba(0, 0, 0, 0.0)',
          },
          {
            label: 'Total Deaths',
            data: Object.values(totalDeathsByDate || {}),
            borderColor: '#ca0000',
            backgroundColor: 'rgba(0, 0, 0, 0.0)',
          }
        ]
      },
    });
    setChart(newChart);
  }, [canvasRef, totalAirKillsByDate, totalGroundKillsByDate, totalDeathsByDate]);

  const formatDate = (dateString: string) => {
    const month = new Date(dateString).getUTCMonth() + 1;
    const day = new Date(dateString).getDate();
    return `${day > 9 ? day : '0' + day}/${month > 9 ? month : '0' + month}`;
  }

  return (
    <div style={{ height: '300px' }}>
      <canvas ref={canvasRef} />
    </div>
  )
}