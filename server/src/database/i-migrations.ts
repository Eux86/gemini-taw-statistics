export interface IMigration {
  up: () => string;
}
// export interface IMigrationCtor {
//   new(): IMigration;
// }