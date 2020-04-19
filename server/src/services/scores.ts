import { IPlayerScores } from "../models/player-scores";
import { ScoresTable, IScoresTable } from "../database/tables/scores";
import { SortiesEventsTable, ISortieEventsTable } from "../database/tables/sorties-events";
import { SortieEvent } from "../models/sortie-event";
import { IScoresFilter } from "../models/i-scores-filter";
import { ISortiesTable, SortiesTable } from "../database/tables/sorties";
import { IScoreByDate } from "../models/i-score-by-date";

export class ScoresService {
  private scoresTable: ScoresTable;

  constructor(scoresTable: ScoresTable) {
    this.scoresTable = scoresTable;
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

  getKillsScores = async (filter: IScoresFilter): Promise<IScoreByDate[]> => {
    return this.getScoresByDateForEvent(SortieEvent.ShotdownEnemy, filter);
  }

  getDeathsScores = async (filter: IScoresFilter): Promise<IScoreByDate[]> => {
    return this.getScoresByDateForEvent(SortieEvent.WasShotdown, filter);
  }

  getGroundKillsScores = async (filter: IScoresFilter): Promise<IScoreByDate[]> => {
    return this.getScoresByDateForEvent(SortieEvent.DestroyedGroundTarget, filter);
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
    const results = this.scoresTable.selectDistinct('updatedate').orderBy('updatedate', true).execute();
    const uniqueDates = (await results).rows.map(row => this.toMonthYear(row.updatedate)).filter(this.unique);
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

  private getScoresByDateForEvent = async (eventType: SortieEvent, filter: IScoresFilter): Promise<IScoreByDate[]> => {
    const dateField: keyof ISortieEventsTable = 'date';
    const eventField: keyof ISortieEventsTable = 'event';
    const sortieHashField: keyof ISortieEventsTable = 'sortieHash';
    const hashField: keyof ISortiesTable = 'hash';
    const filterString = this.getFilterString(filter);
    const queryString = `
      select SUBSTRING(${dateField}, 0, 11) as date, count(*) as score from ${SortiesEventsTable.tableName}
      inner join ${SortiesTable.tableName} on ${sortieHashField} = ${hashField}
      where ${eventField} = '${eventType}' ${filterString ? ` and (${filterString})` : ''} 
      group by SUBSTRING(${dateField}, 0, 11)
    `;
    const killsCount = await this.scoresTable.db.query<{
      date: string;
      score: number;
    }>(queryString);

    return killsCount.rows.map(entry => ({
      date: entry.date,
      score: entry.score,
    }));
  }

  private getFilterString = (filter: IScoresFilter): string | undefined => {
    const {
      endDate,
      playerName,
      startDate,
    } = filter;
    const dateField: keyof ISortieEventsTable = 'date';
    const playerNameField: keyof ISortiesTable = 'playername';
    const startDateFilter = `${dateField} >= '${startDate}'`;
    const endDateFilter = `${dateField} <= '${endDate}'`;
    const playerNameFilter = `${playerNameField} = '${playerName}'`;
    let filterString = `${startDate ? startDateFilter : ''}`;
    if (endDate) {
      filterString = `${filterString !== '' ? `${filterString} AND ` : ''} ${endDateFilter}`;
    }
    if (playerName) {
      filterString = `${filterString ? `${filterString} AND ` : ''} ${playerNameFilter}`;
    }
    if (filterString.trim() !== '') {
      return filterString;
    } else {
      return undefined;
    }
  }
}