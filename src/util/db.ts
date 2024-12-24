import * as fs from "fs/promises";
import {
  FileMigrationProvider,
  Kysely,
  Migrator,
  NO_MIGRATIONS,
  PostgresDialect,
} from "kysely";
import * as path from "path";
import { Pool } from "pg";
import { GfNeoTables } from "./type";

export type GfNeoDb = Kysely<GfNeoTables>;

export const migrateToLatest = async () => {
  const db = getDb();
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, "../../migrations"),
    }),
  });
  await migrator.migrateToLatest();
};

let singletonDb: GfNeoDb | undefined;

export const getDb = (fresh = false) => {
  if (!singletonDb || fresh) {
    singletonDb = new Kysely<GfNeoTables>({
      dialect: new PostgresDialect({
        pool: new Pool({
          database: process.env.DB_NAME,
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
        }),
      }),
    });
  }
  return singletonDb;
};

export const clearDb = async () => {
  const db = getDb(true);
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, "../../migrations"),
    }),
  });
  await migrator.migrateTo(NO_MIGRATIONS);
};
