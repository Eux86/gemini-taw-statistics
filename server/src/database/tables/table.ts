import { Db } from "../db"
import { QueryResult } from "pg";

export interface IWhereCondition<T,J>{
  fieldName: keyof(T & J);
  value: string
}
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
    const queryString = `INSERT INTO ${this.tableName} ${fieldsString} VALUES ${valuesString};`
    return this.db.query<T>(queryString);
  }

  update = async (entry: T & { [key: string]: any }, whereCondition: string): Promise<QueryResult<T>> => {
    const updateString = Object.keys(entry).map((key: string) => `${key} = '${entry[key]}'`)
    return this.db.query(`UPDATE ${this.tableName} SET ${updateString} WHERE ${whereCondition}`);
  }

  select = <J = {}>(...fields: Array<keyof ((T & J))>) => {
    const queryString = `SELECT ${fields.join(',') || '*'} FROM ${this.tableName} `;
    return {
      where: this.where(queryString, this),
      orderBy: this.orderBy(queryString, this),
      limit: this.limit(queryString, this),
      queryString: queryString,
      innerJoin: this.innerJoin<J>(queryString, this),
    }
  }

  innerJoin = <J>(previous: string, _this: Table<T>) => (tableName: string) => {
    const queryString = `${previous} INNER JOIN ${tableName}`;
    return {
      on: this.on<J>(queryString, _this, tableName),
    }
  }

  on = <J>(previous: string, _this: Table<T>, tableName: string) => (fieldTable1: keyof T, fieldTable2: keyof J) => {
    const queryString = `${previous} ON ${this.tableName}.${fieldTable1} = ${tableName}.${fieldTable2} `;
    return {
      where: this.where<J>(queryString, this),
      orderBy: this.orderBy<J>(queryString, this),
      limit: this.limit<J>(queryString, this),
      queryString: queryString,
    }
  }

  selectDistinct = (...fields: Array<keyof T>) => {
    const queryString = `SELECT DISTINCT ${fields.join(',') || '*'} FROM ${this.tableName} `;
    return {
      where: this.where(queryString, this),
      orderBy: this.orderBy(queryString, this),
      limit: this.limit(queryString, this),
      queryString: queryString,
    }
  }

  
where = <J>(previous: string, _this: Table<T>) => (...conditions: IWhereCondition<T,J>[]) => {
  const filter = conditions.map(condition => `${condition.fieldName} = ${condition.value}`).join(' AND ');
  const queryString = `${previous} WHERE ${filter}`;
  return {
    execute: _this.execute<J>(queryString, _this),
    orderBy: _this.orderBy<J>(queryString, _this),
    limit: _this.limit<J>(queryString, _this),
    queryString: queryString,
  }
}

orderBy = <J>(previous: string, _this: Table<T>) => (fieldName: keyof (T & J), desc: boolean = false) => {
  const queryString = `${previous} ORDER BY ${fieldName} ${desc ? 'DESC' : ''}`;
  return {
    execute: _this.execute<J>(queryString, _this),
    limit: _this.limit<J>(queryString, _this),
    queryString: queryString,
  }
}

limit = <J>(previous: string, _this: Table<T>) => (rowsNumber: number) => {
  const queryString = `${previous} LIMIT ${rowsNumber}`;
  return {
    execute: _this.execute<J>(queryString, _this),
    queryString: queryString,
  }
}

execute = <J>(previous: string, _this: Table<T>) => async (): Promise<QueryResult<T & J>> => {
  return await _this.db.query(`${previous};`);
}
}