import { SortiesTable, ISortiesTable } from "../database/tables/sorties";
import { ISortieEventsTable, SortiesEventsTable } from "../database/tables/sorties-events";
import { ISortieEventInfo } from "../models/sortie-event-info";
import { SortieEvent } from "../enums/sortie-event";
import { IWhereCondition } from '../database/tables/table';

export class SortiesService {
  private sortiesTable: SortiesTable;

  constructor(sortiesTable: SortiesTable) {
    this.sortiesTable = sortiesTable;
  }

  getLatest = async (type: SortieEvent, servercode?: string, numberOfResults = 10): Promise<ISortieEventInfo[]> => {
    switch (type) {
      case SortieEvent.Killed:
        return this.getLatestKills(servercode, numberOfResults);
      case SortieEvent.WasKilled:
        return this.getLatestDeaths(servercode, numberOfResults);
      default:
        return this.getSortieEvent(type, servercode, numberOfResults);
    }
  }

  private getLatestKills = async (servercode?: string, numberOfResults = 10): Promise<ISortieEventInfo[]> => {
    const kills = await this.getSortieEvent(SortieEvent.Killed, servercode, numberOfResults);
    const enemyShotDowns = await this.getSortieEvent(SortieEvent.ShotdownEnemy, servercode, 200);
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

  private getLatestDeaths = async (servercode?: string, numberOfResults = 10): Promise<ISortieEventInfo[]> => {
    const deaths = await this.getSortieEvent(SortieEvent.WasKilled, servercode, numberOfResults);
    const shotDowns = await this.getSortieEvent(SortieEvent.WasShotdown, servercode, 200);
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

  private getSortieEvent = async (type: SortieEvent, serverCode?: string, numberOfResults = 10): Promise<ISortieEventInfo[]> => {
    const conditions: IWhereCondition<ISortiesTable, ISortieEventsTable>[] = [];
    conditions.push({ fieldName: 'event', value: `\'${type}\'` });
    if (serverCode) {
      conditions.push({ fieldName: 'servercode', value: `'${serverCode}'` });
    }
    const result = await this.sortiesTable.select<ISortieEventsTable>()
      .innerJoin(SortiesEventsTable.tableName)
      .on('hash', 'sortiehash')
      .where(...conditions)
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
      url: row.url,
    }));
    return latestKills;
  }

}