import { Db } from "./database/db";
import { MigrationsHandler } from "./database/migrations-handler";
import { ScoresTable, IScoresTable } from "./database/tables/scores";
import { UpdatesLogsTable, IUpdatesLogsTable } from "./database/tables/updates-log";
import { IPlayerScores } from "./models/player-scores";
import { TawScraper } from './scrapers/taw-scraper';
import { CboxScraper } from './scrapers/cbox-scraper';
import { QueryResult } from "pg";
import { CboxPlayerStatsScraper } from "./scrapers/cbox-player-stats.scraper";
import { TawPlayerStatsScraper } from "./scrapers/taw-player-stats.scraper";

interface IScheduledScraper {
  scraper: IScraper,
  lastUpdate: Date,
  nextUpdate?: Date,
}

interface IScraperResults {
  scheduledScraper: IScheduledScraper;
  result?: IPlayerScores[];
}

export interface IScraper {
  id: string;
  run: (squadronName: string) => Promise<undefined | IPlayerScores[]>
}

export class Collector {
  private scoresTable: ScoresTable;
  private updatesLogsTable: UpdatesLogsTable;
  private db: Db;

  private scheduledScrapers: IScheduledScraper[];

  constructor(db: Db, scoresTable: ScoresTable, updatesLogsTable: UpdatesLogsTable) {
    this.db = db;
    this.scoresTable = scoresTable;
    this.updatesLogsTable = updatesLogsTable;

    this.scheduledScrapers = [
      {
        scraper: new TawScraper(),
        lastUpdate: new Date(0),
        nextUpdate: undefined,
      },
      {
        scraper: new CboxScraper(),
        lastUpdate: new Date(0),
        nextUpdate: undefined,
      },
      {
        scraper: new TawPlayerStatsScraper(this.db),
        lastUpdate: new Date(0),
        nextUpdate: undefined,
      },
      {
        scraper: new CboxPlayerStatsScraper(this.db),
        lastUpdate: new Date(0),
        nextUpdate: undefined,
      },
    ];
  }

  public start = (updateFrequencyInHours: number) => {
    this.run();

    // Remember: this won't work on Heroku since the dino will go down after 30 minutes of inactivity
    // The dino is waken up at night using https://cron-job.org/, so it should run the collector at that time
    const self = this;
    setInterval(() => self.run(), updateFrequencyInHours * 60 * 36000);
  }

  private run = async () => {
    // console.log('Only collecting between 7 and 9 am');
    // const d = new Date();
    //if (!(d.getHours() > 7 && d.getHours() < 9)) {
    //  console.log('Not collecting');
    //  return;
    //}
    console.log('Collecting data from servers');
    const collectedScores = await this.collect();
    if (await this.shouldStore()) {
      console.log('Storing data');
      await this.store(collectedScores);
    }
    console.log('done');
  }

  private collect = async (): Promise<IScraperResults[]> => {
    const results = Promise.all(this.scheduledScrapers.map(async (scheduledScraper: IScheduledScraper) => {
      const result = await scheduledScraper.scraper.run('=GEMINI=');
      scheduledScraper.lastUpdate = new Date(Date.now());
      return { scheduledScraper, result };
    }));
    return results;
  }

  private shouldStore = async (): Promise<boolean> => {
    const latestUpdate = await this.updatesLogsTable.getLatestUpdate();
    const hourDay = 1000 * 60 * 60 * 24;
    const dayAgo = new Date(Date.now() - hourDay);

    console.log(`Last update: ${latestUpdate}`);
    console.log(`Current date: ${new Date(Date.now())}`);
    const shouldStore = latestUpdate < dayAgo;
    console.log(`${shouldStore ? '' : 'Not'} storing`);
    return latestUpdate < dayAgo;
  }

  private store = async (scrapersResults: IScraperResults[]) => {
    const scores = scrapersResults.reduce<IPlayerScores[]>((accumulator, scraperResult) => {
      if (scraperResult.result) {
        return accumulator.concat(scraperResult.result);
      }
      return accumulator;
    }, []);
    const results = this.db.executeTransaction<QueryResult<IUpdatesLogsTable | IScoresTable>>(
      ...scores.map((playerScore: IPlayerScores) => () => this.scoresTable.add(playerScore as IScoresTable)),
      () => this.updatesLogsTable.add({ servercode: 'all' }),
    );
    return results;
  }
}

const db = new Db();
db.connect();
new MigrationsHandler(db);
const collector = new Collector(db, new ScoresTable(db), new UpdatesLogsTable(db));
collector.start(1);
