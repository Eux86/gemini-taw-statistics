import React from 'react';
import { IPlayerScoresDto } from 'gemini-statistics-api/build/dtos/player-scores.dto';

export const useLatestScores = () => {
  const [data, setData] = React.useState<IPlayerScoresDto[] | undefined>(undefined);
  
  React.useEffect(() => {
    fetch('/api/scores/latest').then(async (response: Response) => {
      const scores: IPlayerScoresDto[] = await response.json();
      setData(scores);
    });
  }, []);

  return [data];
}