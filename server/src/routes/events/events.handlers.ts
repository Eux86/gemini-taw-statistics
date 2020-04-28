import { IServices } from '../../models/i-services';
import { transformIPlayerKillInfoToDto } from '../../transformers';
import { Request, RequestHandler, Response } from 'express';

export const getLatest = (services: IServices): RequestHandler => async (request: Request, response: Response) => {
  const {
    sorties,
  } = services;
  const serverCode = request.query?.serverCode;
  const type = request.query?.type;
  const kills = await sorties.getLatest(type, serverCode);
  const dto = kills.map(transformIPlayerKillInfoToDto);
  response.send(JSON.stringify(dto));
};

export const getAvailableMonths = (services: IServices): RequestHandler => async (_: Request, response: Response) => {
  const {
    scores
  } = services;
  const months = await scores.getAvailableMonths();
  response.send(JSON.stringify(months));
};
