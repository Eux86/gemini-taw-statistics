import { Request, RequestHandler, Response } from 'express';

export const test: RequestHandler = async (_: Request, response: Response) => {
  response.send('Working');
};
