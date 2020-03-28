import { Client, QueryResult } from 'pg';
import { IPlayerScores } from '../business-models/player-scores';

export class Db {
  client: Client;

  constructor() {
    this.client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: false,
    });
  }

  public connect = async () => {
    return new Promise((resolve, reject) => {
      this.client.connect()
        .then(() => {
          resolve();
        })
        .catch((error) => reject(error));
    });
  }

  // ################################# PUBLIC QUERIEDS 
  public getPlayersScores = async (dateFrom: Date, dateTo: Date): Promise<IPlayerScores[]> => {
    interface IQueryResult { name: string, airkills: number, groundkills: number, streakak: number, streakgk: number, deaths: number, sorties: number, flighttimeminutes: number, updatedate: string, servercode: string }
    let queryString = 'SELECT name, airkills, groundkills, streakak, streakgk, deaths, sorties, flighttimeminutes, updatedate ';
    queryString += `FROM scores WHERE updateDate > to_timestamp(${dateFrom.getTime()} / 1000.0) AND updateDate < to_timestamp(${dateTo.getTime()} / 1000.0)`;
    const result = await this.query<IQueryResult>(queryString);
    return result.rows.map(
      (row: IQueryResult) => {
        const playerScores: IPlayerScores = {
          name: row.name,
          airKills: row.airkills,
          groundKills: row.groundkills,
          streakAk: row.streakak,
          streakGk: row.streakgk,
          deaths: row.deaths,
          sorties: row.sorties,
          flightTimeMinutes: row.flighttimeminutes,
          updateDate: new Date(row.updatedate),
          serverCode: row.servercode
        }
        return playerScores;
      }
    );
  }

  // ################################# PRIVATE QUERIEDS 
  
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
  public query = async <T>(queryString: string): Promise<QueryResult<T>> => {
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

}