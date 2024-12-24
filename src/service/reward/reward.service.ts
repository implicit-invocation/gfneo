import { v4 as uuid } from "uuid";
import { GfNeoDb } from "../../util/db";
import { DrawRequest, DrawRule, Pool, Reward, WindowStatus } from "./types";
import { secureRandom } from "./util";
import bezier = require("bezier-easing");

export const addPool = async (db: GfNeoDb, config: Omit<Pool, "id">) => {
  const id = uuid();
  await db
    .insertInto("pool")
    .values({
      id,
      ...config,
    })
    .execute();
  if (config.budget !== undefined) {
    await db
      .insertInto("poolStatus")
      .values({
        poolId: id,
        active: true,
        createdAt: Date.now(),
        budget: config.budget,
        burned: 0,
      })
      .execute();
  }
  return id;
};

export const addDrawRule = async (
  db: GfNeoDb,
  config: Omit<DrawRule, "id">
) => {
  const id = uuid();
  await db
    .insertInto("drawRule")
    .values({
      id,
      ...config,
    })
    .execute();
  return id;
};

const getDrawRule = async (
  db: GfNeoDb,
  requestType: string
): Promise<DrawRule | undefined> => {
  return await db
    .selectFrom("drawRule")
    .where("requestType", "=", requestType)
    .selectAll()
    .executeTakeFirst();
};

const getPool = async (
  db: GfNeoDb,
  poolId: string
): Promise<Pool | undefined> => {
  return await db
    .selectFrom("pool")
    .where("id", "=", poolId)
    .selectAll()
    .executeTakeFirst();
};

const getCurrentWindowStatus = async (
  db: GfNeoDb,
  poolId: string
): Promise<WindowStatus> => {
  // get current window start time using pool granularity and current time
  // check the latest window status for the pool
  // if the latest window status is older than the current window start time, create a new window status
  // the new window status will use a ExpectedBurnRateCalculationRegistry to retrieve the function and calculate the expected burn rate
  // use the calculated for insertion
  // if the pool's carryover flag is on, get all windows from the latest to now, sum their expected burn rates and add them to the new window status expected burn rate with the remaining amount of the latest window: using dayjs-recur
  return {
    poolId,
    createdAt: Date.now(),
    burned: 0,
    expectedBurn: 0,
  };
};

const getRate = async (db: GfNeoDb, poolId: string): Promise<number> => {
  const pool = await getPool(db, poolId);
  if (!pool) return 0;
  const minRate = pool.minRate;
  const maxRate = pool.maxRate;

  const rateFormula = bezier(...(pool.curve || [0, 0, 1, 1]));
  const { expectedBurn, burned } = await getCurrentWindowStatus(db, poolId);
  // TODO: reconsider this
  // if (expectedBurn === 0 || burned === expectedBurn) return 0;
  const alpha = expectedBurn === 0 ? 0 : (expectedBurn - burned) / expectedBurn;

  return minRate + (maxRate - minRate) * rateFormula(alpha);
};

const attemptRetrieveReward = async (
  db: GfNeoDb,
  requestId: string,
  poolId: string,
  amount: number
): Promise<Reward | undefined> => {
  const pool = await getPool(db, poolId);
  if (!pool) return undefined;
  if (pool.budget !== undefined) {
    const updatedId = await db
      .updateTable("poolStatus")
      .set((eb) => ({
        burned: eb("burned", "+", amount),
      }))
      .where((eb) => eb("burned", "<=", eb("budget", "-", amount)))
      .returning("poolId")
      .executeTakeFirst();

    if (!updatedId) return undefined;
  }
  const currentWindowStatus = await getCurrentWindowStatus(db, poolId);
  // TODO: should I enforce hard limit on the window?
  await db
    .updateTable("windowStatus")
    .set((eb) => ({
      burned: eb("burned", "+", amount),
    }))
    .where("poolId", "=", poolId)
    .where("createdAt", "=", currentWindowStatus.createdAt)
    .execute();
  await db
    .insertInto("poolDraw")
    .values({
      id: uuid(),
      requestId,
      poolId,
      amount,
      createdAt: Date.now(),
    })
    .execute();
  return { rewardKey: pool.assetType, rewardAmount: amount };
};

export const drawRewards = async (
  db: GfNeoDb,
  drawRequest: DrawRequest
): Promise<Reward[]> => {
  const rule = await getDrawRule(db, drawRequest.type);
  if (!rule) {
    return [];
  }
  const draws = rule.draws;

  const rewards: Reward[] = [];
  for (const draw of draws) {
    const rate = await getRate(db, draw.poolId);
    const randomNumber = secureRandom();
    if (randomNumber > rate) continue;

    const retrieved = await attemptRetrieveReward(
      db,
      drawRequest.requestId,
      draw.poolId,
      draw.amount
    );
    if (!retrieved) continue;

    rewards.push(retrieved);

    if (rule.logic === "FIRST") break;
  }

  return rewards;
};
