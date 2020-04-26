require('dotenv').config()
const http = require('http');
const path = require('path');
const expAutoSan = require('express-autosanitizer');
import express from 'express';
import { Db } from './database/db';
import { ScoresService } from './services/scores';
import routes from './routes';
import { applyRoutes } from './utils';
import { IServices } from './models/i-services';
import { ScoresTable } from './database/tables/scores';
import { SortiesService } from './services/sorties';
import { SortiesTable } from './database/tables/sorties';

// ############ INITIALIZE STACK #####################
const db = new Db();
db.connect();
const scoresTable = new ScoresTable(db);
const sortiesTable = new SortiesTable(db);
const services: IServices = {
  scores: new ScoresService(scoresTable, sortiesTable),
  sorties: new SortiesService(sortiesTable),
}
// ####################################################

const router = express();
router.use(expAutoSan.allUnsafe);
applyRoutes(routes, router, services);

// ############### HOME PAGE (TO REMOVE FROM HERE) ################
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/../../client/build/index.html'));
});
router.use(express.static(path.join(__dirname, '../../client/build')));


// ############## SERVER STARTUP ##############
const { PORT = 8080 } = process.env;
const server = http.createServer(router);

server.listen(PORT, () => {
  console.log(`Server is running at port:${PORT}...`);
});
// ###########################################