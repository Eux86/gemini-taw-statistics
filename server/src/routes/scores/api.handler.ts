import { Request, RequestHandler, Response } from 'express';
import { IServices } from '../../models/i-services';
import { transformIPlayerScoresToDto } from '../../transformers';
import { IPlayerScores } from '../../models/player-scores';

export const getScores = (services: IServices): RequestHandler => async (_: Request, response: Response) => {
  const {
    scores
  } = services;
  const playersScores = await scores.getAllScores();
  const playersScoresDto = playersScores.map(transformIPlayerScoresToDto);
  response.send(JSON.stringify(playersScoresDto, null, 2));
};

export const getLatestScores = (services: IServices): RequestHandler => async (_: Request, response: Response) => {
  const {
    scores
  } = services;
  const playersScores = await scores.getLatestScores();
  const playersScoresDto = playersScores.map(transformIPlayerScoresToDto);
  response.send(JSON.stringify(playersScoresDto, null, 2));
};

export const getCsv = (services: IServices): RequestHandler => async (_: Request, response: Response) => {
  const {
    scores
  } = services;
  const playersScores = await scores.getAllScores();
  const csvHeader: string = Object.keys(playersScores[0]).join(';');
  const csvBody: string = playersScores.map((scores: IPlayerScores) => Object.values(scores).join(';')).join('\n');
  const csv: string = `${csvHeader}\n${csvBody}`;
  response.setHeader('Content-disposition', 'attachment; filename=scores.csv');
  response.set('Content-Type', 'text/csv');
  response.send(Buffer.from(csv));
};
