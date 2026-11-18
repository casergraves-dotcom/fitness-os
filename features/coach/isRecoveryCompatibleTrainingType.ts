import type { TrainingActivityType } from "@/features/workout/types";

export function isRecoveryCompatibleTrainingType(
  type: TrainingActivityType
) {
  return (
    type === "Walk" ||
    type === "Mobility" ||
    type === "Recovery" ||
    type === "Rest"
  );
}
