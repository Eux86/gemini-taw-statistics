import { SortiesTable } from "../database/tables/sorties";
import { ISortieEventsTable, SortiesEventsTable } from "../database/tables/sorties-events";
import { ISortieEventInfo } from "../models/sortie-event-info";
import { SortieEvent } from "../enums/sortie-event";

export class SortiesService {
  private sortiesTable: SortiesTable;

  constructor(sortiesTable: SortiesTable) {
    this.sortiesTable = sortiesTable;
  }

  getLatestKills = async (numberOfResults = 10): Promise<ISortieEventInfo[]> => {
    const kills = await this.getSortieEvent(SortieEvent.Killed, numberOfResults);
    const enemyShotDowns = await this.getSortieEvent(SortieEvent.ShotdownEnemy, 200);
    const result = kills.map(kill => {
      if (kill.enemyAircraft.toLowerCase() === 'pilot') {
        const relatedShotDown = enemyShotDowns.find(shotDown => shotDown.sortieHash === kill.sortieHash && shotDown.playerName === kill.playerName);
        const filled = {
          ...kill,
          enemyAircraft: relatedShotDown?.enemyAircraft,
        } as ISortieEventInfo;
        return filled;
      } else {
        return kill;
      }
    });
    return result;
  }

  getLatestDeaths = async (numberOfResults = 10): Promise<ISortieEventInfo[]> => {
    const deaths = await this.getSortieEvent(SortieEvent.WasKilled, numberOfResults);
    const shotDowns = await this.getSortieEvent(SortieEvent.WasShotdown, 200);
    const result = deaths.map(death => {
      const relatedShotDown = shotDowns.find(shotDown => shotDown.sortieHash === death.sortieHash);
      const filled = {
        ...death,
        enemyAircraft: relatedShotDown?.enemyAircraft,
        enemyPlayer: relatedShotDown?.enemyPlayer,
      } as ISortieEventInfo;
      return filled;
    });
    return result;
  }

  private getSortieEvent = async (type: SortieEvent, numberOfResults = 10): Promise<ISortieEventInfo[]> => {
    const result = await this.sortiesTable.select<ISortieEventsTable>()
      .innerJoin(SortiesEventsTable.tableName)
      .on('hash', 'sortiehash')
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
      takeOffAt: row.takeoffat,
      sortieHash: row.sortiehash,
    }));
    return latestKills;
  }

}