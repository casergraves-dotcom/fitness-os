import type {
  RunSession,
} from "../types";

// ============================================================
// Weekly Running Load
// ============================================================

export type WeeklyRunningLoadStatus =
  | "NoData"
  | "Supportive"
  | "Limited"
  | "Poor";

export interface WeeklyRunningLoadEvaluation {
  status: WeeklyRunningLoadStatus;
  scheduledRunCount: number;
  completedRunCount: number;
  evaluatedRunCount: number;
  totalDurationMinutes: number;
  averageDurationCompletionRate: number | null;
  averageRpe: number | null;
  factor?: string;
}

// ============================================================
// Constants
// ============================================================

const LIMITED_DURATION_RATE = 0.75;
const POOR_DURATION_RATE = 0.5;
const HIGH_RPE = 9;

// ============================================================
// Date Helpers
// ============================================================

function addDays(
  date: Date,
  days: number
) {
  const result = new Date(
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
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// ============================================================
// Evaluate Weekly Running Load
// ============================================================

export function evaluateWeeklyRunningLoad(
  weekStartDate: string,
  runHistory: RunSession[]
): WeeklyRunningLoadEvaluation {
  const weekStart = new Date(
    `${weekStartDate}T00:00:00`
  );

  if (
    Number.isNaN(
      weekStart.getTime()
    )
  ) {
    return {
      status: "NoData",
      scheduledRunCount: 0,
      completedRunCount: 0,
      evaluatedRunCount: 0,
      totalDurationMinutes: 0,
      averageDurationCompletionRate: null,
      averageRpe: null,
    };
  }

  const weekEndDate = formatLocalDate(
    addDays(weekStart, 6)
  );

  // Only scheduled runs belong in weekly progression. Manual runs
  // remain useful history, but should not make the plan advance or
  // hold because they were not part of that week's prescription.
  const scheduledRuns =
    runHistory.filter(
      (run) =>
        Boolean(run.completedAt) &&
        Boolean(run.scheduledActivityId) &&
        Boolean(run.scheduledDate) &&
        run.scheduledDate! >= weekStartDate &&
        run.scheduledDate! <= weekEndDate
    );

  if (scheduledRuns.length === 0) {
    return {
      status: "NoData",
      scheduledRunCount: 0,
      completedRunCount: 0,
      evaluatedRunCount: 0,
      totalDurationMinutes: 0,
      averageDurationCompletionRate: null,
      averageRpe: null,
    };
  }

  const durationRates =
    scheduledRuns.flatMap(
      (run) => {
        const prescribed =
          run.prescribedDurationMin;
        const actual =
          run.durationMinutes;

        if (
          prescribed === undefined ||
          prescribed <= 0 ||
          actual === undefined ||
          actual < 0
        ) {
          return [];
        }

        return [actual / prescribed];
      }
    );

  const rpes =
    scheduledRuns.flatMap(
      (run) =>
        run.rpe !== undefined &&
        Number.isFinite(run.rpe)
          ? [run.rpe]
          : []
    );

  const totalDurationMinutes =
    scheduledRuns.reduce(
      (sum, run) =>
        sum +
        (run.durationMinutes ?? 0),
      0
    );

  const averageDurationCompletionRate =
    durationRates.length > 0
      ? durationRates.reduce(
          (sum, rate) =>
            sum + rate,
          0
        ) / durationRates.length
      : null;

  const averageRpe =
    rpes.length > 0
      ? rpes.reduce(
          (sum, rpe) =>
            sum + rpe,
          0
        ) / rpes.length
      : null;

  const evaluatedRunCount =
    durationRates.length;

  if (
    averageDurationCompletionRate !== null &&
    averageDurationCompletionRate <
      POOR_DURATION_RATE
  ) {
    return {
      status: "Poor",
      scheduledRunCount:
        scheduledRuns.length,
      completedRunCount:
        scheduledRuns.length,
      evaluatedRunCount,
      totalDurationMinutes,
      averageDurationCompletionRate,
      averageRpe,
      factor:
        `Scheduled running averaged ${Math.round(averageDurationCompletionRate * 100)}% of the minimum prescribed duration (${Math.round(totalDurationMinutes)} min completed).`,
    };
  }

  if (
    (
      averageDurationCompletionRate !== null &&
      averageDurationCompletionRate <
        LIMITED_DURATION_RATE
    ) ||
    (
      averageRpe !== null &&
      averageRpe >= HIGH_RPE
    )
  ) {
    const details: string[] = [];

    if (
      averageDurationCompletionRate !== null
    ) {
      details.push(
        `${Math.round(averageDurationCompletionRate * 100)}% of minimum prescribed run duration`
      );
    }

    if (averageRpe !== null) {
      details.push(
        `average RPE ${averageRpe.toFixed(1)}`
      );
    }

    return {
      status: "Limited",
      scheduledRunCount:
        scheduledRuns.length,
      completedRunCount:
        scheduledRuns.length,
      evaluatedRunCount,
      totalDurationMinutes,
      averageDurationCompletionRate,
      averageRpe,
      factor:
        `Running load was completed with caution (${details.join(", ")}; ${Math.round(totalDurationMinutes)} min total).`,
    };
  }

  const details: string[] = [];

  if (
    averageDurationCompletionRate !== null
  ) {
    details.push(
      `${Math.round(averageDurationCompletionRate * 100)}% of minimum prescribed duration`
    );
  }

  if (averageRpe !== null) {
    details.push(
      `average RPE ${averageRpe.toFixed(1)}`
    );
  }

  return {
    status: "Supportive",
    scheduledRunCount:
      scheduledRuns.length,
    completedRunCount:
      scheduledRuns.length,
    evaluatedRunCount,
    totalDurationMinutes,
    averageDurationCompletionRate,
    averageRpe,
    factor:
      details.length > 0
        ? `Running load supported progression (${details.join(", ")}; ${Math.round(totalDurationMinutes)} min total).`
        : `Completed ${scheduledRuns.length} scheduled run${scheduledRuns.length === 1 ? "" : "s"} (${Math.round(totalDurationMinutes)} min total).`,
  };
}
