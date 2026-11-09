import type {
  WeeklyAdherenceResult,
} from "./evaluateWeeklyAdherence";

export interface WeeklyEvaluationReadiness {
  ready: boolean;
  latestOutstandingRequirementDate: string | null;
}

export function getWeeklyEvaluationReadiness(
  adherence: WeeklyAdherenceResult,
  currentDate: string
): WeeklyEvaluationReadiness {
  const outstandingDates = adherence.activities
    .filter(
      (item) =>
        item.required &&
        !item.completed
    )
    .map((item) => item.date);

  for (const group of adherence.substitutionGroups) {
    if (group.completed) {
      continue;
    }

    const latestGroupDate = group.activities
      .map((item) => item.date)
      .sort()
      .at(-1);

    if (latestGroupDate) {
      outstandingDates.push(latestGroupDate);
    }
  }

  const latestOutstandingRequirementDate =
    outstandingDates.sort().at(-1) ?? null;

  return {
    ready:
      latestOutstandingRequirementDate === null ||
      currentDate > latestOutstandingRequirementDate,
    latestOutstandingRequirementDate,
  };
}
