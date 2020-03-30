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

  getAll = async (): Promise<QueryResult<T>> => {
    try {
      return (await this.db.query<T>(`SELECT * FROM ${this.tableName}`));
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

  select = (...fields: Array<keyof T>) => {
    const queryString = `SELECT ${fields.join(',') || '*'} FROM ${this.tableName} `;
    return {
      where: this.where(queryString, this),
      orderBy: this.orderBy(queryString, this),
      limit: this.limit(queryString, this),
      queryString: queryString,
    }
  }

  where = (previous: string, _this: Table<T>) => (fieldName: keyof T, value: string) => {
    const queryString = `${previous} WHERE ${fieldName} = ${value}`;
    return {
      execute: _this.execute(queryString, _this),
      orderBy: _this.orderBy(queryString, _this),
      limit: _this.limit(queryString, _this),
      queryString: queryString,
    }
  }

  orderBy = (previous: string, _this: Table<T>) => (fieldName: keyof T, desc: boolean = false) => {
    const queryString = `${previous} ORDER BY ${fieldName} ${desc ? 'DESC' : ''}`;
    return {
      execute: _this.execute(queryString, _this),
      limit: _this.limit(queryString, _this),
      queryString: queryString,
    }
  }
  
  limit = (previous: string, _this: Table<T>) => (rowsNumber: number) => {
    const queryString = `${previous} LIMIT ${rowsNumber}`;
    return {
      execute: _this.execute(queryString, _this),
      queryString: queryString,
    }
  }

  execute = (previous: string, _this: Table<T>) => async (): Promise<QueryResult<T>> => {
    return await _this.db.query(`${previous};`);
  }
}