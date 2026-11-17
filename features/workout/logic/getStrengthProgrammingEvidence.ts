import type { StrengthWorkoutType, WorkoutSession } from "../types";
import type { AppliedStrengthProgrammingDecision } from "./strengthProgrammingRecommendation.ts";
import { evaluateStrengthSessionCompletion } from "./evaluateStrengthSessionCompletion.ts";

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
      (session.variantType === undefined || session.variantType === "FullGym") &&
      // Old records predate prescription snapshots, so retain their historical
      // meaning. New records must demonstrate the complete assigned session.
      (!session.prescriptionSnapshot ||
        evaluateStrengthSessionCompletion(session).classification === "FullSession")
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
