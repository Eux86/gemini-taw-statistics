import { TawScraper } from "./taw-scraper";
import { IPlayerScores } from "../business-models/player-scores";
import { Db, Operation } from "../database/db";
import { CboxScraper } from "./cbox-scraper";
import { MigrationsHandler } from "../database/migrations-handler";
import { ScoresTable, IScoresTable } from "../database/tables/scores";


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
  constructor(scoresTable: ScoresTable) {
    this.scoresTable = scoresTable;
    this.test()
  }

  private async test() {
    const collectedScores = await this.collect();
    console.log(JSON.stringify(collectedScores, null, 2));    //testing
    await this.store(collectedScores);
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

  private store = async (scrapersResults: IScraperResults[]): Promise<void[]> => {
    const scores = scrapersResults.reduce<IPlayerScores[]>((accumulator, scraperResult) => accumulator.concat(scraperResult.result), []);
    return this.scoresTable.executeTransaction<any>(
      ...scores.map((playerScore: IPlayerScores): Operation<any> => () => this.scoresTable.add(playerScore as IScoresTable))
    );
  }
}

const db = new Db();
db.connect();
new MigrationsHandler(db);
new Collector(new ScoresTable(db));