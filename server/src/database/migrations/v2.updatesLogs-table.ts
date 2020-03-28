import { IMigration } from "../i-migrations";

export default {
  up: () =>
    `
    CREATE TABLE updatesLog(
      ID SERIAL PRIMARY KEY NOT NULL,
      tableName TEXT,
      updateDate TIMESTAMP DEFAULT now()
   );
    `
} as  IMigration;