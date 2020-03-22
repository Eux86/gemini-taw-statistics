require('dotenv').config()
const https = require('https');
const http = require('http');
const path = require('path');
import express from 'express';
import cheerio from 'cheerio';
import { TawScraper } from './taw-scraper';
import { IPlayerScores } from './business-models/player-scores';
import { Db } from './db';

let scores: IPlayerScores[] = [];

const tawScraper: TawScraper = new TawScraper();
const update = () => {
  tawScraper.getScoresBySquadron('=GEMINI=')
    .then((val: IPlayerScores[]) => {
      scores = val;
      db.getLastUpdateDateForTable('taw')
        .then((lastUpdate?: Date) => {

          const hourDay = 1000 * 60 * 60 * 12;
          const dayAgo = new Date(Date.now() - hourDay);

          console.log(`Last update: ${lastUpdate}`);
          if (lastUpdate && lastUpdate > dayAgo) {
            console.log('Already updated, ignoring');
            return;
          }
          console.log('Data is old. Updating');
          db.addPlayerScores(scores);
        });
    });
}

update();
setInterval(update, 3600000);

const db = new Db();
db.connect();
// db.dropTables(); 

const router = express();
router.get('/api/taw', (req, res) => {
  update();
  return res.send(JSON.stringify(scores));
});
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/../../client/build/index.html'));
});
router.use(express.static(path.join(__dirname, '../../client/build')));

const { PORT = 8080 } = process.env;
const server = http.createServer(router);

server.listen(PORT, () => {
  console.log(`Server is running at port:${PORT}...`);
});