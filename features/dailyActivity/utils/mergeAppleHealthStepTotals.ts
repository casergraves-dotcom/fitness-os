import type { DailyStepRecord } from "../dailyActivityTypes";

export interface AppleHealthDailyStepTotal {
  date: string;
  steps: number;
}

export interface AppleHealthStepMergeResult {
  records: DailyStepRecord[];
  added: number;
  updated: number;
  preservedManual: number;
}

interface MergeOptions {
  syncedAt: string;
  createId: () => string;
}

function isValidTotal(total: AppleHealthDailyStepTotal) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(total.date) &&
    Number.isSafeInteger(total.steps) &&
    total.steps >= 0
  );
}

// Apple Health supplies one cumulative total for each local calendar date.
// Manual records are intentional corrections and therefore win until the user
// explicitly removes them. Health-owned dates update without duplication.
export function mergeAppleHealthStepTotals(
  existingRecords: DailyStepRecord[],
  incomingTotals: AppleHealthDailyStepTotal[],
  options: MergeOptions
): AppleHealthStepMergeResult {
  const recordsByDate = new Map(
    existingRecords.map((record) => [record.date, record])
  );
  let added = 0;
  let updated = 0;
  let preservedManual = 0;

  for (const total of incomingTotals) {
    if (!isValidTotal(total)) continue;

    const existing = recordsByDate.get(total.date);
    if (existing?.source === "Manual") {
      preservedManual += 1;
      continue;
    }

    if (existing) {
      recordsByDate.set(total.date, {
        ...existing,
        steps: total.steps,
        source: "AppleHealth",
        sourceSyncedAt: options.syncedAt,
        updatedAt: options.syncedAt,
      });
      updated += 1;
      continue;
    }

    recordsByDate.set(total.date, {
      id: options.createId(),
      date: total.date,
      steps: total.steps,
      source: "AppleHealth",
      sourceSyncedAt: options.syncedAt,
      createdAt: options.syncedAt,
      updatedAt: options.syncedAt,
    });
    added += 1;
  }

  return {
    records: [...recordsByDate.values()].sort((a, b) =>
      b.date.localeCompare(a.date)
    ),
    added,
    updated,
    preservedManual,
  };
}
