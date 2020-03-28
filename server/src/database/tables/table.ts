import { Db } from "../db"
import { QueryResult } from "pg";

export class Table<T> {
  db: Db;
  tableName: string;

  constructor(db: Db, tableName: string) {
    this.db = db;
    this.tableName = tableName;
  }

  getById = async (id: string): Promise<T> => {
    try {
      return (await this.db.query<T>(`SELECT * FROM ${this.tableName} WHERE id = ${id}`))?.rows[0];
    } catch (error) {
      throw new Error(error);
    }
  }

  add = async (entry: T): Promise<QueryResult<T>> => {
    const fields = Object.keys(entry);
    const fieldsString = `(${fields.join(', ')})`;
    let values = Object.values(entry);
    values = values.map((value: any) => `'${value}'`);
    const valuesString = `(${values.join(', ')})`;
    return this.db.query(`INSERT INTO ${this.tableName} ${fieldsString} VALUES ${valuesString}`);
  }

  update = async (entry: T & { [key: string]: any }, whereCondition: string): Promise<QueryResult<T>> => {
    const updateString = Object.keys(entry).map((key: string) => `${key} = '${entry[key]}'`)
    return this.db.query(`UPDATE ${this.tableName} SET ${updateString} WHERE ${whereCondition}`);
  }
}