import cheerio from 'cheerio';
import { IScraper } from '../collector';
import { Db } from '../database/db';
import { SortiesTable } from '../database/tables/sorties';
import { SortiesEventsTable as SortieEventsTable } from '../database/tables/sorties-events';
import { ISortie, ISortieEvent } from './models/taw';
import { getPageContent } from './utils';
const readline = require('readline');


export class TawPlayerStatsScraper implements IScraper {
  id = 'taw-player-stats';
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
    } while (!done && this.try < this.maxTry);

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
          sortiedate: sortieInfo.sortieDate,
          takeoffat: sortieInfo.takeOffAt,
        })
        console.log('Added', sortieInfo.hash);

        console.log('Adding sortie events:');
        for (let k = 0; k < sortieInfo.events.length; k++) {
          const currentEvent = sortieInfo.events[k];
          await this.sortieEventsTable.add({
            sortieHash: currentEvent.sortieHash,
            enemyplayer: currentEvent.enemyPlayer,
            event: currentEvent.event,
            object: currentEvent.object,
            type: currentEvent.type,
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
      const match = date.match('(\\d*)\\.(\\d*)\\.(\\d*) (.*)');
      if (!match) throw new Error('can\'t parse time string');
      const formattedDate = `${match[3]}-${match[2]}-${match[1]} ${match[4]}`;
      const entry: ISortieEvent = {
        sortieHash: 0,
        date: formattedDate,
        event: $(cols[1]).text().trim(),
        object: $(cols[3]).text().trim(),
        type: $(cols[4]).text().trim(),
        enemyPlayer: $(cols[5]).text().trim(),
      }
      if (entry.event === 'TOOK OFF'
        || entry.event === 'WAS SHOT DOWN'
        || entry.event === 'END'
        || entry.event === 'SHOT DOWN'
        || entry.event === 'DESTROYED')
        events.push(entry);
    });
    const sortieDate = events[0].date;

    const playerNameSelector = '#page-wrapper > div:nth-child(1) > div:nth-child(1) > div > h1 > a';
    const playerName = $(playerNameSelector).text().trim();

    const hash = this.hash(`${sortieDate}${playerName}`);
    events.forEach(event => event.sortieHash = hash);

    const sortiesInfo: ISortie = ({
      hash,
      playerName,
      sortieDate,
      aircraft,
      takeOffAt,
      landedAt,
      ditched,
      events,
    });
    return sortiesInfo;
  }

  private parseTimeToMinutes = (timeString: string): number => {
    const hoursMatcher = timeString.match(/(\d*)h.*/);
    const minutesMatcher = timeString.match(/(\d*)m.*/);
    const hours = hoursMatcher ? +hoursMatcher[1] : 0;
    const minutes = minutesMatcher ? +minutesMatcher[1] : 0;
    return (hours * 60) + minutes;
  }

  private hash(str: string): number {
    let hash = 0, i, chr;
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
}

// new TawPlayerStatsScraper().run('=GEMINI=').then(data => console.log(JSON.stringify(data, null, 2)));
// npm run test-scraper