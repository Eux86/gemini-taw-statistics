require('dotenv').config()
const https = require('https');
const http = require('http');
const path = require('path');
import express from 'express';
import { TawScraper } from './taw-scraper';
import { IPlayerScores } from './business-models/player-scores';
import { Db } from './db';
import { TawController } from './controllers/taw';
import { IPlayerScoresDto } from './dtos/player-scores.dto';

// ############## SCRAPER TASK ############################
const tawScraper: TawScraper = new TawScraper();
const update = () => {
  tawScraper.getScoresBySquadron('=GEMINI=')
    .then((val: IPlayerScores[]) => {
      db.getLastUpdateDateByTable('taw')
        .then((lastUpdate?: Date) => {

          const hourDay = 1000 * 60 * 60 * 12;
          const dayAgo = new Date(Date.now() - hourDay);

          console.log(`Last update: ${lastUpdate}`);
          if (lastUpdate && lastUpdate > dayAgo) {
            console.log('Already updated, ignoring');
            return;
          }
          console.log('Data is old. Updating');
          db.addPlayersScores(val);
        });
    });
}

update();
setInterval(update, 3600000);
// ########################################################


// ############ INITIALIZE STACK #####################
const db = new Db();
const tawController = new TawController(db);
db.connect();
// db.dropTables();
const router = express();
// ####################################################

// ############### ROUTES ##################
router.get('/api/taw/lastYearScores', async (req, res) => {
  update();
  const scores = await tawController.getLastYearStatistics();
  const scoresDto: IPlayerScoresDto[] = scores.map((score: IPlayerScores) => ({...score, updateDate: score.updateDate?.toUTCString()} as IPlayerScoresDto))
return res.send(JSON.stringify(scoresDto));
});
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/../../client/build/index.html'));
});
router.use(express.static(path.join(__dirname, '../../client/build')));
// ############################################

// ############## SERVER STARTUP ##############
const { PORT = 8080 } = process.env;
const server = http.createServer(router);

server.listen(PORT, () => {
  console.log(`Server is running at port:${PORT}...`);
});
// ###########################################