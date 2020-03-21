require('dotenv').config()
const https = require('https');
const http = require('http');
const path = require('path');
import express from 'express';
import cheerio from 'cheerio';



const update = () => {
  https.get('https://taw.stg2.de/squad_stats.php?name==GEMINI=', (resp: any) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk: any) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      parse(data);
    });

  }).on("error", (err: any) => {
    console.log("Error: " + err.message);
  });
}

interface IScore {
  name: string;
  airKills: string;
  groundKills: string;
  streakAk: string;
  streakGk: string;
  deaths: string;
  sorties: string;
  flightTime: string;
}
let scores: IScore[] = [];

const parse = (data: string) => {
  scores = [];
  const $ = cheerio.load(data);
  const selector = '#page-wrapper > div > div:nth-child(3) > div.col-lg-8.col-md-8 > div:nth-child(2) > table > tbody > tr';
  $(selector).each((index, el) => {
    const cols = $(el).find('td');
    const entry = {
      name: $(cols[0]).text(),
      airKills: $(cols[2]).text(),
      groundKills: $(cols[3]).text(),
      streakAk: $(cols[4]).text(),
      streakGk: $(cols[5]).text(),
      deaths: $(cols[6]).text(),
      sorties: $(cols[7]).text(),
      flightTime: $(cols[8]).text(),
    }
    scores.push(entry);
  });
}

update();

const router = express();
router.get('/api/taw', (req, res) => {
  update();
  return res.send(JSON.stringify(scores));
});
router.get('/', (req,res) =>{
  res.sendFile(path.join(__dirname+'/../../client/build/index.html'));
});
router.use(express.static(path.join(__dirname, '../../client/build')));

const { PORT = 8080 } = process.env;
const server = http.createServer(router);

server.listen(PORT, () => {
  console.log(`Server is running at port:${PORT}...`);
});