import { NextFunction, Request, Response } from 'express';
import { IServices } from '../../models/i-services';
import { Route } from '../../utils';
import { getLatest } from './events.handlers';

export default [
  {
    handler: (services: IServices) => async (req: Request, res: Response, next: NextFunction) => {
      await getLatest(services)(req, res, next);
    },
    method: 'get',
    path: '/api/events',
  },
] as Route[];
