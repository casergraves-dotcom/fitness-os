import type {
  MorningCheckInRecord,
} from "@/features/recovery/hooks/useMorningCheckIn";

import type {
  RunSession,
} from "@/features/workout/types";

import type {
  ExerciseProgressEntry,
} from "../hooks/useExerciseProgress";

import {
  filterRecordsByProgressReviewPeriod,
} from "./getProgressReviewPeriod";

import type {
  ProgressReviewPeriod,
} from "./getProgressReviewPeriod";

import {
  getRecoveryProgressTrend,
} from "./getRecoveryProgressTrend";

import type {
  RecoveryProgressTrend,
} from "./getRecoveryProgressTrend";

import {
  getRunningProgressTrend,
} from "./getRunningProgressTrend";

import type {
  RunningProgressTrend,
} from "./getRunningProgressTrend";

import {
  getStrengthProgressTrend,
} from "./getStrengthProgressTrend";

import type {
  StrengthProgressTrend,
} from "./getStrengthProgressTrend";


// ============================================================
// Types
// ============================================================

export interface ProgressReviewDomainTrends {
  period:
    ProgressReviewPeriod;

  strength:
    StrengthProgressTrend;

  running:
    RunningProgressTrend;

  recovery:
    RecoveryProgressTrend;
}


// ============================================================
// Date Helpers
// ============================================================

function formatLocalDate(
  date:
    Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() +
        1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return (
    `${year}-${month}-${day}`
  );
}


function getLocalDate(
  value:
    string
) {
  // Preserve canonical date-only values without introducing
  // timezone conversion.
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    return value;
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return formatLocalDate(
    date
  );
}


// ============================================================
// Progress Review Domain Trends
// ============================================================

export function getProgressReviewDomainTrends({
  period,
  strengthProgress = [],
  runHistory,
  recoveryHistory,
}: {
  period:
    ProgressReviewPeriod;

  // Optional for backward compatibility. Whole-program strength
  // retention is now assembled separately from workout history.
  strengthProgress?:
    ExerciseProgressEntry[];

  runHistory:
    RunSession[];

  recoveryHistory:
    MorningCheckInRecord[];
}): ProgressReviewDomainTrends {
  const periodStrengthProgress =
    filterRecordsByProgressReviewPeriod(
      strengthProgress,
      (
        entry
      ) =>
        getLocalDate(
          entry.date
        ),
      period
    );

  const periodRunHistory =
    filterRecordsByProgressReviewPeriod(
      runHistory,
      (
        run
      ) =>
        getLocalDate(
          run.completedAt ??
          run.startedAt
        ),
      period
    );

  const periodRecoveryHistory =
    filterRecordsByProgressReviewPeriod(
      recoveryHistory,
      (
        record
      ) =>
        getLocalDate(
          record.date
        ),
      period
    );

  return {
    period,

    strength:
      getStrengthProgressTrend(
        periodStrengthProgress
      ),

    running:
      getRunningProgressTrend(
        periodRunHistory
      ),

    recovery:
      getRecoveryProgressTrend(
        periodRecoveryHistory
      ),
  };
}