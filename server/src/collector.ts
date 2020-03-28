import { TawScraper } from "./scrapers/taw-scraper";
import { IPlayerScores } from "./business-models/player-scores";
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
    this.test()
  }

  private async test() {
    console.log('Collecting data from servers');
    const collectedScores = await this.collect();
    console.log('Storing data');
    await this.store(collectedScores);
    console.log('done');
  }

  private collect(): Promise<{
    scheduledScraper: IScheduledScraper;
    result: IPlayerScores[];
  }[]> {
    const results = Promise.all(scheduledScrapers.map(async (scheduledScraper: IScheduledScraper) => {
      const result = await scheduledScraper.scraper.getScoresBySquadron('=GEMINI=');
      scheduledScraper.lastUpdate = new Date(Date.now());
      return { scheduledScraper, result };
    }));
    return results;
  }

  private store = async (scrapersResults: IScraperResults[]) => {

    const scores = scrapersResults.reduce<IPlayerScores[]>((accumulator, scraperResult) => accumulator.concat(scraperResult.result), []);
    const results = this.db.executeTransaction<QueryResult<IUpdatesLogsTable | IScoresTable>>(
      ...scores.map((playerScore: IPlayerScores) => () => this.scoresTable.add(playerScore as IScoresTable)),
      () => this.updatesLogsTable.add({ serverCode: 'all' }),
    );
    return results;
  }
}

const db = new Db();
db.connect();
new MigrationsHandler(db);
new Collector(db, new ScoresTable(db), new UpdatesLogsTable(db));