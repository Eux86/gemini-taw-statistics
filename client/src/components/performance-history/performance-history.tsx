import React, { FunctionComponent } from 'react';
import Chart from 'chart.js';
import { useScores } from '../../api/use-scores';

interface IProps {
}

interface IDeltaBuilderEntry {
  prevDate: string;
  prevValue: number;
  array: { [key: string]: number };
}

const deltaBuilder = (valuesObject: { [key: string]: number }): IDeltaBuilderEntry => {
  return Object.keys(valuesObject)?.reduce<IDeltaBuilderEntry>((prev, current) => {
    const currentValue = valuesObject[current]
    if (!prev.prevDate) {
      return {
        prevDate: current,
        prevValue: currentValue,
        array: { [current]: 0 },
      }
    }
    return {
      prevDate: current,
      prevValue: currentValue,
      array: { ...prev.array, [current]: Math.max(currentValue - prev.prevValue, 0) },
    }
  }, {} as IDeltaBuilderEntry);
}


export const PerformanceByMonth: FunctionComponent<IProps> = ({ }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [, setChart] = React.useState<Chart | undefined>(undefined);

  const [data] = useScores();
  const [totalAirKillsByDate, setTotalAirKillsByDate] = React.useState<{ [key: string]: number } | undefined>(undefined);
  const [totalGroundKillsByDate, setTotalGroundKillsByDate] = React.useState<{ [key: string]: number } | undefined>(undefined);
  const [totalDeathsByDate, setTotalDeathsByDate] = React.useState<{ [key: string]: number } | undefined>(undefined);

  React.useEffect(() => {
    if (!data) return;
    const totalAirKillsByDate = data.reduce((prev, current) => {
      prev[current.updateDate] = (prev[current.updateDate] || 0) + +current.airKills;
      return prev;
    }, {} as { [key: string]: number })
    const airKillsDeltasByDate = deltaBuilder(totalAirKillsByDate);
    setTotalAirKillsByDate(airKillsDeltasByDate.array);

    const totalGroundKillsByDate = data?.reduce((prev, current) => {
      prev[current.updateDate] = (prev[current.updateDate] || 0) + +current.groundKills;
      return prev;
    }, {} as { [key: string]: number })
    const groundKillsDeltasByDate = deltaBuilder(totalGroundKillsByDate);
    setTotalGroundKillsByDate(groundKillsDeltasByDate.array);

    const totalDeathsByDate = data?.reduce((prev, current) => {
      prev[current.updateDate] = (prev[current.updateDate] || 0) + +current.deaths;
      return prev;
    }, {} as { [key: string]: number })
    const deathsDeltasByDate = deltaBuilder(totalDeathsByDate);
    setTotalDeathsByDate(deathsDeltasByDate.array);
  }, [data]);
  console.log(totalAirKillsByDate);


  React.useEffect(() => {
    if (!canvasRef?.current) {
      return;
    }
    Chart.defaults.global.defaultFontColor = 'white';
    const newChart = new Chart(canvasRef.current, {
      type: 'bar',
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
            backgroundColor: '#54d400',
          },
          {
            label: 'Total Ground Kills',
            data: Object.values(totalGroundKillsByDate || {}),
            borderColor: '#f09b00',
            backgroundColor: '#f09b00',
          },
          {
            label: 'Total Deaths',
            data: Object.values(totalDeathsByDate || {}),
            borderColor: '#ca0000',
            backgroundColor: '#ca0000',
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