import { IMigration } from "../i-migrations";

export default {
  up: () =>
    `
    ALTER TABLE sorties
    ADD COLUMN url TEXT;
    `
} as IMigration;