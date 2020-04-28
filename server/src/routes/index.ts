import testRoute from './test/test.route';
import scoresRoutes from './scores/scores.routes';
import sortiesRoutes from './events/events.routes';

export default [
  ...testRoute,
  ...sortiesRoutes,
  ...scoresRoutes,
];
