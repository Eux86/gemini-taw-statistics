import { Request, Response, NextFunction } from 'express';
import { Route } from '../../utils';
import { getScores, getCsv, getLatestScores, getAvailableMonths, getAvailableServers, getLatestKills, getLatestDeaths } from './api.handler';
import { IServices } from '../../business-models/i-services';

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
  {
    handler: (services: IServices) => async (req: Request, res: Response, next: NextFunction) => {
      await getLatestScores(services)(req, res, next);
    },
    method: 'get',
    path: '/api/scores/latest',
  },
  {
    handler: (services: IServices) => async (req: Request, res: Response, next: NextFunction) => {
      await getAvailableMonths(services)(req, res, next);
    },
    method: 'get',
    path: '/api/scores/availableMonths',
  },
  {
    handler: (services: IServices) => async (req: Request, res: Response, next: NextFunction) => {
      await getAvailableServers(services)(req, res, next);
    },
    method: 'get',
    path: '/api/scores/availableServers',
  },
  // SHOULD GO INTO ANOTHER ROUTES FILE
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
