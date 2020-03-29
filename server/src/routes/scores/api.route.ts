import { Request, Response, NextFunction } from 'express';
import { Route } from '../../utils';
import { getScores, getCsv } from './api.handler';
import { IServices } from '../../models/i-services';

export default [
  {
    handler: (services: IServices) => async (req: Request, res: Response, next: NextFunction) => {
      await getScores(services)(req, res, next);
    },
    method: 'get',
    path: '/api/scores',
  },
  {
    handler: (services: IServices) => async (req: Request, res: Response, next: NextFunction) => {
      await getCsv(services)(req, res, next);
    },
    method: 'get',
    path: '/api/scores/csv',
  },
] as Route[];
