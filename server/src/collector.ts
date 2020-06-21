import { Db } from "./database/db";
import { MigrationsHandler } from "./database/migrations-handler";
import { ScoresTable } from "./database/tables/scores";
import { UpdatesLogsTable } from "./database/tables/updates-log";
import { IPlayerScores } from "./models/player-scores";
import { CboxPlayerStatsScraper } from "./scrapers/cbox-player-stats.scraper";
import { TawPlayerStatsScraper } from "./scrapers/taw-player-stats.scraper";
import { WolPlayerStatsScraper } from "./scrapers/wol-player-stats.scraper";
import { ItawPlayerStatsScraper } from "./scrapers/itaw-player-stats.scraper";

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
  private db: Db;

  private scheduledScrapers: IScheduledScraper[];

  constructor(db: Db, scoresTable: ScoresTable, updatesLogsTable: UpdatesLogsTable) {
    this.db = db;

    this.scheduledScrapers = [
      // {
      //   scraper: new TawPlayerStatsScraper(this.db),
      //   lastUpdate: new Date(0),
      //   nextUpdate: undefined,
      // },
      // {
      //   scraper: new CboxPlayerStatsScraper(this.db),
      //   lastUpdate: new Date(0),
      //   nextUpdate: undefined,
      // },
      // {
      //   scraper: new WolPlayerStatsScraper(this.db),
      //   lastUpdate: new Date(0),
      //   nextUpdate: undefined,
      // },
      {
        scraper: new ItawPlayerStatsScraper(this.db),
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
    console.log('Collecting data from servers');
    const collectedScores = await this.collect();
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
}

const db = new Db();
db.connect();
new MigrationsHandler(db);
const collector = new Collector(db, new ScoresTable(db), new UpdatesLogsTable(db));
collector.start(1);
