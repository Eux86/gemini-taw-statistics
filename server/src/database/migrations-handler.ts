import * as path from 'path';
import * as fs from 'fs';
import { IMigration } from './i-migrations';
import { Db } from './db';
import { MigrationsTable, IMigrationsTable } from './tables/migrations';

interface IMigrationEntry { version: number; migration: IMigration, name: string }

export class MigrationsHandler {
  migrationEntries: IMigrationEntry[] = [];
  migrationFilesPattern = '^v(\\d*)\\.(.*)(.js)$';
  migrationsInfo: IMigrationsTable = { id: '0', lastUpdate: '', version: -1 };
  migrationsTable: MigrationsTable;
  db: Db;

  constructor(db: Db) {
    console.log('Initializing Migrations Handler');
    this.db = db;
    this.migrationsTable = new MigrationsTable(db);
    this.getMigrationsInfo().then(() => {
      console.log(this.migrationsInfo);
      this.loadMigrations();
    });
  }

  private getMigrationsInfo = async () => {
    let migrationsInfo: IMigrationsTable | undefined = undefined;
    try {
      migrationsInfo = await this.migrationsTable.getById('1');
      this.migrationsInfo = migrationsInfo;
    } catch {
      console.log('No migrations table found: First run');
    }
  }

  private loadMigrations = () => {
    const directoryPath = path.join(__dirname, 'migrations');
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        return console.log('Unable to scan directory: ' + err);
      }
      this.migrationEntries = files.filter((file: string) => file.match(this.migrationFilesPattern)).map((file) => {
        const [, version, name] = Array.from(file.match(this.migrationFilesPattern) || []);
        console.log(`Loading migration: ${name} version ${version}`);
        const instance = require(`${directoryPath}/${file}`).default;
        return {
          version: +version,
          migration: instance,
          name: name,
        };
      });
      this.execute();
    });
  }

  private execute = async () => {
    console.log(this.migrationEntries);
    const toExecute = this.migrationEntries.filter((entry: IMigrationEntry) => entry.version > this.migrationsInfo.version);
    if (toExecute.length === 0) {
      console.log('No new migrations to execute.');
      return;
    }
    const sortedMigrations = [...toExecute].sort((a: IMigrationEntry, b: IMigrationEntry) => a.version - b.version);
    await Promise.all(sortedMigrations.map(async (migrationEntry: IMigrationEntry) => {
      console.log(`Executing migration ${migrationEntry.name} v${migrationEntry.version}`);
      await this.db.query(migrationEntry.migration.up());
    }));
    const currentMaxVersion = this.migrationEntries.reduce((max: number, entry: IMigrationEntry) => max < entry.version ? entry.version : max, 0);
    await this.migrationsTable.update({
      lastUpdate: `now()`,
      version: currentMaxVersion,
    }, 'id = 1');
  }

}