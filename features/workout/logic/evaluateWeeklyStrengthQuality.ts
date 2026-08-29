import type {
  WorkoutSession,
} from "../types";

import {
  isValidRpe,
  RPE_HIGH_EFFORT_MIN,
} from "../rpe";


// ============================================================
// Types
// ============================================================

export type WeeklyStrengthQualityStatus =
  | "NoData"
  | "Supported"
  | "Limited"
  | "Poor";


export interface WeeklyStrengthQualityEvaluation {
  status: WeeklyStrengthQualityStatus;

  sessionCount: number;

  prescribedSetCount: number;

  completedSetCount: number;

  completionRate: number;

  ratedSetCount: number;

  highEffortSetCount: number;

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


function getSessionDate(
  session: WorkoutSession
) {
  if (session.scheduledDate) {
    return session.scheduledDate;
  }

  const completedAt =
    session.completedAt;

  if (!completedAt) {
    return null;
  }

  const completedDate =
    new Date(completedAt);

  if (
    Number.isNaN(
      completedDate.getTime()
    )
  ) {
    return null;
  }

  return formatLocalDate(
    completedDate
  );
}


function isStrengthSession(
  session: WorkoutSession
) {
  return (
    session.workoutType !== "Run" &&
    Boolean(session.completedAt)
  );
}


// ============================================================
// Evaluate Weekly Strength Quality
// ============================================================

export function evaluateWeeklyStrengthQuality(
  weekStartDate: string,
  workoutHistory: WorkoutSession[]
): WeeklyStrengthQualityEvaluation {
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
      sessionCount: 0,
      prescribedSetCount: 0,
      completedSetCount: 0,
      completionRate: 0,
      ratedSetCount: 0,
      highEffortSetCount: 0,
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

  const sessions =
    workoutHistory.filter(
      (session) => {
        if (!isStrengthSession(session)) {
          return false;
        }

        const sessionDate =
          getSessionDate(session);

        return (
          sessionDate !== null &&
          sessionDate >= weekStartDate &&
          sessionDate <= weekEndDate
        );
      }
    );

  let prescribedSetCount = 0;
  let completedSetCount = 0;
  let ratedSetCount = 0;
  let highEffortSetCount = 0;

  for (const session of sessions) {
    for (const exercise of session.exercises) {
      const prescribedSets =
        exercise.prescribedSetCount ??
        exercise.sets.length;

      prescribedSetCount +=
        Math.max(
          0,
          prescribedSets
        );

      for (const set of exercise.sets) {
        if (
          !set.completed ||
          set.reps <= 0
        ) {
          continue;
        }

        completedSetCount += 1;

        if (
          isValidRpe(
            set.rpe
          )
        ) {
          ratedSetCount += 1;

          if (
            set.rpe >=
              RPE_HIGH_EFFORT_MIN
          ) {
            highEffortSetCount += 1;
          }
        }
      }
    }
  }

  if (
    sessions.length === 0 ||
    prescribedSetCount === 0
  ) {
    return {
      status: "NoData",
      sessionCount: sessions.length,
      prescribedSetCount,
      completedSetCount,
      completionRate: 0,
      ratedSetCount,
      highEffortSetCount,
      factor: null,
    };
  }

  const completionRate =
    Math.min(
      1,
      completedSetCount /
        prescribedSetCount
    );

  const highEffortRate =
    ratedSetCount > 0
      ? highEffortSetCount /
        ratedSetCount
      : 0;

  const sessionLabel =
    `${sessions.length} strength session${sessions.length === 1 ? "" : "s"}`;

  // Completing less than half of the prescribed work is not
  // enough evidence to increase the next week's workload.
  if (completionRate < 0.5) {
    return {
      status: "Poor",
      sessionCount: sessions.length,
      prescribedSetCount,
      completedSetCount,
      completionRate,
      ratedSetCount,
      highEffortSetCount,
      factor:
        `${sessionLabel} reviewed; only ${completedSetCount} of ${prescribedSetCount} prescribed working sets were completed.`,
    };
  }

  // A partially completed week or a consistently near-maximal
  // effort week can advance only conservatively. Missing RPE is
  // neutral because RPE remains optional and older history does
  // not contain it.
  if (
    completionRate < 0.8 ||
    (
      ratedSetCount >= 2 &&
      highEffortRate >= 0.5
    )
  ) {
    const factor =
      completionRate < 0.8
        ? `${sessionLabel} reviewed; ${completedSetCount} of ${prescribedSetCount} prescribed working sets were completed.`
        : `${sessionLabel} reviewed; ${highEffortSetCount} of ${ratedSetCount} rated working sets were logged at RPE ${RPE_HIGH_EFFORT_MIN} or higher.`;

    return {
      status: "Limited",
      sessionCount: sessions.length,
      prescribedSetCount,
      completedSetCount,
      completionRate,
      ratedSetCount,
      highEffortSetCount,
      factor,
    };
  }

  return {
    status: "Supported",
    sessionCount: sessions.length,
    prescribedSetCount,
    completedSetCount,
    completionRate,
    ratedSetCount,
    highEffortSetCount,
    factor:
      `${sessionLabel} reviewed; ${completedSetCount} of ${prescribedSetCount} prescribed working sets were completed at sustainable effort.`,
  };
}
