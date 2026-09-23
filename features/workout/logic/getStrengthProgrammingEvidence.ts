import type { StrengthWorkoutType, WorkoutSession } from "../types";
import type { AppliedStrengthProgrammingDecision } from "./strengthProgrammingRecommendation.ts";

export interface StrengthProgrammingEvidence {
  completedFullSessionsTotal: number;
  completedFullSessionsSinceDecision: number;
  latestDecision: AppliedStrengthProgrammingDecision | null;
}

export function getStrengthProgrammingEvidence(
  workoutType: StrengthWorkoutType,
  workoutHistory: WorkoutSession[],
  decisions: AppliedStrengthProgrammingDecision[]
): StrengthProgrammingEvidence {
  const completedFullSessionsTotal = workoutHistory.filter(
    (session) =>
      session.workoutType === workoutType &&
      Boolean(session.completedAt) &&
      (session.variantType === undefined || session.variantType === "FullGym")
  ).length;

  const latestDecision =
    [...decisions]
      .filter((decision) => decision.workoutType === workoutType)
      .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt))[0] ?? null;

  return {
    completedFullSessionsTotal,
    completedFullSessionsSinceDecision: Math.max(
      0,
      completedFullSessionsTotal -
        (latestDecision?.completedFullSessionsAtApplication ?? 0)
    ),
    latestDecision,
  };
}
