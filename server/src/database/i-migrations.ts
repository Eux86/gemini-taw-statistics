export interface IMigration {
  up: () => string;
}