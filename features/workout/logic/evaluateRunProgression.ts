import type {
  CardioIntensity,
  RunProgressionRole,
  RunSession,
} from "../types";

import {
  isValidRpe,
  RPE_HIGH_EFFORT_MIN,
  RPE_MAXIMAL,
  RPE_SUSTAINABLE_MAX,
} from "../rpe";


// ============================================================
// Types
// ============================================================

export type RunProgressionStatus =
  | "NoData"
  | "Strong"
  | "Acceptable"
  | "Limited"
  | "Poor";


export interface RunProgressionEvaluation {
  status:
    RunProgressionStatus;

  role:
    RunProgressionRole | null;

  // Snapshot of the prescription that produced this
  // performance result.
  //
  // Development progression needs this context so an Easy
  // run can transition into intervals and an interval session
  // can progress or regress its work/recovery structure.
  prescribedIntensity:
    CardioIntensity | null;

  prescribedRunIntervalMinutes:
    number | null;

  prescribedWalkIntervalMinutes:
    number | null;

  durationCompletionRate:
    number | null;

  rpe:
    number | null;

  prescribedDurationMinutes:
    number | null;

  actualDurationMinutes:
    number | null;

  factor:
    string | null;
}


// ============================================================
// Thresholds
// ============================================================

const STRONG_DURATION_RATE =
  0.9;

const ACCEPTABLE_DURATION_RATE =
  0.75;

const POOR_DURATION_RATE =
  0.5;


// ============================================================
// Evaluation Builder
// ============================================================

function createEvaluation(
  run: RunSession,
  status: RunProgressionStatus,
  role: RunProgressionRole | null,
  durationCompletionRate:
    number | null,
  prescribedDuration:
    number | null,
  actualDuration:
    number | null,
  rpe:
    number | null,
  factor:
    string | null
): RunProgressionEvaluation {
  return {
    status,

    role,

    prescribedIntensity:
      run.intensity ??
      null,

    prescribedRunIntervalMinutes:
      run
        .prescribedRunIntervalMinutes ??
      null,

    prescribedWalkIntervalMinutes:
      run
        .prescribedWalkIntervalMinutes ??
      null,

    durationCompletionRate,

    rpe,

    prescribedDurationMinutes:
      prescribedDuration,

    actualDurationMinutes:
      actualDuration,

    factor,
  };
}


// ============================================================
// Evaluate Run Progression
// ============================================================

export function evaluateRunProgression(
  run:
    RunSession | null
): RunProgressionEvaluation {
  if (!run) {
    return {
      status: "NoData",

      role: null,

      prescribedIntensity:
        null,

      prescribedRunIntervalMinutes:
        null,

      prescribedWalkIntervalMinutes:
        null,

      durationCompletionRate:
        null,

      rpe: null,

      prescribedDurationMinutes:
        null,

      actualDurationMinutes:
        null,

      factor: null,
    };
  }


  const role =
    run
      .prescribedRunProgressionRole ??
    null;

  const prescribedDuration =
    run.prescribedDurationMin;

  const actualDuration =
    run.durationMinutes;

  const rpe =
    isValidRpe(
      run.rpe
    )
      ? run.rpe
      : null;


  // ----------------------------------------------------------
  // Insufficient Data
  // ----------------------------------------------------------

  if (
    !role ||
    prescribedDuration ===
      undefined ||
    prescribedDuration <= 0 ||
    actualDuration ===
      undefined ||
    actualDuration < 0
  ) {
    return createEvaluation(
      run,
      "NoData",
      role,
      null,
      prescribedDuration ??
        null,
      actualDuration ??
        null,
      rpe,
      null
    );
  }


  const durationCompletionRate =
    actualDuration /
    prescribedDuration;

  const factor =
    `Completed ${Math.round(
      durationCompletionRate *
        100
    )}% of the prescribed duration${
      rpe !== null
        ? ` at RPE ${rpe}`
        : ""
    }.`;


  // ----------------------------------------------------------
  // Poor
  // ----------------------------------------------------------

  if (
    durationCompletionRate <
      POOR_DURATION_RATE ||
    rpe ===
      RPE_MAXIMAL
  ) {
    return createEvaluation(
      run,
      "Poor",
      role,
      durationCompletionRate,
      prescribedDuration,
      actualDuration,
      rpe,
      factor
    );
  }


  // ----------------------------------------------------------
  // Limited
  // ----------------------------------------------------------

  if (
    durationCompletionRate <
      ACCEPTABLE_DURATION_RATE ||
    (
      rpe !== null &&
      rpe >=
        RPE_HIGH_EFFORT_MIN
    )
  ) {
    return createEvaluation(
      run,
      "Limited",
      role,
      durationCompletionRate,
      prescribedDuration,
      actualDuration,
      rpe,
      factor
    );
  }


  // ----------------------------------------------------------
  // Strong
  // ----------------------------------------------------------

  if (
    durationCompletionRate >=
      STRONG_DURATION_RATE &&
    (
      rpe === null ||
      rpe <=
        RPE_SUSTAINABLE_MAX
    )
  ) {
    return createEvaluation(
      run,
      "Strong",
      role,
      durationCompletionRate,
      prescribedDuration,
      actualDuration,
      rpe,
      factor
    );
  }


  // ----------------------------------------------------------
  // Acceptable
  // ----------------------------------------------------------

  return createEvaluation(
    run,
    "Acceptable",
    role,
    durationCompletionRate,
    prescribedDuration,
    actualDuration,
    rpe,
    factor
  );
}
