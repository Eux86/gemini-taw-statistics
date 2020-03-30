import { IPlayerScores } from "../models/player-scores";
import { ScoresTable, IScoresTable } from "../database/tables/scores";

export class ScoresService {
  private scoresTable: ScoresTable;

  constructor(scoresTable: ScoresTable) {
    this.scoresTable = scoresTable;
  }

  getAllScores = async (): Promise<IPlayerScores[]> => {
    const result = await this.scoresTable.getAll();
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
}