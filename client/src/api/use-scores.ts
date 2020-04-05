import React from 'react';
import { IPlayerScoresDto } from 'gemini-statistics-api/build/dtos/player-scores.dto';
import { FiltersContext } from '../data/filters-context';

export const useScores = () => {
  const [data, setData] = React.useState<IPlayerScoresDto[] | undefined>(undefined);
  const { state } = React.useContext(FiltersContext);

  React.useEffect(() => {
    fetch('/api/scores').then(async (response: Response) => {
      let monthScores: IPlayerScoresDto[] = await response.json();
      if (state.month) {
        const month = +state.month.split('-')[0];
        const year = +state.month.split('-')[1];
        const monthDate = { mm: month, yyyy: year };
        monthScores = monthScores.filter((score: IPlayerScoresDto) => {
          const date = new Date(score.updateDate);
          const year = date.getFullYear();
          const month = date.getMonth();
          return (year === monthDate.yyyy && month === monthDate.mm);
        });
      }
      if (state.serverCode) {
        monthScores = monthScores.filter((score: IPlayerScoresDto) => {
          return (score.serverCode === state.serverCode);
        });
      }
      setData(monthScores);
    });
  }, [state]);

  return [data];
}