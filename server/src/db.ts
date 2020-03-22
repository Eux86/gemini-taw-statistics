import { Client, QueryResult } from 'pg';
import { IPlayerScores } from './business-models/player-scores';

export class Db {
  client: Client;

  constructor() {
    this.client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: false,
    });
  }

  connect = async () => {
    return new Promise((resolve, reject) => {
      this.client.connect()
        .then(() => {
          this.checkTables();
          resolve();
        })
        .catch((error) => reject(error));
    });
  }

  public addPlayerScores = async (playerScores: IPlayerScores[]): Promise<void> => {
    let queryString = 'INSERT INTO taw (name, airkill, groundkill, streakAK, streakGk, deaths, sorties, flightTimeMinutes, updateDate) VALUES ';
    playerScores.forEach((scores: IPlayerScores, index: number) => {
      queryString =`${queryString}('${scores.name}', ${scores.airKills}, ${scores.groundKills}, ${scores.streakAk}, ${scores.streakGk}, ${scores.deaths}, ${scores.sorties}, ${scores.flightTimeMinutes}, now())${index<playerScores.length-1?',':''}
      `
    });
    this.startTransaction();
    await this.query(queryString);
    await this.addUpdateLog('taw');
    this.commitTransaction();
  }

  public getLastUpdateDateForTable = async (tableName: string): Promise<Date | undefined> => {
    const queryString = `SELECT updateDate FROM updatesLog WHERE tableName = '${tableName}' ORDER BY updateDate DESC LIMIT 1`;
    const result = await this.query<{updatedate: string}>(queryString);
    if (result.rows.length>0) {
      const dateString =  result.rows[0].updatedate;
      return new Date(dateString);
    }
    return undefined;
  }

  private addUpdateLog = async (tableName: string): Promise<void> => {
    let queryString = `INSERT INTO updatesLog (tableName, updateDate) VALUES ('${tableName}', now())`;
    await this.query(queryString);
  }

  query = <T>(queryString: string): Promise<QueryResult<T>> => {
    return new Promise((resolve, reject) => {
      this.client.query<T>(queryString, (err, res) => {
        if (err) throw err;
        resolve(res);
      });
    })

  }

  private checkTables = async () => {
    interface IQueryResult {
      table_name: string;
    }
    const result = await this.query<IQueryResult>('SELECT table_name FROM information_schema.tables;');
    const tawTable = result.rows.find((table: IQueryResult) => table.table_name === 'taw');
    if (!tawTable) {
      this.createTawTable();
      this.createUpdatesLogTable();
    } else {
      console.log('Found table: taw');
    }
  }

  dropTables = async () => {
    await this.query('DROP TABLE taw');
    await this.query('DROP TABLE updatesLog');
  }

  private createTawTable = async () => {
    console.log('Creating taw table');
    const query = `
    CREATE TABLE taw(
      ID SERIAL PRIMARY KEY NOT NULL,
      name TEXT,
      airkill INT,
      groundkill INT,
      streakAK INT,
      streakGk INT,
      deaths INT,
      sorties INT,
      flightTimeMinutes INT,
      updateDate TIMESTAMP DEFAULT now()
   );
    `;
    await this.query(query);
  }

  private createUpdatesLogTable = async () => {
    console.log('Creating updatesLog table');
    const query = `
    CREATE TABLE updatesLog(
      ID SERIAL PRIMARY KEY NOT NULL,
      tableName TEXT,
      updateDate TIMESTAMP DEFAULT now()
   );
    `;
    const result = await this.query(query);
    console.log(result);
  }

  private startTransaction = () => {
    this.query('BEGIN;');
  }
  private commitTransaction = () => {
    this.query('COMMIT;');
  }
  private rollbackTransaction = () => {
    this.query('ROLLBACK;');
  }
}