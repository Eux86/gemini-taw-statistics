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
}

export class SortiesTable extends Table<ISortiesTable> {
  constructor(db: Db) {
    super(db, 'sorties');
  }
}