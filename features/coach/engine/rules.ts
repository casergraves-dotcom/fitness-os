import type {
  ReadinessFactor,
  ReadinessResult,
} from "@/features/recovery";


// ============================================================
// Factor Labels
// ============================================================

const READINESS_FACTOR_LABELS:
  Record<
    ReadinessFactor,
    string
  > = {
    energy:
      "energy",

    sleep:
      "sleep",

    mood:
      "mood",

    stress:
      "stress",

    "upper-soreness":
      "upper-body soreness",

    "lower-soreness":
      "lower-body soreness",
  };


// ============================================================
// Limiting Factor Labels
// ============================================================

export function getLimitingFactorLabels(
  readiness:
    ReadinessResult
): string[] {
  return readiness
    .limitingFactors
    .map(
      (factor) =>
        READINESS_FACTOR_LABELS[
          factor
        ]
    );
}


// ============================================================
// Limiting Factor Summary
// ============================================================

export function getLimitingFactorSummary(
  readiness:
    ReadinessResult
): string | null {

  const factors =
    getLimitingFactorLabels(
      readiness
    );


  // ----------------------------------------------------------
  // No Limiting Factors
  // ----------------------------------------------------------

  if (factors.length === 0) {
    return null;
  }


  // ----------------------------------------------------------
  // One Factor
  // ----------------------------------------------------------

  if (factors.length === 1) {
    return factors[0];
  }


  // ----------------------------------------------------------
  // Two Factors
  // ----------------------------------------------------------

  if (factors.length === 2) {
    return `${factors[0]} and ${factors[1]}`;
  }


  // ----------------------------------------------------------
  // Three or More Factors
  // ----------------------------------------------------------

  return `${factors
    .slice(
      0,
      -1
    )
    .join(
      ", "
    )}, and ${factors[
      factors.length - 1
    ]}`;
}


// ============================================================
// Readiness Context
// ============================================================

export function getReadinessContext(
  readiness:
    ReadinessResult
): string | null {

  const factors =
    getLimitingFactorSummary(
      readiness
    );

  if (!factors) {
    return null;
  }

  const hasMultipleFactors =
    readiness.limitingFactors.length > 1;

  const verb =
    hasMultipleFactors
      ? "are"
      : "is";

  switch (
    readiness.status
  ) {

    case "very-low":
      return hasMultipleFactors
        ? `Your ${factors} indicate that recovery should be the priority today.`
        : `Your ${factors} indicates that recovery should be the priority today.`;

    case "low":
      return `Your ${factors} ${verb} limiting today's readiness.`;

    case "normal":
      return `Your ${factors} ${verb} worth monitoring today.`;

    case "high":
      return null;
  }
}