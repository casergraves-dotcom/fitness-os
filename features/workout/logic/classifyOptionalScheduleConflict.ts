import type {
  ScheduleConflict,
} from "./evaluateScheduleConflicts";

import type {
  TrainingActivity,
} from "../types";


// ============================================================
// Types
// ============================================================

export interface OptionalScheduleConflictResolution {
  resolvable:
    boolean;

  optionalActivity?:
    TrainingActivity;

  requiredActivity?:
    TrainingActivity;

  substitutionGroup?:
    string;

  reason:
    string;
}


// ============================================================
// Helpers
// ============================================================

function isOptional(
  activity:
    TrainingActivity
) {
  return (
    activity.optional ===
    true
  );
}


// ============================================================
// Optional Conflict Classification
// ============================================================

export function classifyOptionalScheduleConflict(
  conflict:
    ScheduleConflict
): OptionalScheduleConflictResolution {

  const first =
    conflict.first.activity;

  const second =
    conflict.second.activity;


  const firstOptional =
    isOptional(
      first
    );

  const secondOptional =
    isOptional(
      second
    );


  // ----------------------------------------------------------
  // Exactly One Optional Activity
  // ----------------------------------------------------------
  //
  // This is the cleanest adaptive-planning case:
  //
  // required session
  //        +
  // optional session
  //
  // The required training can potentially keep the proposed
  // destination while the optional session is moved, skipped,
  // shortened, or substituted later.

  if (
    firstOptional &&
    !secondOptional
  ) {
    return {
      resolvable:
        true,

      optionalActivity:
        first,

      requiredActivity:
        second,

      substitutionGroup:
        first.substitutionGroup,

      reason:
        first.substitutionGroup
          ? `${first.label} is optional and belongs to substitution group "${first.substitutionGroup}", so this conflict can potentially be resolved without rejecting the required schedule move.`
          : `${first.label} is optional, so this conflict can potentially be resolved without rejecting the required schedule move.`,
    };
  }


  if (
    secondOptional &&
    !firstOptional
  ) {
    return {
      resolvable:
        true,

      optionalActivity:
        second,

      requiredActivity:
        first,

      substitutionGroup:
        second.substitutionGroup,

      reason:
        second.substitutionGroup
          ? `${second.label} is optional and belongs to substitution group "${second.substitutionGroup}", so this conflict can potentially be resolved without rejecting the required schedule move.`
          : `${second.label} is optional, so this conflict can potentially be resolved without rejecting the required schedule move.`,
    };
  }


  // ----------------------------------------------------------
  // Both Optional
  // ----------------------------------------------------------
  //
  // Two optional sessions conflicting with one another should
  // also not make an otherwise viable weekly rearrangement
  // impossible.
  //
  // We don't choose which one to modify here. That belongs to
  // the later recommendation/action layer.

  if (
    firstOptional &&
    secondOptional
  ) {
    return {
      resolvable:
        true,

      optionalActivity:
        first,

      substitutionGroup:
        first.substitutionGroup ??
        second.substitutionGroup,

      reason:
        `${first.label} and ${second.label} are both optional, so this conflict can be resolved by adjusting optional training rather than rejecting the weekly rearrangement.`,
    };
  }


  // ----------------------------------------------------------
  // Required vs Required
  // ----------------------------------------------------------

  return {
    resolvable:
      false,

    reason:
      `${first.label} and ${second.label} are both required for schedule-conflict purposes, so the conflict must remain part of the rearrangement evaluation.`,
  };
}