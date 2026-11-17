import type {
  WorkoutSession,
} from "../types";

import {
  isValidRpe,
  RPE_HIGH_EFFORT_MIN,
} from "../rpe.ts";
import {
  evaluateStrengthSessionCompletion,
} from "./evaluateStrengthSessionCompletion.ts";


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

  fullPrescriptionSetCount: number;

  completedSetCount: number;

  completionRate: number;

  fullDoseCompletionRate: number;

  fullSessionCount: number;

  validShortenedSessionCount: number;

  substantialPartialSessionCount: number;

  minimalSessionCount: number;

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
      fullPrescriptionSetCount: 0,
      completedSetCount: 0,
      completionRate: 0,
      fullDoseCompletionRate: 0,
      fullSessionCount: 0,
      validShortenedSessionCount: 0,
      substantialPartialSessionCount: 0,
      minimalSessionCount: 0,
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
  let fullPrescriptionSetCount = 0;
  let completedSetCount = 0;
  let ratedSetCount = 0;
  let highEffortSetCount = 0;
  let fullSessionCount = 0;
  let validShortenedSessionCount = 0;
  let substantialPartialSessionCount = 0;
  let minimalSessionCount = 0;

  for (const session of sessions) {
    const completion = evaluateStrengthSessionCompletion(session);

    prescribedSetCount += completion.prescribedWorkingSetCount;
    fullPrescriptionSetCount += Math.max(
      completion.prescribedWorkingSetCount,
      session.prescriptionSnapshot?.fullPrescriptionWorkingSetCount ??
        completion.prescribedWorkingSetCount,
    );
    completedSetCount += completion.completedWorkingSetCount;

    if (completion.classification === "FullSession") {
      fullSessionCount += 1;
    } else if (completion.classification === "ValidShortenedSession") {
      validShortenedSessionCount += 1;
    } else if (completion.classification === "SubstantialPartialSession") {
      substantialPartialSessionCount += 1;
    } else if (completion.classification === "MinimalSession") {
      minimalSessionCount += 1;
    }

    for (const exercise of session.exercises) {
      for (const set of exercise.sets) {
        if (
          !set.completed ||
          set.reps <= 0
        ) {
          continue;
        }
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
      fullPrescriptionSetCount,
      completedSetCount,
      completionRate: 0,
      fullDoseCompletionRate: 0,
      fullSessionCount,
      validShortenedSessionCount,
      substantialPartialSessionCount,
      minimalSessionCount,
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

  const fullDoseCompletionRate =
    fullPrescriptionSetCount > 0
      ? Math.min(1, completedSetCount / fullPrescriptionSetCount)
      : 0;

  const highEffortRate =
    ratedSetCount > 0
      ? highEffortSetCount /
        ratedSetCount
      : 0;

  const sessionLabel =
    `${sessions.length} strength session${sessions.length === 1 ? "" : "s"}`;

  // Completing less than half of the prescribed work is not
  // enough evidence to increase the next week's workload.
  if (fullDoseCompletionRate < 0.5) {
    return {
      status: "Poor",
      sessionCount: sessions.length,
      prescribedSetCount,
      fullPrescriptionSetCount,
      completedSetCount,
      completionRate,
      fullDoseCompletionRate,
      fullSessionCount,
      validShortenedSessionCount,
      substantialPartialSessionCount,
      minimalSessionCount,
      ratedSetCount,
      highEffortSetCount,
      factor:
        `${sessionLabel} reviewed; only ${completedSetCount} of ${fullPrescriptionSetCount} full-prescription working sets were completed.`,
    };
  }

  // A partially completed week or a consistently near-maximal
  // effort week can advance only conservatively. Missing RPE is
  // neutral because RPE remains optional and older history does
  // not contain it.
  if (
    completionRate < 0.8 ||
    fullDoseCompletionRate < 0.8 ||
    (
      ratedSetCount >= 2 &&
      highEffortRate >= 0.5
    )
  ) {
    const factor =
      completionRate < 0.8 || fullDoseCompletionRate < 0.8
        ? `${sessionLabel} reviewed; ${completedSetCount} of ${prescribedSetCount} assigned working sets were completed. The normal full prescription contains ${fullPrescriptionSetCount} sets.`
        : `${sessionLabel} reviewed; ${highEffortSetCount} of ${ratedSetCount} rated working sets were logged at RPE ${RPE_HIGH_EFFORT_MIN} or higher.`;

    return {
      status: "Limited",
      sessionCount: sessions.length,
      prescribedSetCount,
      fullPrescriptionSetCount,
      completedSetCount,
      completionRate,
      fullDoseCompletionRate,
      fullSessionCount,
      validShortenedSessionCount,
      substantialPartialSessionCount,
      minimalSessionCount,
      ratedSetCount,
      highEffortSetCount,
      factor,
    };
  }

  return {
    status: "Supported",
    sessionCount: sessions.length,
    prescribedSetCount,
    fullPrescriptionSetCount,
    completedSetCount,
    completionRate,
    fullDoseCompletionRate,
    fullSessionCount,
    validShortenedSessionCount,
    substantialPartialSessionCount,
    minimalSessionCount,
    ratedSetCount,
    highEffortSetCount,
    factor:
      `${sessionLabel} reviewed; ${completedSetCount} of ${prescribedSetCount} prescribed working sets were completed at sustainable effort.`,
  };
}
