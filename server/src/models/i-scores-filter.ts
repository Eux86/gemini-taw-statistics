import { SortieEvent } from "../enums/sortie-event";

export interface IScoresFilter {
  startDate?: Date;
  endDate?: Date;
  playerName?: string;
  serverCode?: string;
  eventType?: SortieEvent;
}