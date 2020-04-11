import React from 'react';
import { ISortieEventInfoDto } from 'gemini-statistics-api/build/dtos/sortie-event-info.dto';
import { FiltersContext } from '../data/filters-context';

export const useLatestKills = () => {
  const [data, setData] = React.useState<ISortieEventInfoDto[]>([]);
  const { state } = React.useContext(FiltersContext);
  
  React.useEffect(() => {
    fetch('/api/sorties/latestKills').then(async (response: Response) => {
      const events: ISortieEventInfoDto[] = await response.json();
      const filtered = events.filter((event: ISortieEventInfoDto) => !state.serverCode || event.serverCode === state.serverCode);
      setData(filtered);
    });
  }, [state]);

  return [data];
}