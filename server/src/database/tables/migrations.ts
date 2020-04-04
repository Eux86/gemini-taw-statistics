import { Table } from "./table";
import { Db } from "../db";

export interface IMigrationsTable {
  id?: string;
  version: number;
  lastUpdate: string;
}

export class MigrationsTable extends Table<IMigrationsTable> {
  constructor(db: Db) {
    super(db, 'migrations');
  }
}