import React from 'react';
import { SortieEvent } from 'gemini-statistics-api/build/enums/sortie-event';
import { IScoreByDateDto } from 'gemini-statistics-api/build/dtos/scores-by-date.dto';
import { FiltersContext } from '../../data/filters-context';

export const useScores = (eventType?: SortieEvent) => {
  const [data, setData] = React.useState<IScoreByDateDto[] | undefined>(undefined);
  const { state } = React.useContext(FiltersContext);

  // startDate?: Date;
  // endDate?: Date;
  // playerName?: string;
  // serverCode?: string;
  // eventType?: SortieEvent;
  const formatDate = (date: Date) => {
    try {
      return date.toISOString().split('T')[0];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return undefined;
    }
  };

  const filters = [];
  if (state.from) {
    filters.push(`startDate=${formatDate(state.from)}`);
  }
  if (state.to) {
    filters.push(`endDate=${formatDate(state.to)}`);
  }
  if (state.serverCode) {
    filters.push(`serverCode=${state.serverCode}`);
  }
  if (eventType) {
    filters.push(`eventType=${eventType}`);
  }
  if (state.playerName) {
    filters.push(`playerName=${state.playerName}`);
  }
  const filterString = filters.join('&');

  React.useEffect(() => {
    fetch(`/api/scores?${filterString}`).then(async (response: Response) => {
      const scores: IScoreByDateDto[] = await response.json();
      setData(scores);
    });
  }, [state, filterString]);

  return [data];
};
