import { IMigration } from "../i-migrations";

export default {
  up: () =>
    `
    CREATE TABLE migrations (
      id SERIAL PRIMARY KEY NOT NULL,
      version INT,
      lastUpdate TIMESTAMP DEFAULT now()
    );
    INSERT INTO migrations (id, version, lastUpdate)
    VALUES ('1', 0, now());
    `
} as  IMigration;