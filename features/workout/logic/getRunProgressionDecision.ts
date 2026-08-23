import type {
  RunProgressionPrescription,
} from "../types";

import type {
  RunProgressionEvaluation,
} from "./evaluateRunProgression";


// ============================================================
// Types
// ============================================================

export type RunProgressionDecisionStatus =
  | "NoChange"
  | "Progress"
  | "Repeat"
  | "Reduce";


export interface RunProgressionDecision {
  status:
    RunProgressionDecisionStatus;

  reason: string;

  nextPrescription:
    RunProgressionPrescription | null;
}


// ============================================================
// Configuration
// ============================================================

const ENDURANCE_DURATION_STEP =
  5;

const ENDURANCE_MIN_DURATION =
  20;

const DEVELOPMENT_DURATION_STEP =
  5;

const DEVELOPMENT_MIN_DURATION =
  20;

const DEVELOPMENT_MAX_EASY_DURATION =
  35;


// ============================================================
// Helpers
// ============================================================

function clampDuration(
  value: number,
  minimum: number
) {
  return Math.max(
    minimum,
    value
  );
}


// ============================================================
// Development Progression
// ============================================================

function getDevelopmentDecision(
  evaluation:
    RunProgressionEvaluation
): RunProgressionDecision {
  const currentDuration =
    evaluation
      .prescribedDurationMinutes;

  if (
    currentDuration === null
  ) {
    return {
      status: "NoChange",
      reason:
        "No usable development-run duration was available.",
      nextPrescription:
        null,
    };
  }


  if (
    evaluation.status ===
      "Strong"
  ) {
    const nextDuration =
      Math.min(
        DEVELOPMENT_MAX_EASY_DURATION,
        currentDuration +
          DEVELOPMENT_DURATION_STEP
      );

    return {
      status: "Progress",

      reason:
        nextDuration >
        currentDuration
          ? "The development run was completed comfortably, so the next easy-run duration can increase slightly."
          : "The easy-run duration target has reached its current development ceiling; keep the duration stable until quality-work progression is introduced.",

      nextPrescription: {
        role:
          "Development",

        label:
          "Development Run",

        intensity:
          "Easy",

        durationMin:
          nextDuration,

        durationMax:
          nextDuration,

        note:
          "Keep the effort controlled. Quality work such as intervals should only be introduced when the running progression model explicitly supports it.",
      },
    };
  }


  if (
    evaluation.status ===
      "Poor"
  ) {
    const nextDuration =
      clampDuration(
        currentDuration -
          DEVELOPMENT_DURATION_STEP,
        DEVELOPMENT_MIN_DURATION
      );

    return {
      status: "Reduce",

      reason:
        "The development run was not completed at a sustainable level, so the next prescription should reduce duration.",

      nextPrescription: {
        role:
          "Development",

        label:
          "Development Run",

        intensity:
          "Easy",

        durationMin:
          nextDuration,

        durationMax:
          nextDuration,

        note:
          "Keep the effort easy and rebuild comfortable completion before progressing again.",
      },
    };
  }


  return {
    status: "Repeat",

    reason:
      evaluation.status ===
        "Limited"
        ? "The development run showed limited completion or high effort, so repeat the current prescription."
        : "The development run was acceptable but did not clearly support increasing the prescription.",

    nextPrescription: {
      role:
        "Development",

      label:
        "Development Run",

      intensity:
        "Easy",

      durationMin:
        currentDuration,

      durationMax:
        currentDuration,

      note:
        "Repeat the current development-run prescription.",
    },
  };
}


// ============================================================
// Endurance Progression
// ============================================================

function getEnduranceDecision(
  evaluation:
    RunProgressionEvaluation
): RunProgressionDecision {
  const currentDuration =
    evaluation
      .prescribedDurationMinutes;

  if (
    currentDuration === null
  ) {
    return {
      status: "NoChange",
      reason:
        "No usable endurance-run duration was available.",
      nextPrescription:
        null,
    };
  }


  if (
    evaluation.status ===
      "Strong"
  ) {
    const nextDuration =
      currentDuration +
      ENDURANCE_DURATION_STEP;

    return {
      status: "Progress",

      reason:
        "The endurance run was completed comfortably, so the next duration can increase by 5 minutes.",

      nextPrescription: {
        role:
          "Endurance",

        label:
          "Long Run / Hike",

        intensity:
          "Easy",

        durationMin:
          nextDuration,

        durationMax:
          nextDuration,

        note:
          "Keep the effort conversational and prioritize sustainable duration.",
      },
    };
  }


  if (
    evaluation.status ===
      "Poor"
  ) {
    const nextDuration =
      clampDuration(
        currentDuration -
          ENDURANCE_DURATION_STEP,
        ENDURANCE_MIN_DURATION
      );

    return {
      status: "Reduce",

      reason:
        "The endurance session was not completed at a sustainable level, so reduce the next duration by 5 minutes.",

      nextPrescription: {
        role:
          "Endurance",

        label:
          "Long Run / Hike",

        intensity:
          "Easy",

        durationMin:
          nextDuration,

        durationMax:
          nextDuration,

        note:
          "Keep the effort conversational and rebuild comfortable duration before progressing again.",
      },
    };
  }


  return {
    status: "Repeat",

    reason:
      evaluation.status ===
        "Limited"
        ? "The endurance session showed limited completion or high effort, so repeat the current duration."
        : "The endurance session was acceptable but did not clearly support increasing duration.",

    nextPrescription: {
      role:
        "Endurance",

      label:
        "Long Run / Hike",

      intensity:
        "Easy",

      durationMin:
        currentDuration,

      durationMax:
        currentDuration,

      note:
        "Repeat the current endurance duration.",
    },
  };
}


// ============================================================
// Decision
// ============================================================

export function getRunProgressionDecision(
  evaluation:
    RunProgressionEvaluation
): RunProgressionDecision {
  if (
    evaluation.status ===
      "NoData" ||
    !evaluation.role
  ) {
    return {
      status: "NoChange",
      reason:
        "No completed scheduled run with a usable progression prescription was available.",
      nextPrescription:
        null,
    };
  }


  if (
    evaluation.role ===
      "Development"
  ) {
    return getDevelopmentDecision(
      evaluation
    );
  }


  return getEnduranceDecision(
    evaluation
  );
}
