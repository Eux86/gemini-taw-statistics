import React from 'react';
import { IPlayerScoresDto } from 'gemini-statistics-api/build/dtos/player-scores.dto';

export const useScoresByMonth = (mm: number, yyyy: number) => {
  const [data, setData] = React.useState<IPlayerScoresDto[] | undefined>(undefined);

  React.useEffect(() => {
    fetch('/api/scores').then(async (response: Response) => {
      const scores: IPlayerScoresDto[] = await response.json();
      const monthScores = scores.filter((score: IPlayerScoresDto) => {
        const date = new Date(score.updateDate);
        const year = date.getFullYear();
        const month = date.getMonth();
        return (year === yyyy && month === mm);
      });
      setData(monthScores);
    });
  }, []);

  return [data];
}