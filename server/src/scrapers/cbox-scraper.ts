import cheerio from 'cheerio';
import { IPlayerScores } from '../business-models/player-scores';
import { IScraper } from '../collector';
import { getPageContent } from './utils';

export class CboxScraper implements IScraper {
  id = 'cbox';

  getScoresBySquadron = async (squadronName: string): Promise<IPlayerScores[]> => {
    const data = await getPageContent(`https://combatbox.net/en/pilots/10/${squadronName}/`);
    const parsed = await this.parseSquadronScores(data);
    return parsed;
  }

  private parseSquadronScores = async (data: string): Promise<IPlayerScores[]> => {
    const scores: IPlayerScores[] = [];
    let $ = cheerio.load(data);
    const selector = '#player > div > div.content_table .row';

    let pilotPageUrls: string[] = [];

    $(selector).each((index, el) => {
      const detailsPageUrl = $(el).attr('href');
      pilotPageUrls.push(detailsPageUrl || '');
    });

    for (let i = 0; i < pilotPageUrls.length; i++) {
      const url: string = pilotPageUrls[i];
      const pilotPage = await getPageContent(`https://combatbox.net${url}`);
      $ = cheerio.load(pilotPage);
      const nameSelector = 'head > title';
      const name = $(nameSelector).text().trim().replace(' / COMBAT BOX (IL2 stats)', '');
      const airKillsSelector = '#player > div > div.profile_main_stats > div:nth-child(1) > div.num';
      const airKills = $(airKillsSelector).text().trim()
      const groundKillsSelector = '#player > div > div.profile_main_stats > div:nth-child(3) > div.num';
      const groundKills = $(groundKillsSelector).text().trim();
      const streakAkSelector = '#player > div > div.profile_main_stats > div:nth-child(2) > div.num';
      const streakAk = $(streakAkSelector).text().trim();
      const streakGkSelector = '#player > div > div.profile_main_stats > div:nth-child(4) > div.num';
      const streakGk = $(streakGkSelector).text().trim();
      const deathsSelector = '#player > div > div:nth-child(5) > div:nth-child(6) > div.num';
      const deaths = $(deathsSelector).text().trim();
      const sortiesSelector = '#player > div > div:nth-child(5) > div:nth-child(3) > div.num';
      const sorties = $(sortiesSelector).text().trim();
      const flightTimeSelector = '#player > div > div.profile_main_stats > div:nth-child(5) > div.num';
      const flightTime = $(flightTimeSelector).text().trim();
      const entry: IPlayerScores = {
        name: name,
        airKills: +airKills,
        groundKills: +groundKills,
        streakAk: +streakAk,
        streakGk: +streakGk,
        deaths: +deaths,
        sorties: +sorties,
        flightTimeMinutes: this.parseTimeToMinutes(flightTime),
        serverCode: 'cbox',
      }
      scores.push(entry);
    }
    return scores;
  }

  private parseTimeToMinutes = (timeString: string): number => {
    const hoursMatcher = timeString.match(/(\d*):\d*/);
    const minutesMatcher = timeString.match(/\d*:(\d*)/);
    const hours = hoursMatcher ? +hoursMatcher[1] : 0;
    const minutes = minutesMatcher ? +minutesMatcher[1] : 0;
    return (hours * 60) + minutes;
  }
}

// new CboxScraper().getScoresBySquadron('=GEMINI=').then(data => console.log(data));
// npm run test-scraper