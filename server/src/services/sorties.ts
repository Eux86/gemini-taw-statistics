import { IPlayerScores } from "../business-models/player-scores";
import { ISortiesTable } from "../database/tables/sorties";
import { SortiesTable } from "../database/tables/sorties";
import { SortiesEventsTable, ISortieEventsTable } from "../database/tables/sorties-events";
import { IPlayerKillInfo } from "../business-models/player-kill-info";

export class SortiesService {
  private sortiesTable: SortiesTable;

  constructor(sortiesTable: SortiesTable) {
    this.sortiesTable = sortiesTable;
  }

  getLatestKills = async (numberOfResults = 10): Promise<IPlayerKillInfo[]> => {
    const result = await this.getKillByType('SHOT DOWN', numberOfResults);
    return result;
  }

  getLatestDeaths = async (numberOfResults = 10): Promise<IPlayerKillInfo[]> => {
    const result = await this.getKillByType('WAS SHOT DOWN', numberOfResults);
    return result;
  }

  private getKillByType = async (type: 'SHOT DOWN' | 'WAS SHOT DOWN', numberOfResults = 10): Promise<IPlayerKillInfo[]> => {
    const result = await this.sortiesTable.select<ISortieEventsTable>()
    .innerJoin(SortiesEventsTable.tableName)
    .on('hash','sortieHash')
    .where('event', `\'${type}\'`)
    .orderBy("sortiedate", true)
    .limit(numberOfResults)
    .execute();
    const latestKills = result.rows.map((row): IPlayerKillInfo => ({
      date: row.date,
      enemyAircraft: row.object || '',
      enemyPlayer: row.enemyplayer || '',
      ownAircraft: row.aircraft,
      playerName: row.playername,
      serverCode: row.servercode,
      takeOffAt: row.takeoffat
    }));
    return latestKills;
  }

}