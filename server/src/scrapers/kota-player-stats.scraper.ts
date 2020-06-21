import cheerio from 'cheerio';
import { SortieEvent } from '../enums/sortie-event';
import { IScraper } from '../collector';
import { Db } from '../database/db';
import { SortiesTable } from '../database/tables/sorties';
import { SortiesEventsTable as SortieEventsTable } from '../database/tables/sorties-events';
import { ISortie, ISortieEvent } from './models/common';
import { createHash, getPageContent } from './utils';


export class KotaPlayerStatsScraper implements IScraper {
  id = 'kota-player-stats';
  sortiesTable: SortiesTable;
  sortieEventsTable: SortieEventsTable;
  try: number = 0;
  maxTry: number = 3;

  constructor(db: Db) {
    this.sortiesTable = new SortiesTable(db);
    this.sortieEventsTable = new SortieEventsTable(db);
  }

  run = async (squadronName: string): Promise<undefined> => {
    let sorties = undefined;
    let done = false;
    do {
      try {
        console.log('Collecting sorties from Kota');
        sorties = await this.collect(squadronName);
        done = true;
      } catch (error) {
        if (error.code === 'timeout') {
          this.try++;
          console.log(error.message);
          console.log('Retrying...');
        } else {
          throw error;
        }
      }
      console.log(done);
      console.log(this.try);
      console.log(this.maxTry);
    } while (!done && this.try <= this.maxTry);

    if (!sorties) {
      console.log('Unable to fetch pages. Aborting.');
      return;
    }

    await this.store(sorties);
    console.log('Kota sorties collected');
    return;
  }

  private collect = async (squadronName: string): Promise<ISortie[]> => {
    const data = await getPageContent(`http://kotastat.com/en/pilots/?search=${squadronName}`, true);
    const playerPages = this.getSquadronPlayersPagesUrls(data);
    let sorties: ISortie[] = [];
    console.log(`Loading sorties for ${playerPages.length} players`);
    for (let i = 0; i < playerPages.length; i++) {                                                                     // playerPages.length
      const sortiesPageUrl = playerPages[i].replace('en/pilot', 'en/sorties');
      console.log(`Getting sorties for: ${sortiesPageUrl}`);
      const playersSorties = await this.getPlayersSorties(`http://kotastat.com${sortiesPageUrl}`);
      sorties = sorties.concat(playersSorties);
    }
    return sorties;
  }

  private store = async (sorties: ISortie[]): Promise<void> => {
    console.log(`Adding ${sorties.length} entries`);
    for (let i = 0; i < sorties.length; i++) {
      const sortieData = sorties[i];
      console.log('adding sortie', sortieData.hash);
      try {
        await this.sortiesTable.add({
          hash: sortieData.hash,
          aircraft: sortieData.aircraft,
          landedat: sortieData.landedAt || '',
          playername: sortieData.playerName,
          servercode: 'kota',
          sortiedate: sortieData.sortieDateString,
          takeoffat: sortieData.takeOffAt,
          url: sortieData.url,
        })
        console.log('Added', sortieData.hash);

        console.log('Adding sortie events:');
        for (let k = 0; k < sortieData.events.length; k++) {
          const currentEvent = sortieData.events[k];
          await this.sortieEventsTable.add({
            sortiehash: currentEvent.sortieHash,
            enemyplayer: currentEvent.enemyPlayer,
            event: currentEvent.event,
            target: currentEvent.target,
            date: currentEvent.date,
          });
          console.log('Added event at: ' + currentEvent.date);
        }
      } catch (error) {
        if (error.code === '23505') {
          console.log(`Sortie ${sortieData.hash} already exist, skipping.`);
        } else {
          throw new Error(error);
        }
      }
    }
  }

  private getSquadronPlayersPagesUrls = (data: string): string[] => {
    const pagesUrl: string[] = [];
    const $ = cheerio.load(data);
    const selector = '#content > div > div.content_table > a';
    $(selector).each((index, el) => {
      const url = $(el).attr('href');
      if (!url) throw new Error('Cannot parse sortie player page URL');
      pagesUrl.push(url);
    });
    return pagesUrl;
  }

  private getPlayersSorties = async (url: string): Promise<ISortie[]> => {
    const data = await getPageContent(url, true);
    const playerSortiesUrls: string[] = [];
    const $ = cheerio.load(data);
    const sortiesSelector = '#content > div > div.content_table > a';
    $(sortiesSelector).each((index, el) => {
      const sortieUrl = $(el).attr('href');
      if (!sortieUrl) throw new Error('Cannot parse sortie URL');
      playerSortiesUrls.push(sortieUrl);
    });

    console.log(`parsing ${playerSortiesUrls.length} sorties`);
    const playerSortiesDetails: ISortie[] = [];
    for (let i = 0; i < playerSortiesUrls.length; i++) {
      const sortieUrl = playerSortiesUrls[i];
      const sortieDetails = await this.getSortieDetails(`http://kotastat.com${sortieUrl}`);
      playerSortiesDetails.push(sortieDetails);
    }
    return playerSortiesDetails;
  }

  private getSortieDetails = async (url: string): Promise<ISortie> => {
    const data = await getPageContent(url, true);
    const $ = cheerio.load(data);

    const aircraftSelector = '#sortie > div > div.sortie_general > div.general_right > div';
    const aircraft = $(aircraftSelector).text().trim().replace('Aircraft: ', '');

    const sortieDateSelector = '#sortie > div > div.sortie_title';
    const sortieDate = this.formatDate($(sortieDateSelector).text().trim().replace('Sortie: ', ''));

    const playerNameSelector = '#sortie > div > div.pilot_nickname';
    const playerName = $(playerNameSelector).text().trim().replace('pilot: ', '');

    const logUrl = url.replace('sortie/', 'sortie/log/');
    const events: ISortieEvent[] = await this.getSortieEvents(logUrl);

    const hash = createHash(`${sortieDate}${playerName}kota`);
    events.forEach(event => event.sortieHash = hash);

    const sortiesInfo: ISortie = ({
      hash,
      playerName,
      sortieDateString: sortieDate,
      aircraft,
      takeOffAt: 'unknown',
      landedAt: 'unknown',
      ditched: 'unknown',
      events,
      url: logUrl,
    });

    return sortiesInfo;
  }

  private getSortieEvents = async (logUrl: string): Promise<ISortieEvent[]> => {
    const data = await getPageContent(logUrl, true);
    const $ = cheerio.load(data);

    const baseDateSelector = '#sortie > div > div.sortie_title';
    const baseDateMatches = $(baseDateSelector).text().trim().match('Sortie: (.*) -.*');
    const baseDate = baseDateMatches?.[1];
    if (!baseDate) {
      throw new Error('Couldn\'t parse date for sortie at ' + logUrl);
    }
    const events: ISortieEvent[] = [];
    const logEntrySelector = '#sortie_log > div';
    $(logEntrySelector).each((index, el) => {
      const cols = $(el).find('div');
      const entry: ISortieEvent = {
        sortieHash: 0,
        date: this.formatDate(`${baseDate} - ${$(cols[1]).text().trim()}`),
        event: this.transformToCommonEvent($(cols[2]).text().trim()),
        target: $(cols[4]).text().trim(),
        enemyPlayer: $(cols[3]).text().trim(),
      };
      if (entry.event !== SortieEvent.Other) {
        events.push(entry);
      }
    });
    return events;
  }

  private formatDate(date: string) {
    const match = date.match('(\\d*)\\.(\\d*)\\.(\\d*) - (.*)');
    if (!match)
      throw new Error('can\'t parse time string: ' + date);
    const formattedDate = `${match[3]}-${match[2]}-${match[1]} ${match[4]}`;
    return formattedDate;
  }

  private transformToCommonEvent = (event: string): SortieEvent => {
    switch (event) {
      case 'takeoff': return SortieEvent.TakeOff;
      case 'WAS SHOTDOWN': return SortieEvent.WasShotdown;
      case 'end': return SortieEvent.End;
      case 'SHOTDOWN': return SortieEvent.ShotdownEnemy;
      case 'DESTROYED': return SortieEvent.DestroyedGroundTarget;
      case 'DIED': return SortieEvent.WasKilled;
      case 'KILLED': return SortieEvent.Killed;
      case 'BAILOUT': return SortieEvent.Bailed;
      case 'crashed': return SortieEvent.Crashed;
      default: return SortieEvent.Other;
    }
  }
}

// new KotaPlayerStatsScraper({} as Db).run('=GEMINI=').then(() => console.log('== done =='));
// npm run test-scraper