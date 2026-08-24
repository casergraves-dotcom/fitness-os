import type {
  TrainingPlanState,
} from "../types";


// ============================================================
// Types
// ============================================================

export interface ApplyTrainingActivityVariantOverrideInput {
  state:
    TrainingPlanState;

  trainingActivityId:
    string;

  originalDate:
    string;

  strengthWorkoutVariantId:
    string;

  overriddenAt:
    string;
}


// ============================================================
// Apply Training Activity Variant Override
// ============================================================
//
// Applies or replaces one persisted strength-workout variant
// override for a scheduled occurrence.
//
// trainingActivityId + originalDate is the stable occurrence key.
//
// This function intentionally does not validate whether the
// referenced variant exists or belongs to the scheduled Gym A / B
// / C session. The recommendation/launch layers are responsible
// for selecting a valid variant from the existing workout model.
//

export function applyTrainingActivityVariantOverride({
  state,
  trainingActivityId,
  originalDate,
  strengthWorkoutVariantId,
  overriddenAt,
}: ApplyTrainingActivityVariantOverrideInput):
  TrainingPlanState {

  const existing =
    state.activityVariantOverrides ??
    [];


  const nextOverride = {
    trainingActivityId,

    originalDate,

    strengthWorkoutVariantId,

    overriddenAt,
  };


  const existingIndex =
    existing.findIndex(
      (item) =>
        item.trainingActivityId ===
          trainingActivityId &&
        item.originalDate ===
          originalDate
    );


  if (
    existingIndex ===
    -1
  ) {
    return {
      ...state,

      activityVariantOverrides: [
        ...existing,
        nextOverride,
      ],
    };
  }


  const existingOverride =
    existing[
      existingIndex
    ];


  if (
    existingOverride
      .strengthWorkoutVariantId ===
    strengthWorkoutVariantId
  ) {
    return state;
  }


  const nextOverrides =
    [
      ...existing,
    ];


  nextOverrides[
    existingIndex
  ] =
    nextOverride;


  return {
    ...state,

    activityVariantOverrides:
      nextOverrides,
  };
}
