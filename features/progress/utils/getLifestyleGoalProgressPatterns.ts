// ============================================================
// Imports
// ============================================================

import type {
  LifestyleGoalProgressEvidence,
} from "./getLifestyleGoalProgressEvidence";


// ============================================================
// Types
// ============================================================

export type LifestylePatternCategory =
  | "Calories"
  | "Protein"
  | "Steps";


export type LifestylePatternDirection =
  | "SupportsGoal"
  | "MayLimitProgress"
  | "MayAccelerateProgress"
  | "ContextOnly";


export interface LifestyleGoalProgressPattern {
  id: string;

  category:
    LifestylePatternCategory;

  direction:
    LifestylePatternDirection;

  summary: string;

  detail: string;
}


export interface LifestyleGoalProgressPatternResult {
  evidenceReady: boolean;

  patterns:
    LifestyleGoalProgressPattern[];

  insufficientEvidenceReasons:
    string[];
}


// ============================================================
// Constants
// ============================================================

// These thresholds are intentionally conservative.
//
// The purpose is to identify persistent patterns worth mentioning,
// not to diagnose causes from imperfect self-reported lifestyle data.
// ============================================================

const LOW_ADHERENCE_PERCENT =
  50;

const GOOD_ADHERENCE_PERCENT =
  80;

const LOW_AVERAGE_PERCENT =
  90;

const HIGH_AVERAGE_PERCENT =
  110;


// ============================================================
// Helpers
// ============================================================

function isProgressSlowerThanDesired(
  status:
    LifestyleGoalProgressEvidence[
      "bodyComposition"
    ]["status"]
) {
  return (
    status ===
      "SlowerThanExpected" ||
    status ===
      "Plateau" ||
    status ===
      "MovingAwayFromGoal"
  );
}


function isProgressFasterThanExpected(
  status:
    LifestyleGoalProgressEvidence[
      "bodyComposition"
    ]["status"]
) {
  return (
    status ===
    "FasterThanExpected"
  );
}


// ============================================================
// Pattern Interpretation
// ============================================================

export function getLifestyleGoalProgressPatterns(
  evidence:
    LifestyleGoalProgressEvidence
): LifestyleGoalProgressPatternResult {
  const patterns:
    LifestyleGoalProgressPattern[] = [];

  const insufficientEvidenceReasons:
    string[] = [];


  // ----------------------------------------------------------
  // Body-Composition Evidence
  // ----------------------------------------------------------

  if (
    !evidence.bodyComposition.evidenceReady
  ) {
    insufficientEvidenceReasons.push(
      "Body-composition trend history is not yet sufficient for lifestyle context."
    );
  }


  // ----------------------------------------------------------
  // Lifestyle Evidence Availability
  // ----------------------------------------------------------

  const {
    protein,
    calories,
  } =
    evidence.nutrition;

  const {
    steps,
  } =
    evidence.activity;


  if (
    !protein.evidenceReady
  ) {
    insufficientEvidenceReasons.push(
      "Protein logging does not yet have enough multi-week coverage."
    );
  }

  if (
    !calories.evidenceReady
  ) {
    insufficientEvidenceReasons.push(
      "Calorie logging does not yet have enough multi-week coverage."
    );
  }

  if (
    !steps.evidenceReady
  ) {
    insufficientEvidenceReasons.push(
      "Step logging does not yet have enough multi-week coverage."
    );
  }


  // ----------------------------------------------------------
  // Stop Causal Interpretation Without Body-Composition Trend
  // ----------------------------------------------------------
  //
  // Lifestyle patterns can still exist independently, but Phase 5.3
  // is specifically about contextualizing observed goal progress.
  //
  // Without a meaningful body-composition trend, avoid presenting
  // lifestyle adherence as an explanation for progress.
  // ----------------------------------------------------------

  if (
    !evidence.bodyComposition.evidenceReady
  ) {
    return {
      evidenceReady:
        false,

      patterns,

      insufficientEvidenceReasons,
    };
  }


  const slowerThanDesired =
    isProgressSlowerThanDesired(
      evidence.bodyComposition.status
    );

  const fasterThanExpected =
    isProgressFasterThanExpected(
      evidence.bodyComposition.status
    );


  // ----------------------------------------------------------
  // Calories — Higher Pattern
  // ----------------------------------------------------------
  //
  // Require both a high average and repeated above-range days.
  // This prevents a small number of high-calorie days from being
  // treated as a persistent explanatory pattern.
  // ----------------------------------------------------------

  if (
    calories.evidenceReady &&
    calories.averagePercentOfTarget !==
      undefined &&
    calories.averagePercentOfTarget >
      HIGH_AVERAGE_PERCENT &&
    calories.loggedDays >
      0 &&
    (
      calories.daysAboveTarget /
      calories.loggedDays
    ) >=
      0.5
  ) {
    patterns.push({
      id:
        "calories-persistently-above-target",

      category:
        "Calories",

      direction:
        slowerThanDesired
          ? "MayLimitProgress"
          : "ContextOnly",

      summary:
        "Calories have been persistently above the configured target range.",

      detail:
        slowerThanDesired
          ? "This pattern may be relevant to slower-than-expected body-composition progress, but the available data does not establish that it is the cause."
          : "This is a persistent intake pattern worth monitoring, but current body-composition progress does not support treating it as a limiting factor.",
    });
  }


  // ----------------------------------------------------------
  // Calories — Lower Pattern
  // ----------------------------------------------------------

  if (
    calories.evidenceReady &&
    calories.averagePercentOfTarget !==
      undefined &&
    calories.averagePercentOfTarget <
      LOW_AVERAGE_PERCENT &&
    calories.loggedDays >
      0 &&
    (
      calories.daysBelowTarget /
      calories.loggedDays
    ) >=
      0.5
  ) {
    patterns.push({
      id:
        "calories-persistently-below-target",

      category:
        "Calories",

      direction:
        fasterThanExpected
          ? "MayAccelerateProgress"
          : "ContextOnly",

      summary:
        "Calories have been persistently below the configured target range.",

      detail:
        fasterThanExpected
          ? "This pattern may be relevant to faster-than-expected weight change. Fitness OS should not automatically lower targets or increase training because of it."
          : "This is a persistent intake pattern worth monitoring, especially alongside recovery and training quality.",
    });
  }


  // ----------------------------------------------------------
  // Calories — Consistent Pattern
  // ----------------------------------------------------------

  if (
    calories.evidenceReady &&
    calories.adherencePercent !==
      undefined &&
    calories.adherencePercent >=
      GOOD_ADHERENCE_PERCENT
  ) {
    patterns.push({
      id:
        "calories-consistently-on-target",

      category:
        "Calories",

      direction:
        "SupportsGoal",

      summary:
        "Calorie intake has been consistently within the configured target range.",

      detail:
        slowerThanDesired
          ? "Because calorie adherence appears consistent, the available evidence does not support immediately assuming calorie intake explains slower progress."
          : "Calorie adherence is currently aligned with the configured plan.",
    });
  }


  // ----------------------------------------------------------
  // Steps — Lower Activity Pattern
  // ----------------------------------------------------------

  if (
    steps.evidenceReady &&
    steps.adherencePercent !==
      undefined &&
    steps.averagePercentOfTarget !==
      undefined &&
    steps.adherencePercent <
      LOW_ADHERENCE_PERCENT &&
    steps.averagePercentOfTarget <
      LOW_AVERAGE_PERCENT
  ) {
    patterns.push({
      id:
        "steps-persistently-below-target",

      category:
        "Steps",

      direction:
        slowerThanDesired
          ? "MayLimitProgress"
          : "ContextOnly",

      summary:
        "Daily activity has been persistently below the configured step target.",

      detail:
        slowerThanDesired
          ? "Lower daily activity may be relevant to slower-than-expected body-composition progress, but it should be considered alongside nutrition, training, and recovery rather than treated as a single cause."
          : "Daily activity is running below the configured target, but current body-composition progress does not support treating it as a clear limiting factor.",
    });
  }


  // ----------------------------------------------------------
  // Steps — Consistent Pattern
  // ----------------------------------------------------------

  if (
    steps.evidenceReady &&
    steps.adherencePercent !==
      undefined &&
    steps.adherencePercent >=
      GOOD_ADHERENCE_PERCENT
  ) {
    patterns.push({
      id:
        "steps-consistently-on-target",

      category:
        "Steps",

      direction:
        "SupportsGoal",

      summary:
        "Daily activity has been consistently meeting the configured step target.",

      detail:
        slowerThanDesired
          ? "Because general-activity adherence appears consistent, the available evidence does not support immediately assuming low daily movement explains slower progress."
          : "General-activity adherence is currently aligned with the configured plan.",
    });
  }


  // ----------------------------------------------------------
  // Protein — Lower Pattern
  // ----------------------------------------------------------
  //
  // Protein is useful body-composition context, especially for
  // muscle retention and training support, but should not be
  // presented as a direct explanation for weight-loss rate.
  // ----------------------------------------------------------

  if (
    protein.evidenceReady &&
    protein.adherencePercent !==
      undefined &&
    protein.adherencePercent <
      LOW_ADHERENCE_PERCENT
  ) {
    patterns.push({
      id:
        "protein-persistently-below-target",

      category:
        "Protein",

      direction:
        "ContextOnly",

      summary:
        "Protein intake has frequently been below the configured target.",

      detail:
        "This may matter for muscle retention, recovery, and training support, but Fitness OS should not treat it as a direct explanation for the rate of weight change.",
    });
  }


  // ----------------------------------------------------------
  // Protein — Consistent Pattern
  // ----------------------------------------------------------

  if (
    protein.evidenceReady &&
    protein.adherencePercent !==
      undefined &&
    protein.adherencePercent >=
      GOOD_ADHERENCE_PERCENT
  ) {
    patterns.push({
      id:
        "protein-consistently-on-target",

      category:
        "Protein",

      direction:
        "SupportsGoal",

      summary:
        "Protein intake has been consistently meeting the configured target.",

      detail:
        "Protein adherence is currently supportive of muscle retention, recovery, and training while body-composition progress is evaluated separately.",
    });
  }


  // ----------------------------------------------------------
  // Result
  // ----------------------------------------------------------

  return {
    evidenceReady:
      evidence.lifestyleEvidenceReady,

    patterns,

    insufficientEvidenceReasons,
  };
}