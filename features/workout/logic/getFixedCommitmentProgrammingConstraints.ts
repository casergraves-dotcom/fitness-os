import { parseLocalCalendarDate } from "../../../lib/date/trainingWeek.ts";
import type { StrengthMovementRole, StrengthWorkoutType } from "../types";
import type { TrainingScheduleForDate } from "../utils/getTrainingScheduleForDate";

const AERIAL_FATIGUE_ROLES: StrengthMovementRole[] = [
  "VerticalPull",
  "HorizontalPull",
  "VerticalPush",
  "RearShoulder",
  "ElbowFlexion",
];

function calendarDayDistance(first: string, second: string) {
  const firstDate = parseLocalCalendarDate(first);
  const secondDate = parseLocalCalendarDate(second);
  if (!firstDate || !secondDate) return Number.POSITIVE_INFINITY;
  return Math.abs(firstDate.getTime() - secondDate.getTime()) / 86_400_000;
}

export function getFixedCommitmentProgrammingConstraints(
  workoutType: StrengthWorkoutType,
  schedules: TrainingScheduleForDate[]
): StrengthMovementRole[] {
  const strengthDates = schedules
    .filter((schedule) =>
      schedule.trainingDay.activities.some(
        (activity) => activity.strengthWorkout === workoutType
      )
    )
    .map((schedule) => schedule.date);

  const fixedAerialDates = schedules
    .filter((schedule) =>
      schedule.trainingDay.activities.some(
        (activity) =>
          activity.type === "Aerial" &&
          schedule.activityContexts[activity.id]?.placementSource ===
            "FixedAerialCommitment"
      )
    )
    .map((schedule) => schedule.date);

  const isAdjacentToFixedAerial = strengthDates.some((strengthDate) =>
    fixedAerialDates.some(
      (aerialDate) => calendarDayDistance(strengthDate, aerialDate) <= 1
    )
  );

  return isAdjacentToFixedAerial ? [...AERIAL_FATIGUE_ROLES] : [];
}
