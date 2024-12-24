import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { addPool } from "../src/service/reward/reward.service";
import { clearDb, getDb, migrateToLatest } from "../src/util/db";

describe("basic", () => {
  beforeAll(async () => {
    await migrateToLatest();
  });
  it("should be able to insert a pool", async () => {
    const db = getDb();
    const id = await addPool(db, {
      assetType: "NEO",
      minRate: 0.1,
      maxRate: 0.2,
      curve: [0, 0, 1, 1],
      eligibility: {
        type: "always",
        config: {},
      },
      granularity: "d",
      carryover: true,
      budget: 100,
      burnRateCalculation: {
        type: "fixed",
        config: {
          amount: 0.1,
        },
      },
    });
    expect(id).toBeTruthy();
  });
  it("should be able to insert a pool 2", async () => {
    const db = getDb();
    const id = await addPool(db, {
      assetType: "NEO",
      minRate: 0.1,
      maxRate: 0.2,
      curve: [0, 0, 1, 1],
      eligibility: {
        type: "always",
        config: {},
      },
      granularity: "d",
      carryover: true,
      budget: 100,
      burnRateCalculation: {
        type: "fixed",
        config: {
          amount: 0.1,
        },
      },
    });
    expect(id).toBeTruthy();
  });
  afterAll(async () => {
    await clearDb();
  });
});
