import { Table } from "./table";
import { Db } from "../db";

export interface ISortieEventsTable {
  id?: string;
  sortiehash: number;
  event: string;
  target?: string;
  enemyplayer?: string;
  date: string;
}

export class SortiesEventsTable extends Table<ISortieEventsTable> {
  public static tableName = 'sortieevents';
  constructor(db: Db) {
    super(db, SortiesEventsTable.tableName);
  }
}