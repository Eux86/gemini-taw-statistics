import { IPlayerScores } from "../business-models/player-scores";
import { ScoresTable, IScoresTable } from "../database/tables/scores";

export class ScoresService {
  private scoresTable: ScoresTable;

  constructor(scoresTable: ScoresTable) {
    this.scoresTable = scoresTable;
  }

  getAllScores = async (): Promise<IPlayerScores[]> => {
    const result = await this.scoresTable.select().orderBy('updatedate').execute();
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
}