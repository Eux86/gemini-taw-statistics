const https = require('https');
const http = require('http');
const cheerio = require('cheerio');
const express = require('express');

https.get('https://taw.stg2.de/squad_stats.php?name==GEMINI=', (resp) => {
  let data = '';

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    parse(data);
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});

const scores = [];

const parse = (data) => {
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
  console.log(scores);
}


const router = express();
router['get']('/all', (req, res) => {
  return res.send(JSON.stringify(scores));
});

const { PORT = 3001 } = process.env;
const server = http.createServer(router);

server.listen(PORT, () => {
  console.log(`Server is running at port:${PORT}...`);
});