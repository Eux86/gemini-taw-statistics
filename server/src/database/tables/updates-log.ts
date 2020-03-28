import { Table } from "./table";
import { Db } from "../db";

export interface IUpdatesLogsTable {
  id?: string;
  servercode: string;
  updatedate?: string;
}

export class UpdatesLogsTable extends Table<IUpdatesLogsTable> {
  constructor(db: Db) {
    super(db, 'updateslog');
  }

  getLatestUpdate = async (): Promise<Date> => {
    const latestUpdate = await this.db.query<IUpdatesLogsTable>(`SELECT updatedate FROM ${this.tableName} ORDER BY updatedate DESC LIMIT 1`);
    const latestUpdateDate = new Date(latestUpdate?.rows?.[0]?.updatedate || 0);
    return latestUpdateDate;
  }
}