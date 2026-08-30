import type { WeeklyAdherenceResult } from "../../workout/logic/evaluateWeeklyAdherence";

export function getRequiredAdherenceToDate(
  adherence: WeeklyAdherenceResult,
  asOfDate: string
) {
  const dueRequiredActivities = adherence.activities.filter(
    (item) => item.required && item.date <= asOfDate
  );
  const dueSubstitutionGroups = adherence.substitutionGroups.filter((group) => {
    const latestOpportunity = group.activities
      .map((item) => item.date)
      .sort()
      .at(-1);
    return (
      group.completed ||
      (latestOpportunity !== undefined && latestOpportunity <= asOfDate)
    );
  });
  const requiredScheduled =
    dueRequiredActivities.length + dueSubstitutionGroups.length;
  const requiredCompleted =
    dueRequiredActivities.filter((item) => item.completed).length +
    dueSubstitutionGroups.filter((group) => group.completed).length;

  return {
    requiredScheduled,
    requiredCompleted,
    adherenceRate:
      requiredScheduled === 0 ? 1 : requiredCompleted / requiredScheduled,
  };
}
