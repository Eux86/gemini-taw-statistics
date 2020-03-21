import { Client, QueryResult } from 'pg';

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

  // SELECT table_schema,table_name FROM information_schema.tables;
  query = <T>(queryString: string): Promise<QueryResult<T>> => {
    return new Promise((resolve, reject) => {
      this.client.query<T>(queryString, (err, res) => {
        if (err) throw err;
        resolve(res);
        // this.client.end();
      });
    })

  }

  checkTables = async () => {
    interface IQueryResult {
      table_name: string;
    }
    const result = await this.query<IQueryResult>('SELECT table_name FROM information_schema.tables;');
    const tawTable = result.rows.find((table: IQueryResult) => table.table_name === 'taw');
    if (!tawTable) {
      this.createTawTable();
    } else {
      console.log('Found table: taw');
    }
  }

  dropTawTable = async () => {
    const query = 'DROP TABLE taw';
    await this.query(query);
  }

  createTawTable = async () => {
    console.log('Creating taw table');
    const query = `
    CREATE TABLE taw(
      ID INT PRIMARY KEY NOT NULL,
      name TEXT,
      airkill INT,
      groundkill INT,
      streakAK INT,
      streakGk INT,
      deaths INT,
      sorties INT,
      flightTimeMinutes INT
   );
    `;
    const result = await this.query(query);
    console.log(result);
  }
}