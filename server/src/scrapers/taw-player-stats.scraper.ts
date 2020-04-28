import cheerio from 'cheerio';
import { IScraper } from '../collector';
import { Db } from '../database/db';
import { SortiesTable } from '../database/tables/sorties';
import { SortiesEventsTable as SortieEventsTable } from '../database/tables/sorties-events';
import { ISortie, ISortieEvent } from './models/common';
import { getPageContent, createHash } from './utils';
import { SortieEvent } from '../enums/sortie-event';


export class TawPlayerStatsScraper implements IScraper {
  id = 'taw-player-stats';
  sortiesTable: SortiesTable;
  sortieEventsTable: SortieEventsTable;
  try: number = 0;
  maxTry: number = 6;

  constructor(db: Db) {
    this.sortiesTable = new SortiesTable(db);
    this.sortieEventsTable = new SortieEventsTable(db);
  }

  run = async (squadronName: string): Promise<undefined> => {
    let sorties = undefined;
    let done = false;
    do {
      try {
        console.log('Collecting sorties from TAW');
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
    console.log('TAW sorties collected');
    return;
  }

  private collect = async (squadronName: string): Promise<ISortie[]> => {
    const data = await getPageContent(`https://taw.stg2.de/squad_stats.php?name=${squadronName}`);
    const playerPages = this.getSquadronPlayersPagesUrls(data);
    let sorties: ISortie[] = [];
    console.log(`Loading sorties for ${playerPages.length} players`);
    for (let i = 0; i < playerPages.length; i++) {                                                                     // playerPages.length
      console.log(`Getting sorties for: ${playerPages[i]}`);
      const playersSorties = await this.getPlayersSorties(`https://taw.stg2.de/${playerPages[i]}`);
      sorties = sorties.concat(playersSorties);
    }
    return sorties;
  }

  private store = async (sorties: ISortie[]): Promise<void> => {
    console.log(`Adding ${sorties.length} entries`);
    for (let i = 0; i < sorties.length; i++) {
      const sortieInfo = sorties[i];
      console.log('adding sortie', sortieInfo.hash);
      try {
        await this.sortiesTable.add({
          hash: sortieInfo.hash,
          aircraft: sortieInfo.aircraft,
          landedat: sortieInfo.landedAt || '',
          playername: sortieInfo.playerName,
          servercode: 'taw',
          sortiedate: sortieInfo.sortieDateString,
          takeoffat: sortieInfo.takeOffAt,
        })
        console.log('Added', sortieInfo.hash);

        console.log('Adding sortie events:');
        for (let k = 0; k < sortieInfo.events.length; k++) {
          const currentEvent = sortieInfo.events[k];
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
          console.log(`Sortie ${sortieInfo.hash} already exist, skipping.`);
        } else {
          throw new Error(error);
        }
      }
    }
  }

  private getSquadronPlayersPagesUrls = (data: string): string[] => {
    const pagesUrl: string[] = [];
    const $ = cheerio.load(data);
    const selector = '#page-wrapper > div > div:nth-child(3) > div.col-lg-8.col-md-8 > div:nth-child(2) > table > tbody > tr';
    $(selector).each((index, el) => {
      if (index === 0) return;    // The first line is the table header
      const url = $(el).attr('data-href');
      if (!url) throw new Error('Cannot parse sortie player page URL');
      pagesUrl.push(url);
    });
    return pagesUrl;
  }

  private getPlayersSorties = async (url: string): Promise<ISortie[]> => {
    const data = await getPageContent(url);
    const playerSortiesUrls: string[] = [];
    const $ = cheerio.load(data);
    const sortiesSelector = '#page-wrapper > div:nth-child(8) > div.col-lg-8.col-md-8 > div.table-responsive > table > tbody > tr';
    $(sortiesSelector).each((index, el) => {
      const sortieUrl = $(el).find('td > a').attr('href');
      if (!sortieUrl) throw new Error('Cannot parse sortie URL');
      playerSortiesUrls.push(sortieUrl);
    });

    console.log(`parsing ${playerSortiesUrls.length} sorties`);
    const playerSortiesDetails: ISortie[] = [];
    for (let i = 0; i < playerSortiesUrls.length; i++) {
      const sortieUrl = playerSortiesUrls[i];
      const sortieDetails = await this.getSortieDetails(`https://taw.stg2.de/${sortieUrl}`);
      playerSortiesDetails.push(sortieDetails);
    }
    return playerSortiesDetails;
  }

  private getSortieDetails = async (url: string): Promise<ISortie> => {
    const data = await getPageContent(url);
    const $ = cheerio.load(data);
    const selector = '#page-wrapper > div:nth-child(1) > div:nth-child(2) > div > h4';
    const flightInfoDirty = $(selector).html();
    const aircraft = flightInfoDirty?.match('Aircraft: (.*?)\<br\>')?.[1] || 'not parsed';
    const takeOffAt = flightInfoDirty?.match('Took off from: (.*?)\<br\>')?.[1] || 'not parsed';
    const landedAt = flightInfoDirty?.match('Landed at: (.*?)\<br\>')?.[1];
    const ditched = flightInfoDirty?.match('DITCHED in sector: (.*?)\<br\>')?.[1];

    const detailsSelector = '#page-wrapper > div:nth-child(1) > div:nth-child(3) > div > table > tbody > tr';
    const events: ISortieEvent[] = [];
    $(detailsSelector).each((index, el) => {
      if (index === 0) return;    // The first line is the table header
      const cols = $(el).find('td');
      const date = $(cols[0]).text().trim();
      const formattedDate = this.formatDate(date);
      const object = $(cols[3]).text().trim();
      const type = $(cols[4]).text().trim();
      const entry: ISortieEvent = {
        sortieHash: 0,
        date: formattedDate,
        event: this.transformToCommonEvent($(cols[1]).text().trim()),
        target: (type.toLowerCase() === 'plane') ? object : type || object,
        enemyPlayer: $(cols[5]).text().trim(),
      }
      if (entry.event !== SortieEvent.Other) {
        events.push(entry);
      }
    });
    const sortieDateString = events[0].date;

    const playerNameSelector = '#page-wrapper > div:nth-child(1) > div:nth-child(1) > div > h1 > a';
    const playerName = $(playerNameSelector).text().trim();

    const hash = createHash(`${sortieDateString}${playerName}taw`);
    events.forEach(event => event.sortieHash = hash);

    const sortiesInfo: ISortie = ({
      hash,
      playerName,
      sortieDateString,
      aircraft,
      takeOffAt,
      landedAt,
      ditched,
      events,
    });
    return sortiesInfo;
  }

  private transformToCommonEvent = (event: string): SortieEvent => {
    switch (event) {
      case 'TOOK OFF': return SortieEvent.TakeOff;
      case 'WAS SHOT DOWN': return SortieEvent.WasShotdown;
      case 'END': return SortieEvent.End;
      case 'SHOT DOWN': return SortieEvent.ShotdownEnemy;
      case 'DESTROYED': return SortieEvent.DestroyedGroundTarget;
      case 'WAS KILLED': return SortieEvent.WasKilled;
      case 'KILLED': return SortieEvent.Killed;
      case 'CRASHED': return SortieEvent.Crashed;
      case 'EJECTED': return SortieEvent.Bailed;
      default: return SortieEvent.Other;
    }
  }

  private formatDate(date: string) {
    const match = date.match('(\\d*)\\.(\\d*)\\.(\\d*) (.*)');
    if (!match)
      throw new Error('can\'t parse time string');
    const formattedDate = `${match[3]}-${match[2]}-${match[1]} ${match[4]}`;
    return formattedDate;
  }
}

// new TawPlayerStatsScraper().run('=GEMINI=').then(data => console.log(JSON.stringify(data, null, 2)));
// npm run test-scraper