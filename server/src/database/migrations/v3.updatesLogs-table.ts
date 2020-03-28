import { IMigration } from "../i-migrations";

export default {
  up: () =>
    `
    CREATE TABLE updatesLog(
      id SERIAL PRIMARY KEY NOT NULL,
      serverCode TEXT,
      updateDate TIMESTAMP DEFAULT now()
   );
    `
} as  IMigration;