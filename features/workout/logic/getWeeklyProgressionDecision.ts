import type {
  TrainingActivityType,
} from "../types";

import type {
  WeeklyAdherenceResult,
} from "./evaluateWeeklyAdherence";


// ============================================================
// Progression Decision
// ============================================================

export type WeeklyProgressionStatus =
  | "Advance"
  | "AdvanceWithWarning"
  | "Hold";


export interface WeeklyProgressionDecision {
  status: WeeklyProgressionStatus;

  shouldAdvance: boolean;

  adherenceRate: number;

  scheduledStrengthCount: number;

  completedStrengthCount: number;

  requiredStrengthCount: number;

  reason: string;
}


// ============================================================
// Constants
// ============================================================

const PASSING_ADHERENCE_RATE =
  0.8;

const MINIMUM_ADHERENCE_RATE =
  0.6;

const MAX_REQUIRED_STRENGTH_SESSIONS =
  2;


// ============================================================
// Helpers
// ============================================================

function isStrengthActivity(
  type: TrainingActivityType
) {
  return type === "Strength";
}


// ============================================================
// Get Weekly Progression Decision
// ============================================================

export function getWeeklyProgressionDecision(
  adherence: WeeklyAdherenceResult
): WeeklyProgressionDecision {
  // ----------------------------------------------------------
  // Strength Sessions
  // ----------------------------------------------------------

  const scheduledStrength =
    adherence.activities.filter(
      (item) =>
        item.required &&
        isStrengthActivity(
          item.activity.type
        )
    );

  const completedStrength =
    scheduledStrength.filter(
      (item) =>
        item.completed
    );


  const scheduledStrengthCount =
    scheduledStrength.length;

  const completedStrengthCount =
    completedStrength.length;


  // Require up to two strength sessions, but never require
  // more than the current program week actually prescribes.
  const requiredStrengthCount =
    Math.min(
      MAX_REQUIRED_STRENGTH_SESSIONS,
      scheduledStrengthCount
    );


  const strengthRequirementMet =
    completedStrengthCount >=
    requiredStrengthCount;


  // ----------------------------------------------------------
  // Strong Week
  // ----------------------------------------------------------

  if (
    adherence.adherenceRate >=
      PASSING_ADHERENCE_RATE &&
    strengthRequirementMet
  ) {
    return {
      status: "Advance",

      shouldAdvance: true,

      adherenceRate:
        adherence.adherenceRate,

      scheduledStrengthCount,

      completedStrengthCount,

      requiredStrengthCount,

      reason:
        "Weekly training adherence met the progression target.",
    };
  }


  // ----------------------------------------------------------
  // Borderline Week
  // ----------------------------------------------------------
  //
  // A 60–79% week may still advance, but only when the
  // minimum strength requirement was completed.
  //
  // This prevents missed accessory/cardio work from holding
  // the entire program while still protecting the strength
  // progression that anchors the program.

  if (
    adherence.adherenceRate >=
      MINIMUM_ADHERENCE_RATE &&
    strengthRequirementMet
  ) {
    return {
      status:
        "AdvanceWithWarning",

      shouldAdvance: true,

      adherenceRate:
        adherence.adherenceRate,

      scheduledStrengthCount,

      completedStrengthCount,

      requiredStrengthCount,

      reason:
        "The week had reduced adherence, but enough key training was completed to continue progressing.",
    };
  }


  // ----------------------------------------------------------
  // Hold Week
  // ----------------------------------------------------------

  let reason =
    "Weekly adherence was too low to progress safely.";

  if (!strengthRequirementMet) {
    reason =
      requiredStrengthCount === 1
        ? "The required strength session was not completed."
        : `Only ${completedStrengthCount} of the minimum ${requiredStrengthCount} strength sessions were completed.`;
  }


  return {
    status: "Hold",

    shouldAdvance: false,

    adherenceRate:
      adherence.adherenceRate,

    scheduledStrengthCount,

    completedStrengthCount,

    requiredStrengthCount,

    reason,
  };
}