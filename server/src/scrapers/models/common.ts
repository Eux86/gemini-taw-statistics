import { SortieEvent } from "../../business-models/sortie-event";

export interface ISortie {
  hash: number;
  playerName: string;
  sortieDate: string;
  aircraft: string;
  takeOffAt: string;
  landedAt?: string;
  ditched?: string;
  events: ISortieEvent[];
}

export interface ISortieEvent {
  sortieHash: number;
  date: string;
  event: SortieEvent;
  target?: string;
  enemyPlayer?: string;
}
