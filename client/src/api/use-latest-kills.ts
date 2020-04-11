import React from 'react';
import { IPlayerKillInfoDto } from 'gemini-statistics-api/build/dtos/player-kill-info.dto';

export const useLatestKills = () => {
  const [data, setData] = React.useState<IPlayerKillInfoDto[]>([]);
  
  React.useEffect(() => {
    fetch('/api/sorties/latestKills').then(async (response: Response) => {
      const scores: IPlayerKillInfoDto[] = await response.json();
      setData(scores);
    });
  }, []);

  return [data];
}