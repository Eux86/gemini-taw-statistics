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
    .then((val: IPlayerScores[]) => scores = val);
}

update();

// const db = new Db();
// db.connect();
// db.dropTawTable();

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