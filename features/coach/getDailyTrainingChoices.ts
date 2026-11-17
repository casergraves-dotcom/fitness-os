import type {
  TrainingActivityCompletion,
  TrainingActivityType,
  TrainingPlanState,
} from "@/features/workout/types";
import {
  evaluateProposedActivityReschedule,
} from "@/features/workout/logic/evaluateProposedActivityReschedule";
import {
  getResolvedWeeklyActivityOccurrences,
} from "@/features/workout/logic/getResolvedWeeklyActivityOccurrences";
import { isCompletableTrainingActivity } from "@/features/workout/utils/isCompletableTrainingActivity";

export interface DailyTrainingChoice {
  activityId: string;
  label: string;
  type: TrainingActivityType;
  originalDate: string;
  scheduledDate: string;
  isScheduledToday: boolean;
  optional: boolean;
}

interface GetDailyTrainingChoicesInput {
  state: TrainingPlanState;
  weekStartDate: string;
  todayDate: string;
  completions: TrainingActivityCompletion[];
  limit?: number;
}

function isOccurrenceCompleted(
  activityId: string,
  scheduledDate: string,
  completions: TrainingActivityCompletion[]
) {
  return completions.some(
    (completion) =>
      completion.trainingActivityId === activityId &&
      completion.date === scheduledDate
  );
}

export function getDailyTrainingChoices({
  state,
  weekStartDate,
  todayDate,
  completions,
  limit = 3,
}: GetDailyTrainingChoicesInput): DailyTrainingChoice[] {
  const occurrences =
    getResolvedWeeklyActivityOccurrences(state, weekStartDate) ?? [];

  return occurrences
    .filter(
      (occurrence) =>
        occurrence.scheduleConstraint === "Flexible" &&
        occurrence.date >= todayDate &&
        isCompletableTrainingActivity(occurrence.activity) &&
        !isOccurrenceCompleted(
          occurrence.activity.id,
          occurrence.date,
          completions
        )
    )
    .flatMap((occurrence): DailyTrainingChoice[] => {
      const isScheduledToday = occurrence.date === todayDate;
      const evaluation = isScheduledToday
        ? null
        : evaluateProposedActivityReschedule({
            state,
            trainingActivityId: occurrence.activity.id,
            originalDate: occurrence.originalDate,
            scheduledDate: todayDate,
          });

      if (!isScheduledToday && (!evaluation || evaluation.hasAnyConflict)) {
        return [];
      }

      return [{
        activityId: occurrence.activity.id,
        label: occurrence.activity.label,
        type: occurrence.activity.type,
        originalDate: occurrence.originalDate,
        scheduledDate: occurrence.date,
        isScheduledToday,
        optional: occurrence.activity.optional === true,
      }];
    })
    .sort((left, right) => {
      if (left.isScheduledToday !== right.isScheduledToday) {
        return left.isScheduledToday ? -1 : 1;
      }

      if (left.optional !== right.optional) {
        return left.optional ? 1 : -1;
      }

      return left.scheduledDate.localeCompare(right.scheduledDate);
    })
    .slice(0, limit);
}
