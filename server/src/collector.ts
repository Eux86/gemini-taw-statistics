import { TawScraper } from "./scrapers/taw-scraper";
import { IPlayerScores } from "./models/player-scores";
import { Db } from "./database/db";
import { CboxScraper } from "./scrapers/cbox-scraper";
import { MigrationsHandler } from "./database/migrations-handler";
import { ScoresTable, IScoresTable } from "./database/tables/scores";
import { UpdatesLogsTable, IUpdatesLogsTable } from "./database/tables/updates-log";
import { QueryResult } from "pg";


interface IScheduledScraper {
  scraper: IScraper,
  lastUpdate: Date,
  nextUpdate?: Date,
}

interface IScraperResults {
  scheduledScraper: IScheduledScraper;
  result: IPlayerScores[];
}

export interface IScraper {
  id: string;
  getScoresBySquadron: (squadronName: string) => Promise<IPlayerScores[]>
}

const scheduledScrapers: IScheduledScraper[] = [
  {
    scraper: new TawScraper(),
    lastUpdate: new Date(0),
    nextUpdate: undefined,
  },
  {
    scraper: new CboxScraper(),
    lastUpdate: new Date(0),
    nextUpdate: undefined,
  }
];

export class Collector {
  private scoresTable: ScoresTable;
  private updatesLogsTable: UpdatesLogsTable;
  private db: Db;
  constructor(db: Db, scoresTable: ScoresTable, updatesLogsTable: UpdatesLogsTable) {
    this.db = db;
    this.scoresTable = scoresTable;
    this.updatesLogsTable = updatesLogsTable;
  }

  public start = (updateFrequencyInHours: number) => {
    this.run();

    // Remember: this won't work on Heroku since the dino will go down after 30 minutes of inactivity
    const self = this;
    setInterval(() => self.run(), updateFrequencyInHours * 60 * 36000);
  }

  private run = async () => {
    console.log('Collecting data from servers');
    const collectedScores = await this.collect();
    console.log('Storing data');
    if (await this.shouldStore()) {
      console.log('Updating tables');
      await this.store(collectedScores);
    }
    console.log('done');
  }

  private collect = async (): Promise<{
    scheduledScraper: IScheduledScraper;
    result: IPlayerScores[];
  }[]> => {
    const results = Promise.all(scheduledScrapers.map(async (scheduledScraper: IScheduledScraper) => {
      const result = await scheduledScraper.scraper.getScoresBySquadron('=GEMINI=');
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
    return latestUpdate < dayAgo;
  }

  private store = async (scrapersResults: IScraperResults[]) => {
    const scores = scrapersResults.reduce<IPlayerScores[]>((accumulator, scraperResult) => accumulator.concat(scraperResult.result), []);
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
