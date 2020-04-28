import { IPlayerScores } from "../models/player-scores";
import { ScoresTable, IScoresTable } from "../database/tables/scores";
import { SortiesEventsTable, ISortieEventsTable } from "../database/tables/sorties-events";
import { SortieEvent } from "../enums/sortie-event";
import { IScoresFilter } from "../models/i-scores-filter";
import { ISortiesTable, SortiesTable } from "../database/tables/sorties";
import { IScoreByDate } from "../models/i-score-by-date";

export class ScoresService {
  private scoresTable: ScoresTable;
  private sortiesTable: SortiesTable;

  constructor(scoresTable: ScoresTable, sortiesTable: SortiesTable) {
    this.scoresTable = scoresTable;
    this.sortiesTable = sortiesTable;
  }

  getAllScores = async (): Promise<IPlayerScores[]> => {
    const dateField: keyof ISortieEventsTable = 'date';
    const eventField: keyof ISortieEventsTable = 'event';
    const queryString = `
    select alldates.date as date, kills.count as kills, deaths.count as deaths, groundkills.count as groundkills from (
      select distinct SUBSTRING(${dateField}, 0, 11) as date from ${SortiesEventsTable.tableName}
    ) as alldates
    left join
    (
      select SUBSTRING(${dateField}, 0, 11) as date, count(*) from ${SortiesEventsTable.tableName}
      where ${eventField} = '${SortieEvent.ShotdownEnemy}'
      group by SUBSTRING(${dateField}, 0, 11)
    ) as kills on kills.date = alldates.date
    left join (
      select SUBSTRING(${dateField}, 0, 11) as date, count(*) from ${SortiesEventsTable.tableName}
      where ${eventField} = '${SortieEvent.WasShotdown}'
      group by SUBSTRING(${dateField}, 0, 11)
    ) as deaths on deaths.date = alldates.date
    left join (
      select SUBSTRING(${dateField}, 0, 11) as date, count(*) from ${SortiesEventsTable.tableName}
      where ${eventField} = '${SortieEvent.DestroyedGroundTarget}'
      group by SUBSTRING(${dateField}, 0, 11)
    ) as groundkills on groundkills.date = alldates.date
    order by date desc;
    `;
    interface IQueryResult {
      date: string,
      kills: number,
      deaths: number,
      groundkills: number,
    };
    const result = await this.scoresTable.db.query<IQueryResult>(queryString);

    const playerScores: IPlayerScores[] = result.rows.map<IPlayerScores>((row: IQueryResult): IPlayerScores => ({
      airKills: row.kills || 0,
      deaths: row.deaths || 0,
      groundKills: row.groundkills || 0,
      updateDate: new Date(row.date),
    }))

    return playerScores;
  }

  getLatestScores = async (): Promise<IPlayerScores[]> => {
    const subQuery = this.scoresTable.select('updatedate').orderBy('updatedate', true).limit(1).queryString;
    const result = await this.scoresTable.select().where('updatedate', `(${subQuery})`).execute();
    const playerScores = result.rows.map((row: IScoresTable): IPlayerScores => ({
      airKills: row.airkills,
      deaths: row.deaths,
      flightTimeMinutes: row.flighttimeminutes,
      groundKills: row.groundkills,
      name: row.name,
      serverCode: row.servercode,
      sorties: row.sorties,
      streakAk: row.streakak,
      streakGk: row.streakgk,
      updateDate: row.updatedate
    }));
    return playerScores;
  }

  getAvailableMonths = async (): Promise<string[]> => {
    const results = this.sortiesTable.selectDistinct('sortiedate').orderBy('sortiedate', true).execute();
    const uniqueDates = (await results).rows.map(row => this.toMonthYear(new Date(row.sortiedate))).filter(this.unique);
    return uniqueDates;
  }

  getAvailableServers = async (): Promise<string[]> => {
    const results = this.scoresTable.selectDistinct('servercode').orderBy('servercode', true).execute();
    const uniqueServers = (await results).rows.map(row => row.servercode).filter(this.unique);
    return uniqueServers;
  }

  private unique = (value: any, index: number, self: Array<any>) => {
    return self.indexOf(value) === index;
  }

  private toMonthYear = (date?: Date) => {
    if (!date) throw new Error('no date defined');
    const month = date.getMonth();
    const year = date.getFullYear();
    return `${month}-${year}`;
  }

  public getScoresFiltered = async (filter: IScoresFilter): Promise<IScoreByDate[]> => {
    const dateField: keyof ISortieEventsTable = 'date';
    const eventField: keyof ISortieEventsTable = 'event';
    const serverCodeField: keyof ISortiesTable = 'servercode';
    const sortieHashField: keyof ISortieEventsTable = 'sortiehash';
    const hashField: keyof ISortiesTable = 'hash';
    const filterString = this.getFilterString(filter);
    const queryString = `
      select SUBSTRING(${dateField}, 0, 11) as date, count(*) as score, ${eventField} as event
      from ${SortiesEventsTable.tableName}
      inner join ${SortiesTable.tableName} on ${sortieHashField} = ${hashField}
      ${filterString ? ` where (${filterString})` : ''} 
      group by SUBSTRING(${dateField}, 0, 11), ${eventField}
    `;
    const killsCount = await this.scoresTable.db.query<{
      date: string;
      score: number;
      servercode: string;
      event: SortieEvent;
    }>(queryString);

    return killsCount.rows.map(entry => ({
      date: entry.date,
      score: entry.score,
      eventType: entry.event,
    }));
  }

  private getFilterString = (filter: IScoresFilter): string | undefined => {
    const {
      endDate,
      playerName,
      startDate,
      serverCode,
      eventType,
    } = filter;
    const dateField: keyof ISortieEventsTable = 'date';
    const playerNameField: keyof ISortiesTable = 'playername';
    const serverCodeField: keyof ISortiesTable = 'servercode';
    const eventField: keyof ISortieEventsTable = 'event';
    const startDateFilter = `${dateField} >= '${startDate}'`;
    const endDateFilter = `${dateField} <= '${endDate}'`;
    const eventTypeFilter = `${eventField} = '${eventType}'`;
    const playerNameFilter = `${playerNameField} = '${playerName}'`;
    const serverCodeFilter = `${serverCodeField} = '${serverCode}'`;
    let filterString = `${startDate ? startDateFilter : ''}`;
    if (eventType) {
      filterString = `${filterString !== '' ? `${filterString} AND ` : ''} ${eventTypeFilter}`;
    }
    if (endDate) {
      filterString = `${filterString !== '' ? `${filterString} AND ` : ''} ${endDateFilter}`;
    }
    if (playerName) {
      filterString = `${filterString ? `${filterString} AND ` : ''} ${playerNameFilter}`;
    }
    if (serverCode) {
      filterString = `${filterString ? `${filterString} AND ` : ''} ${serverCodeFilter}`;
    }
    if (filterString.trim() !== '') {
      return filterString;
    } else {
      return undefined;
    }
  }
}