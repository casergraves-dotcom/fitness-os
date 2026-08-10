import type {
  MorningCheckInRatings,
} from "../components/MorningCheckIn";


// ============================================================
// Types
// ============================================================

export type ReadinessStatus =
  | "high"
  | "normal"
  | "low"
  | "very-low";


export type ReadinessFactor =
  | "energy"
  | "sleep"
  | "mood"
  | "stress"
  | "upper-soreness"
  | "lower-soreness";


export interface ReadinessResult {
  score: number;

  status:
    ReadinessStatus;

  label: string;

  limitingFactors:
    ReadinessFactor[];
}


// ============================================================
// Weights
// ============================================================

const READINESS_WEIGHTS = {
  energy: 0.25,
  sleep: 0.25,
  mood: 0.15,
  stress: 0.15,
  soreness: 0.20,
} as const;


// ============================================================
// Helpers
// ============================================================

function getStatusFromScore(
  score: number
): ReadinessStatus {
  if (score >= 4.25) {
    return "high";
  }

  if (score >= 3.5) {
    return "normal";
  }

  if (score >= 2.75) {
    return "low";
  }

  return "very-low";
}


function applyReadinessGuardrails(
  status: ReadinessStatus,
  ratings: MorningCheckInRatings
): ReadinessStatus {

  const {
    Energy,
    Sleep,
    Stress,
    UpperBodySoreness,
    LowerBodySoreness,
  } = ratings;


  // ----------------------------------------------------------
  // Severe Recovery Flags
  // ----------------------------------------------------------
  //
  // Very poor energy or sleep should override the weighted
  // average and classify the day as a recovery priority.

  if (
    Energy === 1 ||
    Sleep === 1
  ) {
    return "very-low";
  }


  // ----------------------------------------------------------
  // Significant Recovery Flags
  // ----------------------------------------------------------
  //
  // Very high stress or soreness prevents Fitness OS from
  // classifying the day as normal or high readiness.

  if (
    Stress === 5 ||
    UpperBodySoreness === 5 ||
    LowerBodySoreness === 5
  ) {
    if (
      status === "high" ||
      status === "normal"
    ) {
      return "low";
    }
  }


  // ----------------------------------------------------------
  // Moderate Recovery Flags
  // ----------------------------------------------------------
  //
  // Low energy or sleep prevents a High Readiness
  // classification even when the weighted average is strong.

  if (
    Energy === 2 ||
    Sleep === 2
  ) {
    if (status === "high") {
      return "normal";
    }
  }


  return status;
}


function getReadinessLabel(
  status: ReadinessStatus
) {
  switch (status) {

    case "high":
      return "High Readiness";

    case "normal":
      return "Ready to Train";

    case "low":
      return "Reduced Readiness";

    case "very-low":
      return "Recovery Priority";
  }
}


// ============================================================
// Readiness Calculation
// ============================================================

export function calculateReadiness(
  ratings:
    MorningCheckInRatings
): ReadinessResult | null {

  const {
    Energy,
    Sleep,
    Mood,
    Stress,
    UpperBodySoreness,
    LowerBodySoreness,
  } = ratings;


  // ----------------------------------------------------------
  // Require Complete Check-In
  // ----------------------------------------------------------

  if (
    Energy <= 0 ||
    Sleep <= 0 ||
    Mood <= 0 ||
    Stress <= 0 ||
    UpperBodySoreness <= 0 ||
    LowerBodySoreness <= 0
  ) {
    return null;
  }


  // ----------------------------------------------------------
  // Convert Negative Measures
  // ----------------------------------------------------------
  //
  // Stress and soreness:
  //
  // 1 = good
  // 5 = bad
  //
  // Readiness:
  //
  // 1 = poor
  // 5 = excellent

  const stressRecovery =
    6 - Stress;


  const averageSoreness =
    (
      UpperBodySoreness +
      LowerBodySoreness
    ) / 2;


  const sorenessRecovery =
    6 - averageSoreness;


  // ----------------------------------------------------------
  // Weighted Readiness Score
  // ----------------------------------------------------------

  const score =
    Energy *
      READINESS_WEIGHTS.energy +

    Sleep *
      READINESS_WEIGHTS.sleep +

    Mood *
      READINESS_WEIGHTS.mood +

    stressRecovery *
      READINESS_WEIGHTS.stress +

    sorenessRecovery *
      READINESS_WEIGHTS.soreness;


  // ----------------------------------------------------------
  // Classification
  // ----------------------------------------------------------

  const scoreStatus =
    getStatusFromScore(
      score
    );


  const status =
    applyReadinessGuardrails(
      scoreStatus,
      ratings
    );


  // ----------------------------------------------------------
  // Limiting Factors
  // ----------------------------------------------------------

  const limitingFactors:
    ReadinessFactor[] = [];


  if (Energy <= 2) {
    limitingFactors.push(
      "energy"
    );
  }


  if (Sleep <= 2) {
    limitingFactors.push(
      "sleep"
    );
  }


  if (Mood <= 2) {
    limitingFactors.push(
      "mood"
    );
  }


  if (Stress >= 4) {
    limitingFactors.push(
      "stress"
    );
  }


  if (
    UpperBodySoreness >= 4
  ) {
    limitingFactors.push(
      "upper-soreness"
    );
  }


  if (
    LowerBodySoreness >= 4
  ) {
    limitingFactors.push(
      "lower-soreness"
    );
  }


  // ----------------------------------------------------------
  // Result
  // ----------------------------------------------------------

  return {
    score,

    status,

    label:
      getReadinessLabel(
        status
      ),

    limitingFactors,
  };
}