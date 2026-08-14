import {
  calculateReadiness,
} from "@/features/recovery";

import type {
  MorningCheckInRatings,
} from "@/features/recovery";


// ============================================================
// Types
// ============================================================

export interface WeeklyRecoveryCheckIn {
  date: string;

  ratings: MorningCheckInRatings;
}


export type WeeklyRecoveryStatus =
  | "NoData"
  | "Supported"
  | "Limited"
  | "Poor";


export interface WeeklyRecoveryEvaluation {
  status: WeeklyRecoveryStatus;

  checkInCount: number;

  factor: string | null;
}


// ============================================================
// Helpers
// ============================================================

function addDays(
  date: Date,
  days: number
) {
  const result =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

  result.setDate(
    result.getDate() + days
  );

  return result;
}


function formatLocalDate(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


// ============================================================
// Evaluate Weekly Recovery
// ============================================================

export function evaluateWeeklyRecovery(
  weekStartDate: string,
  checkIns: WeeklyRecoveryCheckIn[]
): WeeklyRecoveryEvaluation {
  const weekStart =
    new Date(
      `${weekStartDate}T12:00:00`
    );

  if (
    Number.isNaN(
      weekStart.getTime()
    )
  ) {
    return {
      status: "NoData",
      checkInCount: 0,
      factor: null,
    };
  }

  const weekEndDate =
    formatLocalDate(
      addDays(
        weekStart,
        6
      )
    );

  // Use the three most recent completed check-ins from the
  // evaluated week. This makes recovery meaningful without
  // allowing one early-week reading to dominate the decision.
  const recentReadiness =
    checkIns
      .filter(
        (record) =>
          record.date >=
            weekStartDate &&
          record.date <=
            weekEndDate
      )
      .sort(
        (a, b) =>
          a.date.localeCompare(
            b.date
          )
      )
      .slice(-3)
      .map(
        (record) =>
          calculateReadiness(
            record.ratings
          )
      )
      .filter(
        (
          readiness
        ): readiness is NonNullable<
          ReturnType<
            typeof calculateReadiness
          >
        > =>
          readiness !== null
      );

  const checkInCount =
    recentReadiness.length;

  if (checkInCount === 0) {
    return {
      status: "NoData",
      checkInCount,
      factor: null,
    };
  }

  const latestStatus =
    recentReadiness.at(-1)!
      .status;

  const reducedStatuses =
    recentReadiness.filter(
      (readiness) =>
        readiness.status ===
          "low" ||
        readiness.status ===
          "very-low"
    );

  const lastTwo =
    recentReadiness.slice(-2);

  const consecutiveReduced =
    lastTwo.length === 2 &&
    lastTwo.every(
      (readiness) =>
        readiness.status ===
          "low" ||
        readiness.status ===
          "very-low"
    );

  if (
    latestStatus ===
      "very-low" ||
    consecutiveReduced
  ) {
    return {
      status: "Poor",
      checkInCount,
      factor:
        `${checkInCount} recent recovery check-in${checkInCount === 1 ? "" : "s"} reviewed; the latest recovery trend does not support advancing training load.`,
    };
  }

  if (
    reducedStatuses.length > 0
  ) {
    return {
      status: "Limited",
      checkInCount,
      factor:
        `${checkInCount} recent recovery check-in${checkInCount === 1 ? "" : "s"} reviewed; at least one showed reduced readiness.`,
    };
  }

  return {
    status: "Supported",
    checkInCount,
    factor:
      `${checkInCount} recent recovery check-in${checkInCount === 1 ? "" : "s"} reviewed; recovery supported the adherence-based decision.`,
  };
}
