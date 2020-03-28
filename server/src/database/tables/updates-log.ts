import { Table } from "./table";
import { Db } from "../db";

export interface IUpdatesLogsTable {
  id?: string;
  serverCode: string;
  updateDate?: string;
}

export class UpdatesLogsTable extends Table<IUpdatesLogsTable> {
  constructor(db: Db) {
    super(db, 'updateslog');
  }
}