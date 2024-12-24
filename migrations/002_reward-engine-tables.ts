import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("pool")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("assetType", "text")
    .addColumn("minRate", "float8")
    .addColumn("maxRate", "float8")
    .addColumn("defaultRate", "float8")
    .addColumn("curve", "text")
    .addColumn("eligibility", "text")
    .addColumn("granularity", "text")
    .addColumn("carryover", "boolean")
    .addColumn("budget", "float8")
    .addColumn("burnRateCalculation", "text")
    .execute();

  await db.schema
    .createTable("drawRule")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("requestType", "text")
    .addColumn("draws", "text")
    .addColumn("logic", "text")
    .execute();

  await db.schema
    .createTable("poolStatus")
    .addColumn("poolId", "text")
    .addColumn("active", "boolean")
    .addColumn("budget", "float8")
    .addColumn("burned", "float8")
    .addColumn("createdAt", "bigint")
    .addPrimaryKeyConstraint("poolStatus_PK", ["poolId", "createdAt"])
    .execute();

  await db.schema
    .createTable("windowStatus")
    .addColumn("poolId", "text")
    .addColumn("expectedBurn", "float8")
    .addColumn("burned", "float8")
    .addColumn("createdAt", "bigint")
    .addPrimaryKeyConstraint("windowStatus_PK", ["poolId", "createdAt"])
    .execute();

  await db.schema
    .createTable("poolDraw")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("requestId", "text")
    .addColumn("poolId", "text")
    .addColumn("amount", "float8")
    .addColumn("createdAt", "bigint")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("pool").execute();
  await db.schema.dropTable("drawRule").execute();
  await db.schema.dropTable("poolStatus").execute();
  await db.schema.dropTable("windowStatus").execute();
  await db.schema.dropTable("poolDraw").execute();
}
