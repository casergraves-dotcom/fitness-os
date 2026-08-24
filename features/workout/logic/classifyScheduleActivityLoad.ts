import type {
  TrainingActivity,
} from "../types";


// ============================================================
// Schedule Activity Load
// ============================================================

export type ScheduleLoadLevel =
  | "None"
  | "Recovery"
  | "Easy"
  | "Moderate"
  | "Hard";


export interface ScheduleActivityLoad {
  overall:
    ScheduleLoadLevel;

  strength:
    ScheduleLoadLevel;

  upperBody:
    ScheduleLoadLevel;

  lowerBody:
    ScheduleLoadLevel;

  aerobic:
    ScheduleLoadLevel;
}


// ============================================================
// Helpers
// ============================================================

function isReducedStrengthVolume(
  activity: TrainingActivity
) {
  const multiplier =
    activity.strengthVolumeMultiplier;

  return (
    multiplier !== undefined &&
    multiplier < 0.8
  );
}


// ============================================================
// Classify Schedule Activity Load
// ============================================================

export function classifyScheduleActivityLoad(
  activity: TrainingActivity
): ScheduleActivityLoad {
  // ----------------------------------------------------------
  // Strength
  // ----------------------------------------------------------
  //
  // Gym A / B / C are all full-body strength sessions.
  //
  // Deload prescriptions use strengthVolumeMultiplier to reduce
  // working-set volume and therefore scheduling stress.

  if (
    activity.type ===
    "Strength"
  ) {
    if (
      isReducedStrengthVolume(
        activity
      )
    ) {
      return {
        overall:
          "Moderate",

        strength:
          "Moderate",

        upperBody:
          "Moderate",

        lowerBody:
          "Moderate",

        aerobic:
          "None",
      };
    }

    return {
      overall:
        "Hard",

      strength:
        "Hard",

      upperBody:
        "Hard",

      lowerBody:
        "Hard",

      aerobic:
        "None",
    };
  }


  // ----------------------------------------------------------
  // Aerial
  // ----------------------------------------------------------
  //
  // Aerial represents meaningful training load, particularly
  // for upper body / pulling / grip demands.
  //
  // It is not modeled as equivalent to a full conventional
  // strength session, but it should influence adjacency.

  if (
    activity.type ===
    "Aerial"
  ) {
    return {
      overall:
        "Hard",

      strength:
        "Moderate",

      upperBody:
        "Hard",

      lowerBody:
        "Moderate",

      aerobic:
        "None",
    };
  }


  // ----------------------------------------------------------
  // Running
  // ----------------------------------------------------------

  if (
    activity.type ===
    "Run"
  ) {
    if (
      activity.cardioIntensity ===
        "Intervals" ||
      activity.cardioIntensity ===
        "Adaptive"
    ) {
      return {
        overall:
          "Hard",

        strength:
          "None",

        upperBody:
          "None",

        lowerBody:
          "Hard",

        aerobic:
          "Hard",
      };
    }

    return {
      overall:
        "Moderate",

      strength:
        "None",

      upperBody:
        "None",

      lowerBody:
        "Moderate",

      aerobic:
        "Easy",
    };
  }


  // ----------------------------------------------------------
  // Walking
  // ----------------------------------------------------------

  if (
    activity.type ===
    "Walk"
  ) {
    return {
      overall:
        "Easy",

      strength:
        "None",

      upperBody:
        "None",

      lowerBody:
        "Easy",

      aerobic:
        "Easy",
    };
  }


  // ----------------------------------------------------------
  // Mobility
  // ----------------------------------------------------------

  if (
    activity.type ===
    "Mobility"
  ) {
    return {
      overall:
        "Recovery",

      strength:
        "None",

      upperBody:
        "Easy",

      lowerBody:
        "Easy",

      aerobic:
        "None",
    };
  }


  // ----------------------------------------------------------
  // Recovery / Rest
  // ----------------------------------------------------------

  if (
    activity.type ===
      "Recovery" ||
    activity.type ===
      "Rest"
  ) {
    return {
      overall:
        "Recovery",

      strength:
        "None",

      upperBody:
        "None",

      lowerBody:
        "None",

      aerobic:
        "None",
    };
  }


  // ----------------------------------------------------------
  // Defensive Fallback
  // ----------------------------------------------------------

  return {
    overall:
      "Easy",

    strength:
      "None",

    upperBody:
      "None",

    lowerBody:
      "None",

    aerobic:
      "None",
  };
}