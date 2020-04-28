import { SortieEvent } from "../../enums/sortie-event";

export interface ISortie {
  hash: number;
  playerName: string;
  sortieDateString: string;
  aircraft: string;
  takeOffAt: string;
  landedAt?: string;
  ditched?: string;
  events: ISortieEvent[];
  url: string,
}

export interface ISortieEvent {
  sortieHash: number;
  date: string;
  event: SortieEvent;
  target?: string;
  enemyPlayer?: string;
}
