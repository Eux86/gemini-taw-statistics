import { NextFunction, Request, Response } from 'express';
import { IServices } from '../../models/i-services';
import { Route } from '../../utils';
import { getAvailableMonths, getAvailableServers, getCsv, getLatestScores, getScoresFiltered, getAvailablePlayers } from './scores.handlers';

export default [
  {
    handler: (services: IServices) => async (req: Request, res: Response, next: NextFunction) => {
      await getScoresFiltered(services)(req, res, next);
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
  {
    handler: (services: IServices) => async (req: Request, res: Response, next: NextFunction) => {
      await getAvailablePlayers(services)(req, res, next);
    },
    method: 'get',
    path: '/api/scores/availablePlayers',
  },
] as Route[];
