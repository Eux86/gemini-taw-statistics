import { SortieEvent } from "../enums/sortie-event";

export interface IScoreByDate {
  date: string,
  score: number,
  eventType: SortieEvent,
}