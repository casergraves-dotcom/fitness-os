import {
  normalizeLegacyTrainingWeekStartDate,
} from "../../../lib/date/trainingWeek.ts";
import type {
  TrainingPlanState,
} from "../types";

function normalizeDates(dates: string[] | undefined) {
  return dates
    ? Array.from(new Set(dates.map(normalizeLegacyTrainingWeekStartDate))).sort()
    : undefined;
}

function addSundayEvaluationAliases(dates: string[] | undefined) {
  if (!dates) return undefined;
  return Array.from(
    new Set(
      dates.flatMap((date) => [
        date,
        normalizeLegacyTrainingWeekStartDate(date),
      ])
    )
  ).sort();
}

export function normalizeTrainingPlanWeekStarts(
  state: TrainingPlanState
): TrainingPlanState {
  return {
    ...state,
    startDate: normalizeLegacyTrainingWeekStartDate(state.startDate),
    heldWeekStartDates: normalizeDates(state.heldWeekStartDates),
    evaluatedWeekStartDates: addSundayEvaluationAliases(
      state.evaluatedWeekStartDates
    ),
    deloadWeekStartDates: normalizeDates(state.deloadWeekStartDates),
    weeklyProgressionDecisions: state.weeklyProgressionDecisions,
    trainingInterruption: state.trainingInterruption
      ? {
          ...state.trainingInterruption,
          returnWeekStartDate: normalizeLegacyTrainingWeekStartDate(
            state.trainingInterruption.returnWeekStartDate
          ),
        }
      : undefined,
  };
}
