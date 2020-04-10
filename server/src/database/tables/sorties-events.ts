import { Table } from "./table";
import { Db } from "../db";

export interface ISortieEventsTable {
  id?: string;
  sortieHash: number;
  event: string;
  object?: string;
  type: string;
  enemyPlayer?: string;
  date: string;
}

export class SortiesEventsTable extends Table<ISortieEventsTable> {
  public static tableName = 'sortieevents';
  constructor(db: Db) {
    super(db, SortiesEventsTable.tableName);
  }
}