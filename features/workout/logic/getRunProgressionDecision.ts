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

const DEVELOPMENT_MIN_EASY_DURATION =
  20;

const DEVELOPMENT_MAX_EASY_DURATION =
  35;

const DEVELOPMENT_EASY_STEP =
  5;

const DEVELOPMENT_INTERVAL_DURATION =
  30;


// ============================================================
// Development Ladder
// ============================================================

interface DevelopmentIntervalStep {
  runMinutes: number;
  walkMinutes: number;
}

const DEVELOPMENT_INTERVAL_STEPS:
  DevelopmentIntervalStep[] = [
    {
      runMinutes: 2,
      walkMinutes: 2,
    },
    {
      runMinutes: 3,
      walkMinutes: 2,
    },
    {
      runMinutes: 4,
      walkMinutes: 2,
    },
    {
      runMinutes: 5,
      walkMinutes: 2,
    },
    {
      runMinutes: 5,
      walkMinutes: 1,
    },
  ];


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


function makeDevelopmentEasyPrescription(
  duration: number,
  note?: string
): RunProgressionPrescription {
  return {
    role:
      "Development",

    label:
      "Development Run",

    intensity:
      "Easy",

    durationMin:
      duration,

    durationMax:
      duration,

    note:
      note ??
      "Keep the effort controlled and conversational.",
  };
}


function makeDevelopmentIntervalPrescription(
  step: DevelopmentIntervalStep,
  note?: string
): RunProgressionPrescription {
  return {
    role:
      "Development",

    label:
      "Development Intervals",

    intensity:
      "Intervals",

    durationMin:
      DEVELOPMENT_INTERVAL_DURATION,

    durationMax:
      DEVELOPMENT_INTERVAL_DURATION,

    runIntervalMinutes:
      step.runMinutes,

    walkIntervalMinutes:
      step.walkMinutes,

    note:
      note ??
      `Alternate ${step.runMinutes} minute${step.runMinutes === 1 ? "" : "s"} running with ${step.walkMinutes} minute${step.walkMinutes === 1 ? "" : "s"} easy recovery for the prescribed duration.`,
  };
}


function getCurrentIntervalStepIndex(
  evaluation:
    RunProgressionEvaluation
) {
  if (
    evaluation.prescribedIntensity !==
      "Intervals" ||
    evaluation.prescribedRunIntervalMinutes ===
      null ||
    evaluation.prescribedWalkIntervalMinutes ===
      null
  ) {
    return -1;
  }

  return DEVELOPMENT_INTERVAL_STEPS
    .findIndex(
      (step) =>
        step.runMinutes ===
          evaluation
            .prescribedRunIntervalMinutes &&
        step.walkMinutes ===
          evaluation
            .prescribedWalkIntervalMinutes
    );
}


// ============================================================
// Development Progression
// ============================================================

function getDevelopmentEasyDecision(
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


  // ----------------------------------------------------------
  // Strong
  // ----------------------------------------------------------

  if (
    evaluation.status ===
      "Strong"
  ) {
    if (
      currentDuration <
      DEVELOPMENT_MAX_EASY_DURATION
    ) {
      const nextDuration =
        Math.min(
          DEVELOPMENT_MAX_EASY_DURATION,
          currentDuration +
            DEVELOPMENT_EASY_STEP
        );

      return {
        status: "Progress",

        reason:
          "The development run was completed comfortably, so the next easy-run duration can increase slightly.",

        nextPrescription:
          makeDevelopmentEasyPrescription(
            nextDuration
          ),
      };
    }


    return {
      status: "Progress",

      reason:
        "The development easy-run ceiling was completed comfortably, so the next prescription can introduce conservative interval work.",

      nextPrescription:
        makeDevelopmentIntervalPrescription(
          DEVELOPMENT_INTERVAL_STEPS[0],
          "Introductory quality session. Keep the running portions controlled rather than all-out."
        ),
    };
  }


  // ----------------------------------------------------------
  // Poor
  // ----------------------------------------------------------

  if (
    evaluation.status ===
      "Poor"
  ) {
    const nextDuration =
      clampDuration(
        currentDuration -
          DEVELOPMENT_EASY_STEP,
        DEVELOPMENT_MIN_EASY_DURATION
      );

    return {
      status: "Reduce",

      reason:
        "The development run was not completed at a sustainable level, so the next prescription should reduce easy-run duration.",

      nextPrescription:
        makeDevelopmentEasyPrescription(
          nextDuration,
          "Keep the effort easy and rebuild comfortable completion before progressing again."
        ),
    };
  }


  // ----------------------------------------------------------
  // Repeat
  // ----------------------------------------------------------

  return {
    status: "Repeat",

    reason:
      evaluation.status ===
        "Limited"
        ? "The development run showed limited completion or high effort, so repeat the current easy-run prescription."
        : "The development run was acceptable but did not clearly support increasing the prescription.",

    nextPrescription:
      makeDevelopmentEasyPrescription(
        currentDuration,
        "Repeat the current development-run prescription."
      ),
  };
}


function getDevelopmentIntervalDecision(
  evaluation:
    RunProgressionEvaluation
): RunProgressionDecision {
  const currentStepIndex =
    getCurrentIntervalStepIndex(
      evaluation
    );

  if (
    currentStepIndex < 0
  ) {
    return {
      status: "NoChange",
      reason:
        "The interval prescription did not match a recognized development progression step.",
      nextPrescription:
        null,
    };
  }


  const currentStep =
    DEVELOPMENT_INTERVAL_STEPS[
      currentStepIndex
    ];


  // ----------------------------------------------------------
  // Strong
  // ----------------------------------------------------------

  if (
    evaluation.status ===
      "Strong"
  ) {
    const nextStepIndex =
      Math.min(
        currentStepIndex + 1,
        DEVELOPMENT_INTERVAL_STEPS.length -
          1
      );

    const nextStep =
      DEVELOPMENT_INTERVAL_STEPS[
        nextStepIndex
      ];

    if (
      nextStepIndex ===
      currentStepIndex
    ) {
      return {
        status: "Repeat",

        reason:
          "The strongest current interval step was completed comfortably, so keep the interval structure stable rather than automatically making the session harder.",

        nextPrescription:
          makeDevelopmentIntervalPrescription(
            currentStep,
            "Repeat the current interval structure. Further progression should depend on future running-goal logic rather than automatically increasing intensity."
          ),
      };
    }

    return {
      status: "Progress",

      reason:
        "The interval session was completed comfortably, so progress one step by increasing the running-to-recovery ratio.",

      nextPrescription:
        makeDevelopmentIntervalPrescription(
          nextStep
        ),
    };
  }


  // ----------------------------------------------------------
  // Poor
  // ----------------------------------------------------------

  if (
    evaluation.status ===
      "Poor"
  ) {
    if (
      currentStepIndex === 0
    ) {
      return {
        status: "Reduce",

        reason:
          "The introductory interval session was not completed at a sustainable level, so return to the 35-minute easy development run.",

        nextPrescription:
          makeDevelopmentEasyPrescription(
            DEVELOPMENT_MAX_EASY_DURATION,
            "Return to comfortable easy running before reintroducing intervals."
          ),
      };
    }

    const previousStep =
      DEVELOPMENT_INTERVAL_STEPS[
        currentStepIndex - 1
      ];

    return {
      status: "Reduce",

      reason:
        "The interval session was not completed at a sustainable level, so step back one interval progression level.",

      nextPrescription:
        makeDevelopmentIntervalPrescription(
          previousStep,
          "Use the previous interval step and rebuild comfortable completion before progressing again."
        ),
    };
  }


  // ----------------------------------------------------------
  // Repeat
  // ----------------------------------------------------------

  return {
    status: "Repeat",

    reason:
      evaluation.status ===
        "Limited"
        ? "The interval session showed limited completion or high effort, so repeat the current work/recovery structure."
        : "The interval session was acceptable but did not clearly support progressing the work/recovery ratio.",

    nextPrescription:
      makeDevelopmentIntervalPrescription(
        currentStep,
        "Repeat the current interval structure."
      ),
  };
}


function getDevelopmentDecision(
  evaluation:
    RunProgressionEvaluation
): RunProgressionDecision {
  if (
    evaluation.prescribedIntensity ===
      "Intervals"
  ) {
    return getDevelopmentIntervalDecision(
      evaluation
    );
  }

  return getDevelopmentEasyDecision(
    evaluation
  );
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
