import type {
  DailyStepRecord,
} from "../../dailyActivity/dailyActivityTypes.ts";
import {
  mergeAppleHealthStepTotals,
} from "../../dailyActivity/utils/mergeAppleHealthStepTotals.ts";
import type {
  AppleHealthStepBridge,
} from "./appleHealthStepBridge.ts";

export type AppleHealthStepSyncStatus =
  | "AuthorizationRequired"
  | "Unavailable"
  | "NoAccessibleData"
  | "PartialHistory"
  | "Synced"
  | "Failed";

export interface AppleHealthStepSyncResult {
  status: AppleHealthStepSyncStatus;
  records: DailyStepRecord[];
  added: number;
  updated: number;
  preservedManual: number;
  earliestAuthorizedDate?: string;
  errorMessage?: string;
}

interface SyncOptions {
  bridge: AppleHealthStepBridge;
  records: DailyStepRecord[];
  startDate: string;
  endDate: string;
  syncedAt: string;
  createId: () => string;
  requestAuthorization?: boolean;
}

function unchanged(
  status: AppleHealthStepSyncStatus,
  records: DailyStepRecord[]
): AppleHealthStepSyncResult {
  return {
    status,
    records,
    added: 0,
    updated: 0,
    preservedManual: 0,
  };
}

export async function syncAppleHealthSteps(
  options: SyncOptions
): Promise<AppleHealthStepSyncResult> {
  try {
    let access = await options.bridge.getAccessState();

    if (access.availability === "Unavailable") {
      return unchanged("Unavailable", options.records);
    }

    if (!access.authorizationRequested) {
      if (!options.requestAuthorization) {
        return unchanged("AuthorizationRequired", options.records);
      }
      access = await options.bridge.requestReadAuthorization();
    }

    const queryStart =
      access.earliestAuthorizedDate &&
      access.earliestAuthorizedDate > options.startDate
        ? access.earliestAuthorizedDate
        : options.startDate;
    const totals = await options.bridge.readDailyStepTotals({
      startDate: queryStart,
      endDate: options.endDate,
    });

    // Apple intentionally makes denied read access indistinguishable from no
    // accessible samples, so this state must not be labeled "Denied."
    if (totals.length === 0) {
      return {
        ...unchanged("NoAccessibleData", options.records),
        earliestAuthorizedDate: access.earliestAuthorizedDate,
      };
    }

    const merged = mergeAppleHealthStepTotals(
      options.records,
      totals,
      {
        syncedAt: options.syncedAt,
        createId: options.createId,
      }
    );
    const partialHistory =
      Boolean(access.earliestAuthorizedDate) &&
      queryStart > options.startDate;

    return {
      status: partialHistory ? "PartialHistory" : "Synced",
      ...merged,
      earliestAuthorizedDate: access.earliestAuthorizedDate,
    };
  } catch (error) {
    return {
      ...unchanged("Failed", options.records),
      errorMessage:
        error instanceof Error ? error.message : "Apple Health sync failed.",
    };
  }
}
