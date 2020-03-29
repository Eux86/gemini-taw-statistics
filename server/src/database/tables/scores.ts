import { Table } from "./table";
import { Db } from "../db";
import { IPlayerScores } from "../../models/player-scores";

export interface IScoresTable {
  id?: string;
  name: string;
  airkills: number;
  groundkills: number;
  streakak: number;
  streakgk: number;
  deaths: number;
  sorties: number;
  flighttimeminutes: number;
  servercode: string;
  updatedate?: Date;
}

export class ScoresTable extends Table<IScoresTable> {
  constructor(db: Db) {
    super(db, 'scores');
  }
}