import React from 'react';
import { IPlayerScoresDto } from 'gemini-statistics-api/build/dtos/player-scores.dto';
import { SortieEvent } from 'gemini-statistics-api/build/enums/sortie-event';
import { FiltersContext } from '../../data/filters-context';
import { IScoreByDateDto } from 'gemini-statistics-api/build/dtos/scores-by-date.dto';

export const useScores = (eventType?: SortieEvent) => {
  const [data, setData] = React.useState<IScoreByDateDto[] | undefined>(undefined);
  const { state } = React.useContext(FiltersContext);

  // startDate?: Date;
  // endDate?: Date;
  // playerName?: string;
  // serverCode?: string;
  // eventType?: SortieEvent;
  const formatDate = (date:Date) => date.toISOString().split('T')[0]
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
  const filterString = filters.join('&');

  React.useEffect(() => {
    fetch(`/api/scores?${filterString}`).then(async (response: Response) => {
      let scores: IScoreByDateDto[] = await response.json();
      setData(scores);
    });
  }, [state, filterString]);

  return [data];
}