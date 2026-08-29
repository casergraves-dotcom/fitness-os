// ============================================================
// Imports
// ============================================================

import {
  deloadWeek,
  fitnessOsTrainingPlan,
} from "@/features/workout/trainingPlan";

import type {
  RunSession,
  TrainingActivityCompletion,
  TrainingPlanState,
  TrainingWeek,
  TrainingWeekType,
  WorkoutSession,
} from "@/features/workout/types";

import {
  evaluateWeeklyAdherence,
} from "@/features/workout/logic/evaluateWeeklyAdherence";

import type {
  WeeklyAdherenceResult,
} from "@/features/workout/logic/evaluateWeeklyAdherence";

import {
  getWeeklyProgressionDecision,
} from "@/features/workout/logic/getWeeklyProgressionDecision";

import {
  evaluateWeeklyRecovery,
} from "@/features/workout/logic/evaluateWeeklyRecovery";

import type {
  WeeklyRecoveryCheckIn,
  WeeklyRecoveryEvaluation,
} from "@/features/workout/logic/evaluateWeeklyRecovery";

import type {
  WeeklyProgressionDecision,
} from "@/features/workout/logic/getWeeklyProgressionDecision";

import {
  evaluateWeeklyStrengthQuality,
} from "@/features/workout/logic/evaluateWeeklyStrengthQuality";

import type {
  WeeklyStrengthQualityEvaluation,
} from "@/features/workout/logic/evaluateWeeklyStrengthQuality";

import {
  evaluateWeeklyRunningLoad,
} from "@/features/workout/logic/evaluateWeeklyRunningLoad";

import type {
  WeeklyRunningLoadEvaluation,
} from "@/features/workout/logic/evaluateWeeklyRunningLoad";

import {
  evaluateWeeklyAerialLoad,
} from "@/features/workout/logic/evaluateWeeklyAerialLoad";

import {
  getTrainingScheduleForDate,
} from "@/features/workout/utils/getTrainingScheduleForDate";

import {
  getResolvedWeeklyActivityOccurrences,
} from "@/features/workout/logic/getResolvedWeeklyActivityOccurrences";


// ============================================================
// Types
// ============================================================

export interface CurrentWeeklyProgress {
  weekStartDate: string;

  weekType: TrainingWeekType;

  adherence: WeeklyAdherenceResult;

  decision: WeeklyProgressionDecision;

  recovery:
    WeeklyRecoveryEvaluation;

  strengthQuality:
    WeeklyStrengthQualityEvaluation;

  runningLoad:
    WeeklyRunningLoadEvaluation;

  evaluationReady: boolean;
}


// ============================================================
// Date Helpers
// ============================================================

function startOfLocalDay(
  date: Date
) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}


function getMonday(
  date: Date
) {
  const result =
    startOfLocalDay(
      date
    );

  const day =
    result.getDay();

  const daysSinceMonday =
    day === 0
      ? 6
      : day - 1;

  result.setDate(
    result.getDate() -
      daysSinceMonday
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
// Training Week Resolution
// ============================================================

function resolveTrainingWeek(
  phaseId: string
): TrainingWeek | undefined {
  if (
    phaseId ===
    deloadWeek.id
  ) {
    return deloadWeek;
  }

  return (
    fitnessOsTrainingPlan.weeks.find(
      (week) =>
        week.id ===
        phaseId
    )
  );
}


// ============================================================
// Requirement Deadline
// ============================================================

function getLatestRequirementDate(
  adherence: WeeklyAdherenceResult
) {
  const dates: string[] =
    adherence.activities
      .filter(
        (item) =>
          item.required
      )
      .map(
        (item) =>
          item.date
      );

  for (
    const group
    of adherence.substitutionGroups
  ) {
    const groupDates =
      group.activities
        .map(
          (item) =>
            item.date
        )
        .sort();

    const latestGroupDate =
      groupDates.at(
        -1
      );

    if (latestGroupDate) {
      dates.push(
        latestGroupDate
      );
    }
  }

  return (
    dates
      .sort()
      .at(-1) ??
    null
  );
}


// ============================================================
// Current Weekly Progress
// ============================================================

export function getCurrentWeeklyProgress(
  state:
    TrainingPlanState | null,
  completions:
    TrainingActivityCompletion[],
  date:
    Date = new Date(),
  recoveryCheckIns:
    WeeklyRecoveryCheckIn[] = [],
  workoutHistory:
    WorkoutSession[] = [],
  runHistory:
    RunSession[] = []
): CurrentWeeklyProgress | null {
  if (!state) {
    return null;
  }

  const weekStart =
    getMonday(
      date
    );

  const weekStartDate =
    formatLocalDate(
      weekStart
    );

  const schedule =
    getTrainingScheduleForDate(
      fitnessOsTrainingPlan,
      state,
      weekStart
    );

  if (!schedule) {
    return null;
  }

  const trainingWeek =
    resolveTrainingWeek(
      schedule.phaseId
    );

  if (!trainingWeek) {
    return null;
  }

  const resolvedOccurrences =
    getResolvedWeeklyActivityOccurrences(
      state,
      weekStartDate
    );

  if (!resolvedOccurrences) {
    return null;
  }

  const adherence =
    evaluateWeeklyAdherence(
      trainingWeek,
      weekStartDate,
      completions,
      resolvedOccurrences
    );

  if (!adherence) {
    return null;
  }


  // ----------------------------------------------------------
  // Structured Weekly Evidence
  // ----------------------------------------------------------

  const recovery =
    evaluateWeeklyRecovery(
      weekStartDate,
      recoveryCheckIns
    );

  const strengthQuality =
    evaluateWeeklyStrengthQuality(
      weekStartDate,
      workoutHistory
    );

  const runningLoad =
    evaluateWeeklyRunningLoad(
      weekStartDate,
      runHistory
    );

  const aerialLoad =
    evaluateWeeklyAerialLoad(
      adherence
    );


  // ----------------------------------------------------------
  // Progression Decision
  // ----------------------------------------------------------

  const decision =
    getWeeklyProgressionDecision(
      adherence,
      recovery,
      strengthQuality,
      runningLoad,
      aerialLoad
    );


  // ----------------------------------------------------------
  // Evaluation Readiness
  // ----------------------------------------------------------

  const latestRequirementDate =
    getLatestRequirementDate(
      adherence
    );

  const todayDate =
    formatLocalDate(
      date
    );

  const evaluationReady =
    latestRequirementDate === null ||
    todayDate >=
      latestRequirementDate;


  // ----------------------------------------------------------
  // Result
  // ----------------------------------------------------------

  return {
    weekStartDate,

    weekType:
      schedule.weekType,

    adherence,

    decision,

    recovery,

    strengthQuality,

    runningLoad,

    evaluationReady,
  };
}