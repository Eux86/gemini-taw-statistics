import React from 'react';
import { ISortieEventInfoDto } from 'gemini-statistics-api/build/dtos/sortie-event-info.dto';
import { FiltersContext } from '../../data/filters-context';
import { SortieEvent } from 'gemini-statistics-api/build/enums/sortie-event';

export const useLatestEvents = (eventType: SortieEvent) => {
  const [data, setData] = React.useState<ISortieEventInfoDto[]>([]);
  const { state } = React.useContext(FiltersContext);
  
  React.useEffect(() => {
    const filters = [
      `type=${eventType}`,
    ]
    if (state.serverCode) {
      filters.push(`serverCode=${state.serverCode}`);
    }
    fetch(`/api/events?${filters.join('&')}`).then(async (response: Response) => {
      const events: ISortieEventInfoDto[] = await response.json();
      setData(events);
    });
  }, [state]);

  return [data];
}