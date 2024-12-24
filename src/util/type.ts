import {
  DrawRule,
  Pool,
  PoolDraw,
  PoolStatus,
  WindowStatus,
} from "../service/reward/types";

export type GfNeoTables = {
  pool: Pool;
  drawRule: DrawRule;
  poolStatus: PoolStatus;
  windowStatus: WindowStatus;
  poolDraw: PoolDraw;
};
