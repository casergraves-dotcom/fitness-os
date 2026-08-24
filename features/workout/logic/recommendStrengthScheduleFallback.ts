import {
  getStrengthWorkoutVariants,
  isStrengthWorkoutVariantAvailable,
} from "../backupWorkoutModel";

import type {
  StrengthWorkoutType,
  StrengthWorkoutVariant,
  WorkoutEquipment,
  WorkoutSetupCapability,
} from "../types";


// ============================================================
// Types
// ============================================================

export type StrengthScheduleDisruptionKind =
  | "DayUnavailable"
  | "GymUnavailable"
  | "TimeConstrained";


export type StrengthScheduleFallbackAction =
  | "Move"
  | "UseShortGym"
  | "UseHome";


export interface RecommendStrengthScheduleFallbackInput {
  strengthWorkout:
    StrengthWorkoutType;

  disruption:
    StrengthScheduleDisruptionKind;

  availableEquipment:
    WorkoutEquipment[];

  availableCapabilities:
    WorkoutSetupCapability[];
}


export interface StrengthScheduleFallbackRecommendation {
  action:
    StrengthScheduleFallbackAction;

  preferredVariant?:
    StrengthWorkoutVariant;

  reason:
    string;
}


// ============================================================
// Helpers
// ============================================================

function getVariant(
  strengthWorkout:
    StrengthWorkoutType,
  variantType:
    StrengthWorkoutVariant["variantType"]
) {
  return getStrengthWorkoutVariants(
    strengthWorkout
  ).find(
    (variant) =>
      variant.variantType ===
      variantType
  );
}


function isAvailable(
  variant:
    StrengthWorkoutVariant | undefined,
  availableEquipment:
    WorkoutEquipment[],
  availableCapabilities:
    WorkoutSetupCapability[]
) {
  return (
    variant !==
      undefined &&
    isStrengthWorkoutVariantAvailable(
      variant,
      availableEquipment,
      availableCapabilities
    )
  );
}


// ============================================================
// Strength Schedule Fallback Recommendation
// ============================================================
//
// This decision layer deliberately distinguishes three different
// real-life disruptions:
//
// DayUnavailable:
//   The user cannot train on the planned day. A same-day Short
//   Gym/Home workout does not solve that problem, so rescheduling
//   remains the appropriate response.
//
// GymUnavailable:
//   The user can still train, but cannot access the gym. Prefer a
//   valid Home variant when one is executable.
//
// TimeConstrained:
//   The user can train and can access the gym, but lacks enough
//   time for the full session. Prefer Short Gym when executable.
//
// The function does not apply anything. It only chooses which
// strategy should be offered to the adaptive scheduling layer.
//

export function recommendStrengthScheduleFallback({
  strengthWorkout,
  disruption,
  availableEquipment,
  availableCapabilities,
}: RecommendStrengthScheduleFallbackInput):
  StrengthScheduleFallbackRecommendation {

  const shortGym =
    getVariant(
      strengthWorkout,
      "ShortGym"
    );

  const home =
    getVariant(
      strengthWorkout,
      "Home"
    );


  if (
    disruption ===
    "DayUnavailable"
  ) {
    return {
      action:
        "Move",

      reason:
        `${strengthWorkout} cannot be performed on the planned day, so a same-day workout variant would not solve the availability problem. Rescheduling is preferred.`,
    };
  }


  if (
    disruption ===
    "GymUnavailable"
  ) {
    if (
      isAvailable(
        home,
        availableEquipment,
        availableCapabilities
      )
    ) {
      return {
        action:
          "UseHome",

        preferredVariant:
          home,

        reason:
          `${strengthWorkout} can stay on its planned day using the available Home variant, avoiding unnecessary disruption to the rest of the training week.`,
      };
    }


    return {
      action:
        "Move",

      reason:
        `The gym is unavailable and no executable Home variant is available in the current equipment/setup context, so rescheduling ${strengthWorkout} is preferred.`,
    };
  }


  if (
    isAvailable(
      shortGym,
      availableEquipment,
      availableCapabilities
    )
  ) {
    return {
      action:
        "UseShortGym",

      preferredVariant:
        shortGym,

      reason:
        `${strengthWorkout} can stay on its planned day using the Short Gym variant, preserving the session's training intent with less schedule disruption.`,
    };
  }


  return {
    action:
      "Move",

    reason:
      `No executable Short Gym variant is available for the current context, so rescheduling ${strengthWorkout} is preferred.`,
  };
}
