export type UnitTypeShort = "d" | "D" | "M" | "y" | "h" | "m" | "s" | "ms";

export type UnitTypeLong =
  | "millisecond"
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "month"
  | "year"
  | "date";

export type UnitTypeLongPlural =
  | "milliseconds"
  | "seconds"
  | "minutes"
  | "hours"
  | "days"
  | "months"
  | "years"
  | "dates";

export type UnitType = UnitTypeLong | UnitTypeLongPlural | UnitTypeShort;

export type OpUnitType = UnitType | "week" | "weeks" | "w";
export type QUnitType = UnitType | "quarter" | "quarters" | "Q";

export type MaybePromise<T> = T | Promise<T>;

export type Reward = {
  rewardKey: string;
  rewardAmount: number;
};

export type DrawRequest = {
  requestId: string;
  type: string;
  metadata: any;
};

export type Pool = {
  id: string;
  assetType: string;
  minRate: number;
  maxRate: number;
  curve?: [x1: number, y1: number, x2: number, y2: number];
  eligibility: {
    type: string;
    config: any;
  };

  granularity: OpUnitType | QUnitType;

  carryover: boolean;
  budget?: number;
  burnRateCalculation:
    | {
        type: "fixed";
        config: {
          amount: number;
        };
      }
    | {
        type: "equally";
      }
    | {
        type: "hourlyVaries";
        config: {
          ranges: {
            start: number;
            end: number;
            amount: number;
          }[];
        };
      };
};

export type PoolDraw = {
  id: string;
  requestId: string;
  poolId: string;
  amount: number;
  createdAt: number;
};

export type PoolStatus = {
  poolId: string;
  active: boolean;

  budget: number;
  burned: number;

  createdAt: number;
};

export type WindowStatus = {
  poolId: string;

  expectedBurn: number;
  burned: number;

  createdAt: number;
};

export type DrawRule = {
  id: string;
  requestType: string;
  draws: {
    poolId: string;
    amount: number;
  }[];
  logic: "ALL" | "FIRST";
};
