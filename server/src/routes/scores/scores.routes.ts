import { Request, Response, NextFunction } from 'express';
import { Route } from '../../utils';
import { getScores, getCsv, getLatestScores, getAvailableMonths, getAvailableServers, getKillsByDate, getDeathsByDate, getGroundKillsByDate } from './scores.handlers';
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
      await getKillsByDate(services)(req, res, next);
    },
    method: 'get',
    path: '/api/scores/killsByDate',
  },
  {
    handler: (services: IServices) => async (req: Request, res: Response, next: NextFunction) => {
      await getDeathsByDate(services)(req, res, next);
    },
    method: 'get',
    path: '/api/scores/deathsByDate',
  },
  {
    handler: (services: IServices) => async (req: Request, res: Response, next: NextFunction) => {
      await getGroundKillsByDate(services)(req, res, next);
    },
    method: 'get',
    path: '/api/scores/groundKillsByDate',
  },
] as Route[];
