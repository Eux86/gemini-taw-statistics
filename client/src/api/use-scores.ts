import React from 'react';
import { IPlayerScoresDto } from 'gemini-statistics-api/build/dtos/player-scores.dto';
import { FiltersContext } from '../data/filters-context';

export const useScores = () => {
  const [data, setData] = React.useState<IPlayerScoresDto[] | undefined>(undefined);
  const { state } = React.useContext(FiltersContext);

  const today = new Date(Date.now());
  const month = today.getMonth();
  const year = today.getFullYear();

  React.useEffect(() => {
    fetch('/api/scores').then(async (response: Response) => {
      let monthScores: IPlayerScoresDto[] = await response.json();
      const monthDate = { mm: month, yyyy: year };
      if (monthDate) {
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