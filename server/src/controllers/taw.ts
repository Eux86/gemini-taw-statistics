import { Db } from "../db";
import { IPlayerScores } from "../business-models/player-scores";

export class TawController {
  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  getLastYearStatistics = async (): Promise<IPlayerScores[]> => {
    const scores = await this.db.getPlayersScores(new Date(new Date().setDate(new Date().getDate() - 365)), new Date());
    return scores;
  }
}