import { NextFunction, Request, Response } from 'express';
import { IServices } from '../../models/i-services';
import { Route } from '../../utils';
import { getLatestDeaths, getLatestKills } from './sorties.handlers';

export default [
  {
    handler: (services: IServices) => async (req: Request, res: Response, next: NextFunction) => {
      await getLatestKills(services)(req, res, next);
    },
    method: 'get',
    path: '/api/sorties/latestKills',
  },
  {
    handler: (services: IServices) => async (req: Request, res: Response, next: NextFunction) => {
      await getLatestDeaths(services)(req, res, next);
    },
    method: 'get',
    path: '/api/sorties/latestDeaths',
  },
] as Route[];
