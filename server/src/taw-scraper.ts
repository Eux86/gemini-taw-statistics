import https from 'https';
import cheerio from 'cheerio';
import { IPlayerScores } from './business-models/player-scores';

export class TawScraper {
  getScoresBySquadron = async (squadronName: string): Promise<IPlayerScores[]> => {
    return new Promise((resolve, reject) => {

      https.get(`https://taw.stg2.de/squad_stats.php?name=${squadronName}`, (resp: any) => {
        let data = '';
        resp.on('data', (chunk: any) => {
          data += chunk;
        });
        resp.on('end', () => {
          const parsed = this.parseSquadronScores(data);
          resolve(parsed);
        });
      }).on("error", (err: any) => {
        reject("Error: " + err.message);
      });
    })
  }

  private parseSquadronScores = (data: string): IPlayerScores[] => {
    const scores: IPlayerScores[] = [];
    const $ = cheerio.load(data);
    const selector = '#page-wrapper > div > div:nth-child(3) > div.col-lg-8.col-md-8 > div:nth-child(2) > table > tbody > tr';
    $(selector).each((index, el) => {
      if (index===0) return;    // The first line is the table header
      const cols = $(el).find('td');
      const entry: IPlayerScores = {
        name: $(cols[0]).text().trim(),
        airKills: +$(cols[2]).text().trim(),
        groundKills: +$(cols[3]).text().trim(),
        streakAk: +$(cols[4]).text().trim(),
        streakGk: +$(cols[5]).text().trim(),
        deaths: +$(cols[6]).text().trim(),
        sorties: +$(cols[7]).text().trim(),
        flightTimeMinutes: this.parseTimeToMinutes($(cols[8]).text()),
      }
      scores.push(entry);
    });
    return scores;
  }

  private parseTimeToMinutes = (timeString: string): number => {
    const hoursMatcher = timeString.match(/(\d*)h.*/);
    const minutesMatcher = timeString.match(/(\d*)m.*/);
    const hours = hoursMatcher ? +hoursMatcher[1] : 0;
    const minutes = minutesMatcher ? +minutesMatcher[1] : 0;
    return (hours * 60) + minutes;
  }
}