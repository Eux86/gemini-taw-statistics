import { IMigration } from "../i-migrations";

export default {
  up: () =>
    `
    TRUNCATE sorties;
    DROP TABLE sortieevents;
    CREATE TABLE sortieevents(
      id SERIAL PRIMARY KEY NOT NULL,
      sortieHash INTEGER NOT NULL,
      event TEXT NOT NULL,
      target TEXT,
      enemyPlayer TEXT,
      date TEXT NOT NULL
    );
    `
} as IMigration;