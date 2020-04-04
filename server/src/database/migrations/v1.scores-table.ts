import { IMigration } from "../i-migrations";

export default {
  up: () =>
    `
    CREATE TABLE scores(
      ID SERIAL PRIMARY KEY NOT NULL,
      name TEXT,
      airkills INT,
      groundkills INT,
      streakAK INT,
      streakGk INT,
      deaths INT,
      sorties INT,
      flightTimeMinutes INT,
      serverCode TEXT,
      updateDate TIMESTAMP DEFAULT now()
   );
    `
} as  IMigration;