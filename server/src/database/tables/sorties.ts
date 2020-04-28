import { Table } from "./table";
import { Db } from "../db";

export interface ISortiesTable {
  id?: string;
  hash: number;
  servercode: string;
  playername: string;
  sortiedate: string;
  aircraft: string;
  takeoffat: string;
  landedat: string;
  url: string;
}

export class SortiesTable extends Table<ISortiesTable> {
  public static tableName = 'sorties';

  constructor(db: Db) {
    super(db, 'sorties');
  }
}