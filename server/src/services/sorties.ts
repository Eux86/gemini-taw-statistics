import { IPlayerScores } from "../business-models/player-scores";
import { ISortiesTable } from "../database/tables/sorties";
import { SortiesTable } from "../database/tables/sorties";
import { SortiesEventsTable, ISortieEventsTable } from "../database/tables/sorties-events";
import { ISortieEventInfo } from "../business-models/sortie-event-info";
import { SortieEvent } from "../business-models/sortie-event";

export class SortiesService {
  private sortiesTable: SortiesTable;

  constructor(sortiesTable: SortiesTable) {
    this.sortiesTable = sortiesTable;
  }

  getLatestKills = async (numberOfResults = 10): Promise<ISortieEventInfo[]> => {
    const result = await this.getSortieEvent(SortieEvent.ShotdownEnemy, numberOfResults);
    return result;
  }

  getLatestDeaths = async (numberOfResults = 10): Promise<ISortieEventInfo[]> => {
    const result = await this.getSortieEvent(SortieEvent.WasShotdown, numberOfResults);
    return result;
  }

  private getSortieEvent = async (type: SortieEvent, numberOfResults = 10): Promise<ISortieEventInfo[]> => {
    const result = await this.sortiesTable.select<ISortieEventsTable>()
    .innerJoin(SortiesEventsTable.tableName)
    .on('hash','sortieHash')
    .where('event', `\'${type}\'`)
    .orderBy("sortiedate", true)
    .limit(numberOfResults)
    .execute();
    const latestKills = result.rows.map((row): ISortieEventInfo => ({
      date: row.date,
      enemyAircraft: row.target || '',
      enemyPlayer: row.enemyplayer || '',
      ownAircraft: row.aircraft,
      playerName: row.playername,
      serverCode: row.servercode,
      takeOffAt: row.takeoffat
    }));
    return latestKills;
  }

}