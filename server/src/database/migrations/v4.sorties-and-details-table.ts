import { IMigration } from "../i-migrations";

export default {
  up: () =>
    `
    CREATE TABLE sorties(
      id SERIAL PRIMARY KEY NOT NULL,
      hash INTEGER UNIQUE NOT NULL,
      serverCode TEXT NOT NULL,
      playerName TEXT NOT NULL,
      sortieDate TEXT NOT NULL,
      aircraft TEXT NOT NULL,
      takeOffAt TEXT NOT NULL,
      landedAt TEXT
    );
    CREATE TABLE sortieevents(
      id SERIAL PRIMARY KEY NOT NULL,
      sortieHash INTEGER NOT NULL,
      event TEXT NOT NULL,
      object TEXT NOT NULL,
      type TEXT,
      enemyPlayer TEXT,
      date TEXT NOT NULL
    );
    `
} as IMigration;