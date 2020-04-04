import React from 'react';
import { IPlayerScoresDto } from 'gemini-statistics-api/build/dtos/player-scores.dto';
import { useScores } from './use-scores';

export const useLatestScores = () => {
  const [allScores] = useScores();
  const [data, setData] = React.useState<IPlayerScoresDto[] | undefined>(undefined);

  React.useEffect(() => {
    const latestDate = allScores?.reduce((prev: IPlayerScoresDto, current: IPlayerScoresDto) => new Date(prev.updateDate) > new Date(current.updateDate) ? prev : current, allScores[0])?.updateDate;
    const latestData = allScores?.filter((entry: IPlayerScoresDto) => entry.updateDate === latestDate);
    setData(latestData)
  }, [allScores]);

  return [data];
}