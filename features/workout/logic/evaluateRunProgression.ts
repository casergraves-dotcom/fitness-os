import type {
  RunProgressionRole,
  RunSession,
} from "../types";


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
    run.rpe !== undefined &&
    Number.isFinite(
      run.rpe
    )
      ? run.rpe
      : null;


  if (
    !role ||
    prescribedDuration ===
      undefined ||
    prescribedDuration <= 0 ||
    actualDuration ===
      undefined ||
    actualDuration < 0
  ) {
    return {
      status: "NoData",
      role,
      durationCompletionRate:
        null,
      rpe,
      prescribedDurationMinutes:
        prescribedDuration ??
        null,
      actualDurationMinutes:
        actualDuration ??
        null,
      factor: null,
    };
  }


  const durationCompletionRate =
    actualDuration /
    prescribedDuration;


  // ----------------------------------------------------------
  // Poor
  // ----------------------------------------------------------

  if (
    durationCompletionRate <
      POOR_DURATION_RATE ||
    rpe === 10
  ) {
    return {
      status: "Poor",
      role,
      durationCompletionRate,
      rpe,
      prescribedDurationMinutes:
        prescribedDuration,
      actualDurationMinutes:
        actualDuration,
      factor:
        `Completed ${Math.round(durationCompletionRate * 100)}% of the prescribed duration${rpe !== null ? ` at RPE ${rpe}` : ""}.`,
    };
  }


  // ----------------------------------------------------------
  // Limited
  // ----------------------------------------------------------

  if (
    durationCompletionRate <
      ACCEPTABLE_DURATION_RATE ||
    rpe === 9
  ) {
    return {
      status: "Limited",
      role,
      durationCompletionRate,
      rpe,
      prescribedDurationMinutes:
        prescribedDuration,
      actualDurationMinutes:
        actualDuration,
      factor:
        `Completed ${Math.round(durationCompletionRate * 100)}% of the prescribed duration${rpe !== null ? ` at RPE ${rpe}` : ""}.`,
    };
  }


  // ----------------------------------------------------------
  // Strong
  // ----------------------------------------------------------

  if (
    durationCompletionRate >=
      STRONG_DURATION_RATE &&
    (
      rpe === null ||
      rpe <= 7
    )
  ) {
    return {
      status: "Strong",
      role,
      durationCompletionRate,
      rpe,
      prescribedDurationMinutes:
        prescribedDuration,
      actualDurationMinutes:
        actualDuration,
      factor:
        `Completed ${Math.round(durationCompletionRate * 100)}% of the prescribed duration${rpe !== null ? ` at RPE ${rpe}` : ""}.`,
    };
  }


  // ----------------------------------------------------------
  // Acceptable
  // ----------------------------------------------------------

  return {
    status: "Acceptable",
    role,
    durationCompletionRate,
    rpe,
    prescribedDurationMinutes:
      prescribedDuration,
    actualDurationMinutes:
      actualDuration,
    factor:
      `Completed ${Math.round(durationCompletionRate * 100)}% of the prescribed duration${rpe !== null ? ` at RPE ${rpe}` : ""}.`,
  };
}