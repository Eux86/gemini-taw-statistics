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
  event: string;
  object?: string;
  type: string;
  enemyPlayer?: string;
}
