import {
  RequestHandler,
  Router,
} from 'express';
import { IServices } from '../business-models/i-services';

type Wrapper = ((router: Router) => void);

/*
 * Given an instance of express and a list of middleware functions,
 * this functions applies each middleware to the given express instance
 */
export const applyMiddleware = (
  middlewareWrappers: Wrapper[],
  router: Router,
) => {
  for (const wrapper of middlewareWrappers) {
    wrapper(router);
  }
};

export type Route = {
  path: string;
  method: 'get' | 'post';
  handler: (services: IServices) => RequestHandler;
};

export const applyRoutes = (routes: Route[], router: Router, services: IServices) => {
  routes.forEach((route: Route) => {
    const { method, path, handler } = route;
    router[method](path, handler(services));
    console.log(`Route: ${method}: ${path}`);
  });
};