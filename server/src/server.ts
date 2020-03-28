require('dotenv').config()
const http = require('http');
const path = require('path');
import express from 'express';
import { IPlayerScores } from './business-models/player-scores';
import { Db } from './database/db';
import { TawController } from './controllers/taw';
import { IPlayerScoresDto } from './dtos/player-scores.dto';

// ############ INITIALIZE STACK #####################
const db = new Db();
const tawController = new TawController(db);
db.connect();
// db.dropTables();
const router = express();
// ####################################################

// ############### ROUTES ##################
router.get('/api/taw/lastYearScores', async (req, res) => {
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