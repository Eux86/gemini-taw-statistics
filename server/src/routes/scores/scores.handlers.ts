import { Request, RequestHandler, Response } from 'express';
import { IServices } from '../../business-models/i-services';
import { transformIPlayerScoresToDto, transformIPlayerKillInfoToDto } from '../../transformers';
import { IPlayerScores } from '../../business-models/player-scores';

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

export const getAvailableMonths = (services: IServices): RequestHandler => async (_: Request, response: Response) => {
  const {
    scores
  } = services;
  const months = await scores.getAvailableMonths();
  response.send(JSON.stringify(months));
};

export const getAvailableServers = (services: IServices): RequestHandler => async (_: Request, response: Response) => {
  const {
    scores
  } = services;
  const months = await scores.getAvailableServers();
  response.send(JSON.stringify(months));
};
