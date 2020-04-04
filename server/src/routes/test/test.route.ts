import { Request, Response, NextFunction } from 'express';
import { Route } from '../../utils';
import { test } from './test.handler';

export default [
  {
    handler: () => async (req: Request, res: Response, next: NextFunction) => {
      await test(req, res, next);
    },
    method: 'get',
    path: '/test',
  },
] as Route[];
