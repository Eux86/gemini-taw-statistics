import { Table } from "./table";
import { Db } from "../db";

export interface IScoresTable {
  id?: string;
  name: string;
  airKills: number;
  groundKills: number;
  streakAk: number;
  streakGk: number;
  deaths: number;
  sorties: number;
  flightTimeMinutes: number;
  serverCode: string;
  updateDate?: Date;
}

export class ScoresTable extends Table<IScoresTable> {
  constructor(db: Db) {
    super(db, 'scores');
  }
}