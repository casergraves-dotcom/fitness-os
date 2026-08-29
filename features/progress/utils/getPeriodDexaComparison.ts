import type {
  DexaRecord,
} from "../bodyCompositionTypes";

import {
  getDexaComparison,
} from "./getDexaComparison";

import type {
  DexaComparison,
} from "./getDexaComparison";

import {
  filterRecordsByProgressReviewPeriod,
} from "./getProgressReviewPeriod";

import type {
  ProgressReviewPeriod,
} from "./getProgressReviewPeriod";


// ============================================================
// Types
// ============================================================

export type PeriodDexaComparisonStatus =
  | "NoData"
  | "OneScan"
  | "NoComparableMetrics"
  | "Available";


export interface PeriodDexaComparisonResult {
  status:
    PeriodDexaComparisonStatus;

  scanCount: number;

  comparison:
    DexaComparison |
    null;

  limitation:
    string |
    null;
}


// ============================================================
// Period DEXA Comparison
// ============================================================

export function getPeriodDexaComparison({
  records,
  period,
}: {
  records:
    DexaRecord[];

  period:
    ProgressReviewPeriod;
}): PeriodDexaComparisonResult {
  const periodRecords =
    filterRecordsByProgressReviewPeriod(
      records,
      (
        record
      ) =>
        record.scanDate,
      period
    )
      .slice()
      .sort(
        (
          first,
          second
        ) =>
          first.scanDate.localeCompare(
            second.scanDate
          )
      );

  if (
    periodRecords.length ===
    0
  ) {
    return {
      status:
        "NoData",

      scanCount:
        0,

      comparison:
        null,

      limitation:
        "No DEXA scans fall within the selected review period.",
    };
  }

  if (
    periodRecords.length ===
    1
  ) {
    return {
      status:
        "OneScan",

      scanCount:
        1,

      comparison:
        null,

      limitation:
        "At least two DEXA scans are needed within the selected review period before changes can be compared.",
    };
  }

  const comparison =
    getDexaComparison(
      periodRecords[0],
      periodRecords[
        periodRecords.length -
          1
      ]
    );

  if (
    comparison.metrics.length ===
    0
  ) {
    return {
      status:
        "NoComparableMetrics",

      scanCount:
        periodRecords.length,

      comparison:
        null,

      limitation:
        "The DEXA scans within the selected review period do not contain matching metrics that can be compared.",
    };
  }

  return {
    status:
      "Available",

    scanCount:
      periodRecords.length,

    comparison,

    limitation:
      null,
  };
}