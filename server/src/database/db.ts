import { Client, QueryResult } from 'pg';
import { IPlayerScores } from '../business-models/player-scores';

// export type Operation<T = any> = (...args: any) => Promise<T>;
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

  // ################################# PUBLIC QUERIEDS 
  public addPlayersScores = async (playersScores: IPlayerScores[]): Promise<void> => {
    let queryString = 'INSERT INTO taw (name, airkill, groundkill, streakAK, streakGk, deaths, sorties, flightTimeMinutes, updateDate) VALUES ';
    playersScores.forEach((scores: IPlayerScores, index: number) => {
      queryString = `${queryString}('${scores.name}', ${scores.airKills}, ${scores.groundKills}, ${scores.streakAk}, ${scores.streakGk}, ${scores.deaths}, ${scores.sorties}, ${scores.flightTimeMinutes}, now())${index < playersScores.length - 1 ? ',' : ''}
      `
    });
    this.startTransaction();
    await this.query(queryString);
    await this.addUpdateLog('taw');
    this.commitTransaction();
  }

  public getPlayersScores = async (dateFrom: Date, dateTo: Date): Promise<IPlayerScores[]> => {
    interface IQueryResult { name: string, airkill: number, groundkill: number, streakak: number, streakgk: number, deaths: number, sorties: number, flighttimeminutes: number, updatedate: string }
    let queryString = 'SELECT name, airkill, groundkill, streakak, streakgk, deaths, sorties, flighttimeminutes, updatedate ';
    queryString += `FROM taw WHERE updateDate > to_timestamp(${dateFrom.getTime()} / 1000.0) AND updateDate < to_timestamp(${dateTo.getTime()} / 1000.0)`;
    const result = await this.query<IQueryResult>(queryString);
    return result.rows.map(
      (row: IQueryResult) => {
        const playerScores: IPlayerScores = {
          name: row.name,
          airKills: row.airkill,
          groundKills: row.groundkill,
          streakAk: row.streakak,
          streakGk: row.streakgk,
          deaths: row.deaths,
          sorties: row.sorties,
          flightTimeMinutes: row.flighttimeminutes,
          updateDate: new Date(row.updatedate),
          serverCode: 'taw',
        }
        return playerScores;
      }
    );
  }

  public getLastUpdateDateByTable = async (tableName: string): Promise<Date | undefined> => {
    const queryString = `SELECT updateDate FROM updatesLog WHERE tableName = '${tableName}' ORDER BY updateDate DESC LIMIT 1`;
    const result = await this.query<{ updatedate: string }>(queryString);
    if (result.rows.length > 0) {
      const dateString = result.rows[0].updatedate;
      return new Date(dateString);
    }
    return undefined;
  }


  public executeTransaction = async <T>(...operations: (() => Promise<T>)[]): Promise<T[]> => {
    let results;
    await this.startTransaction();
    try {
      results = await Promise.all<T>(operations.map(x => x()));
    } catch (error) {
      await this.rollbackTransaction()
      return Promise.reject(error);
    }
    await this.commitTransaction();
    return Promise.resolve(results);
  }

  // ################################# PRIVATE QUERIEDS 
  private addUpdateLog = async (tableName: string): Promise<void> => {
    let queryString = `INSERT INTO updatesLog (tableName, updateDate) VALUES ('${tableName}', now())`;
    await this.query(queryString);
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

  // Should be private but is public just for local testing
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
      serverCode TEXT,
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

  private startTransaction = async () => {
    return this.query('BEGIN;');
  }
  private commitTransaction = async () => {
    return this.query('COMMIT;');
  }
  private rollbackTransaction = async () => {
    return this.query('ROLLBACK;');
  }

  // ################################# GENERAL DB UTILITIES QUERIEDS 
  query = async <T>(queryString: string): Promise<QueryResult<T>> => {
    return new Promise((resolve, reject) => {
      // console.log('EXECUTING QUERY: ' + queryString);
      this.client.query<T>(queryString, (err, res) => {
        if (err) {
          console.log('ERROR IN QUERY: ' + queryString);
          return reject(err);
        }
        console.log('EXECUTED QUERY: ' + queryString);
        return resolve(res);
      });
    })

  }

}