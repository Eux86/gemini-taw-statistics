import { SortieEvent } from "../enums/sortie-event";

export interface IScoreByDateDto {
  date: string,
  score: number,
  eventType: SortieEvent,
}