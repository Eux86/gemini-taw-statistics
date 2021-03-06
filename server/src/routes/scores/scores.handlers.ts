import { Request, RequestHandler, Response } from 'express';
import { IServices } from '../../models/i-services';
import { transformIPlayerScoresToDto, transformIScoresByDateToDto } from '../../transformers';
import { IPlayerScores } from '../../models/player-scores';

export const getScoresFiltered = (services: IServices): RequestHandler => async (request: Request, response: Response) => {
  const {
    scores
  } = services;
  console.log('params', request.query);
  const killsScores = await scores.getScoresFiltered({
    startDate: request.query?.startDate,
    endDate: request.query?.endDate,
    playerName: request.query?.playerName,
    serverCode: request.query?.serverCode,
    eventType: request.query?.eventType,
  });
  const scoresDto = killsScores.map(transformIScoresByDateToDto);
  response.send(JSON.stringify(scoresDto, null, 2));
}

export const getCsv = (services: IServices): RequestHandler => async (_: Request, response: Response) => {
  const {
    scores
  } = services;
  const playersScores = await scores.getAllScores();
  const csvHeader: string = Object.keys(playersScores[0]).join(';');
  const csvBody: string = playersScores.map((scoresInt: IPlayerScores) => Object.values(scoresInt).join(';')).join('\n');
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

export const getAvailablePlayers = (services: IServices): RequestHandler => async (_: Request, response: Response) => {
  const {
    scores
  } = services;
  const players = await scores.getAvailablePlayers();
  response.send(JSON.stringify(players));
};
