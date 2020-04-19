import { IServices } from '../../business-models/i-services';
import { transformIPlayerKillInfoToDto } from '../../transformers';
import { Request, RequestHandler, Response } from 'express';

export const getLatestKills = (services: IServices): RequestHandler => async (_: Request, response: Response) => {
  const {
    sorties,
  } = services;
  const kills = await sorties.getLatestKills();
  const dto = kills.map(transformIPlayerKillInfoToDto);
  response.send(JSON.stringify(dto));
};

export const getLatestDeaths = (services: IServices): RequestHandler => async (_: Request, response: Response) => {
  const {
    sorties,
  } = services;
  const deaths = await sorties.getLatestDeaths();
  const dto = deaths.map(transformIPlayerKillInfoToDto);
  response.send(JSON.stringify(dto));
};
