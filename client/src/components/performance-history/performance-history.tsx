import React, { FunctionComponent } from 'react';
import Chart from 'chart.js';
import { SortieEvent } from 'gemini-statistics-api/build/enums/sortie-event';
import { IScoreByDateDto } from 'gemini-statistics-api/build/dtos/scores-by-date.dto';
import { useScores } from '../../hooks/api/use-scores';
import { FiltersContext } from '../../data/filters-context';

interface IProps {
}

export const PerformanceByMonth: FunctionComponent<IProps> = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [, setChart] = React.useState<Chart | undefined>(undefined);
  const { state } = React.useContext(FiltersContext);
  const [timeline, setTimeline] = React.useState<Date[]>();

  const [data] = useScores();
  const [totalAirKillsByDate, setTotalAirKillsByDate] = React.useState<IScoreByDateDto[] | undefined>(undefined);
  const [totalGroundKillsByDate, setTotalGroundKillsByDate] = React.useState<IScoreByDateDto[] | undefined>(undefined);
  const [totalDeathsByDate, setTotalDeathsByDate] = React.useState<IScoreByDateDto[] | undefined>(undefined);

  // Get Scores by event
  React.useEffect(() => {
    if (!data) return;
    const totalAirKillsByDateInt = data.filter((score) => score.eventType === SortieEvent.ShotdownEnemy);
    const totalGroundKillsByDateInt = data.filter((score) => score.eventType === SortieEvent.DestroyedGroundTarget);
    const totalDeathsByDateInt = data.filter((score) => score.eventType === SortieEvent.WasShotdown);
    setTotalAirKillsByDate(totalAirKillsByDateInt);
    setTotalGroundKillsByDate(totalGroundKillsByDateInt);
    setTotalDeathsByDate(totalDeathsByDateInt);
  }, [data]);

  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${day > 9 ? day : `0${day}`}/${month > 9 ? month : `0${month}`}`;
  };

  const isSameDay = (date1: Date, date2: Date) => date1.getDate() === date2.getDate()
    && date1.getMonth() === date2.getMonth()
    && date1.getFullYear() === date2.getFullYear();

  // Generate all dates for selected period
  React.useEffect(() => {
    if (!state.from || !state.to) {
      return;
    }
    let currentDate = state.from;
    const dates: Date[] = [];
    let counter = 0;
    while (currentDate <= state.to && counter < 90) {
      dates.push(currentDate);
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + 1);
      currentDate = nextDate;
      counter += 1;
    }
    setTimeline(dates);
  }, [state]);

  const spreadScoresOnTimeline = React.useCallback((scores: IScoreByDateDto[]) =>
    // eslint-disable-next-line implicit-arrow-linebreak
    timeline && timeline.map((currentDate) => scores?.find((score) => isSameDay(new Date(score.date), currentDate))?.score),
  [timeline]);

  React.useEffect(() => {
    if (!canvasRef?.current) {
      return;
    }
    Chart.defaults.global.defaultFontColor = 'white';
    const newChart = new Chart(canvasRef.current, {
      type: 'bar',
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
            },
          }],
        },
      },
      data: {
        labels: timeline?.map(formatDate),
        datasets: [
          {
            label: 'Total Air Kills',
            data: totalAirKillsByDate && spreadScoresOnTimeline(totalAirKillsByDate),
            borderColor: '#54d400',
            backgroundColor: '#54d400',
          },
          {
            label: 'Total Ground Kills',
            data: totalGroundKillsByDate && spreadScoresOnTimeline(totalGroundKillsByDate),
            borderColor: '#f09b00',
            backgroundColor: '#f09b00',
          },
          {
            label: 'Total Deaths',
            data: totalDeathsByDate && spreadScoresOnTimeline(totalDeathsByDate),
            borderColor: '#ca0000',
            backgroundColor: '#ca0000',
          },
        ],
      },
    });
    setChart(newChart);
    // eslint-disable-next-line consistent-return
    return (() => {
      newChart.destroy();
    });
  }, [
    canvasRef,
    totalAirKillsByDate,
    totalGroundKillsByDate,
    totalDeathsByDate,
    spreadScoresOnTimeline,
    timeline,
  ]);

  return (
    <div style={{ height: '300px' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};
