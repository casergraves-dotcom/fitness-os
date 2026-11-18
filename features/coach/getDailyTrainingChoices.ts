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
  kind: "Scheduled" | "RecoveryOption";
  activityId: string;
  label: string;
  type: TrainingActivityType;
  originalDate: string;
  scheduledDate: string;
  isScheduledToday: boolean;
  optional: boolean;
  description?: string;
  href?: string;
}

interface GetDailyTrainingChoicesInput {
  state: TrainingPlanState;
  weekStartDate: string;
  todayDate: string;
  completions: TrainingActivityCompletion[];
  includeRecoveryOptions?: boolean;
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
  includeRecoveryOptions = false,
  limit = 3,
}: GetDailyTrainingChoicesInput): DailyTrainingChoice[] {
  const occurrences =
    getResolvedWeeklyActivityOccurrences(state, weekStartDate) ?? [];

  const scheduledChoices = occurrences
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
        kind: "Scheduled",
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
    });

  const recoveryChoices: DailyTrainingChoice[] = includeRecoveryOptions
    ? [{
        kind: "RecoveryOption",
        activityId: "anytime-full-body-recovery",
        label: "Full Body Recovery",
        type: "Mobility",
        originalDate: todayDate,
        scheduledDate: todayDate,
        isScheduledToday: true,
        optional: true,
        description: "10–20 min of gentle stretching and mobility",
        href: "/workout?mobility=full-body-recovery",
      }]
    : [];

  return [...scheduledChoices, ...recoveryChoices]
    .filter(
      (choice, index, choices) =>
        choices.findIndex(
          (candidate) =>
            candidate.activityId === choice.activityId
        ) === index
    )
    .slice(0, limit);
}
