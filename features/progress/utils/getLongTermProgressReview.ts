import type {
  BodyCompositionMilestone,
} from "../hooks/useBodyCompositionMilestones";

import type {
  BodyCompositionPeriodComparison,
} from "./getBodyCompositionPeriodComparison";

import type {
  PeriodDexaComparisonResult,
} from "./getPeriodDexaComparison";

import type {
  ProgressReviewAdherence,
} from "./getProgressReviewAdherence";

import type {
  ProgressReviewDomainTrends,
} from "./getProgressReviewDomainTrends";

import {
  isDateInProgressReviewPeriod,
} from "./getProgressReviewPeriod";

import type {
  ProgressReviewPeriod,
} from "./getProgressReviewPeriod";

import type {
  StrengthRetentionReview,
} from "./getStrengthRetentionReview";


// ============================================================
// Types
// ============================================================

export type LongTermProgressReviewObservationType =
  | "BodyComposition"
  | "Dexa"
  | "Strength"
  | "Running"
  | "Recovery"
  | "Adherence"
  | "Milestone";


export interface LongTermProgressReviewObservation {
  type:
    LongTermProgressReviewObservationType;

  message: string;
}


export interface LongTermProgressReview {
  period:
    ProgressReviewPeriod;

  bodyComposition:
    BodyCompositionPeriodComparison;

  dexa:
    PeriodDexaComparisonResult |
    null;

  domainTrends:
    ProgressReviewDomainTrends;

  strengthRetention:
    StrengthRetentionReview |
    null;

  adherence:
    ProgressReviewAdherence;

  milestones:
    BodyCompositionMilestone[];

  observations:
    LongTermProgressReviewObservation[];

  dataLimitations:
    string[];

  scopeNotes:
    string[];
}


// ============================================================
// Helpers
// ============================================================

function formatSignedNumber(
  value:
    number
) {
  return value >
    0
    ? `+${value}`
    : String(
        value
      );
}


function getBodyCompositionObservation(
  comparison:
    BodyCompositionPeriodComparison
): LongTermProgressReviewObservation | null {
  if (
    comparison.current.changeLb ===
      null ||
    comparison.current.weeklyChangeLb ===
      null ||
    comparison.current.sampleCount <
      2 ||
    comparison.current.evidenceSpanDays <
      14
  ) {
    return null;
  }

  const currentPeriodMessage =
    `The body-weight trend changed by ${formatSignedNumber(
      comparison.current
        .changeLb
    )} lb during ${comparison.currentPeriod.label.toLowerCase()}, averaging ${formatSignedNumber(
      comparison.current
        .weeklyChangeLb
    )} lb per week.`;

  if (
    comparison.status !==
      "Comparable" ||
    comparison.previous.weeklyChangeLb ===
      null ||
    comparison.weeklyRateDifferenceLb ===
      null
  ) {
    return {
      type:
        "BodyComposition",

      message:
        `${currentPeriodMessage} ${comparison.reason}`,
    };
  }

  const rateDifference =
    Math.abs(
      comparison
        .weeklyRateDifferenceLb
    );

  const comparisonMessage =
    rateDifference <
    0.1
      ? "The rate was similar to the preceding period."
      : `The weekly rate differed from the preceding period by ${formatSignedNumber(
          comparison
            .weeklyRateDifferenceLb
        )} lb per week.`;

  return {
    type:
      "BodyComposition",

    message:
      `${currentPeriodMessage} ${comparisonMessage}`,
  };
}


function getDexaObservation(
  dexa:
    PeriodDexaComparisonResult |
    null
): LongTermProgressReviewObservation | null {
  if (
    !dexa ||
    dexa.status !==
      "Available" ||
    !dexa.comparison
  ) {
    return null;
  }

  const metricSummary =
    dexa.comparison.metrics
      .map(
        (
          metric
        ) =>
          `${metric.label} ${formatSignedNumber(
            metric.change
          )}${metric.unit === "lb" ? " lb" : "%"}`
      )
      .join(
        ", "
      );

  return {
    type:
      "Dexa",

    message:
      `DEXA changes from ${dexa.comparison.earlier.scanDate} to ${dexa.comparison.later.scanDate}: ${metricSummary}.`,
  };
}


function getStrengthObservation({
  strengthRetention,
  domainTrends,
}: {
  strengthRetention:
    StrengthRetentionReview |
    null;

  domainTrends:
    ProgressReviewDomainTrends;
}): LongTermProgressReviewObservation | null {
  if (
    strengthRetention
  ) {
    return strengthRetention.status ===
      "InsufficientData"
      ? null
      : {
          type:
            "Strength",

          message:
            strengthRetention
              .message,
        };
  }

  // Temporary compatibility path while callers migrate from
  // one selected exercise to whole-program strength retention.
  switch (
    domainTrends.strength.status
  ) {
    case "Improving":
      return {
        type:
          "Strength",

        message:
          "Estimated strength for the selected exercise improved during the review period.",
      };

    case "Maintained":
      return {
        type:
          "Strength",

        message:
          "Estimated strength for the selected exercise was maintained during the review period.",
      };

    case "Declining":
      return {
        type:
          "Strength",

        message:
          "Estimated strength for the selected exercise declined enough during the review period to be worth monitoring.",
      };

    case "InsufficientData":
    default:
      return null;
  }
}


function getRunningObservation(
  trends:
    ProgressReviewDomainTrends
): LongTermProgressReviewObservation | null {
  switch (
    trends.running.status
  ) {
    case "Improving":
      return {
        type:
          "Running",

        message:
          "Running pace improved during the review period.",
      };

    case "Maintained":
      return {
        type:
          "Running",

        message:
          "Running pace was maintained during the review period.",
      };

    case "Declining":
      return {
        type:
          "Running",

        message:
          "Running pace declined enough during the review period to be worth monitoring.",
      };

    case "InsufficientData":
    default:
      return null;
  }
}


function getRecoveryObservation(
  trends:
    ProgressReviewDomainTrends
): LongTermProgressReviewObservation | null {
  switch (
    trends.recovery.status
  ) {
    case "Improving":
      return {
        type:
          "Recovery",

        message:
          "Recent readiness improved compared with the preceding check-ins inside the review period.",
      };

    case "Maintained":
      return {
        type:
          "Recovery",

        message:
          "Readiness remained relatively stable across the comparison windows inside the review period.",
      };

    case "Declining":
      return {
        type:
          "Recovery",

        message:
          "Recent readiness declined compared with the preceding check-ins inside the review period.",
      };

    case "InsufficientData":
    default:
      return null;
  }
}


function getAdherenceObservation(
  adherence:
    ProgressReviewAdherence
): LongTermProgressReviewObservation | null {
  if (
    adherence.adherenceRate ===
      null ||
    adherence.evaluatedWeekCount ===
      0
  ) {
    return null;
  }

  return {
    type:
      "Adherence",

    message:
      `${Math.round(
        adherence.adherenceRate *
        100
      )}% of required training was completed across ${adherence.evaluatedWeekCount} complete evaluated week${adherence.evaluatedWeekCount === 1 ? "" : "s"} in the review period.`,
  };
}


function getMilestoneObservations(
  milestones:
    BodyCompositionMilestone[]
): LongTermProgressReviewObservation[] {
  return milestones.map(
    (
      milestone
    ) => ({
      type:
        "Milestone",

      message:
        `${milestone.label} was reached${milestone.achievedDate ? ` on ${milestone.achievedDate}` : ""}.`,
    })
  );
}


// ============================================================
// Long-Term Progress Review
// ============================================================

export function getLongTermProgressReview({
  period,
  bodyComposition,
  dexa,
  domainTrends,
  strengthRetention,
  adherence,
  milestones,
}: {
  period:
    ProgressReviewPeriod;

  bodyComposition:
    BodyCompositionPeriodComparison;

  dexa?:
    PeriodDexaComparisonResult;

  domainTrends:
    ProgressReviewDomainTrends;

  strengthRetention?:
    StrengthRetentionReview;

  adherence:
    ProgressReviewAdherence;

  milestones:
    BodyCompositionMilestone[];
}): LongTermProgressReview {
  const resolvedDexa =
    dexa ??
    null;

  const resolvedStrengthRetention =
    strengthRetention ??
    null;

  const periodMilestones =
    milestones.filter(
      (
        milestone
      ) =>
        milestone.achieved &&
        milestone.achievedDate &&
        isDateInProgressReviewPeriod(
          milestone.achievedDate,
          period
        )
    );

  const observations:
    LongTermProgressReviewObservation[] = [];

  const bodyCompositionObservation =
    getBodyCompositionObservation(
      bodyComposition
    );

  const dexaObservation =
    getDexaObservation(
      resolvedDexa
    );

  const strengthObservation =
    getStrengthObservation({
      strengthRetention:
        resolvedStrengthRetention,

      domainTrends,
    });

  const runningObservation =
    getRunningObservation(
      domainTrends
    );

  const recoveryObservation =
    getRecoveryObservation(
      domainTrends
    );

  const adherenceObservation =
    getAdherenceObservation(
      adherence
    );

  if (
    bodyCompositionObservation
  ) {
    observations.push(
      bodyCompositionObservation
    );
  }

  if (
    dexaObservation
  ) {
    observations.push(
      dexaObservation
    );
  }

  if (
    strengthObservation
  ) {
    observations.push(
      strengthObservation
    );
  }

  if (
    runningObservation
  ) {
    observations.push(
      runningObservation
    );
  }

  if (
    recoveryObservation
  ) {
    observations.push(
      recoveryObservation
    );
  }

  if (
    adherenceObservation
  ) {
    observations.push(
      adherenceObservation
    );
  }

  observations.push(
    ...getMilestoneObservations(
      periodMilestones
    )
  );


  // ----------------------------------------------------------
  // Data Limitations
  // ----------------------------------------------------------

  const dataLimitations:
    string[] = [];

  if (
    bodyComposition.status ===
      "InsufficientData" &&
    !bodyCompositionObservation
  ) {
    dataLimitations.push(
      bodyComposition.reason
    );
  }

  if (
    resolvedDexa?.limitation
  ) {
    dataLimitations.push(
      resolvedDexa
        .limitation
    );
  }

  if (
    resolvedStrengthRetention
  ) {
    if (
      resolvedStrengthRetention
        .status ===
      "InsufficientData"
    ) {
      dataLimitations.push(
        resolvedStrengthRetention
          .message
      );
    }
  } else if (
    domainTrends.strength.status ===
    "InsufficientData"
  ) {
    dataLimitations.push(
      "More selected-exercise history is needed within this review period before a strength trend can be identified."
    );
  }

  if (
    domainTrends.running.status ===
    "InsufficientData"
  ) {
    dataLimitations.push(
      "More runs with valid duration and distance are needed within this review period before a pace trend can be identified."
    );
  }

  if (
    domainTrends.recovery.status ===
    "InsufficientData"
  ) {
    dataLimitations.push(
      "At least six usable recovery check-ins are needed within this review period before recovery windows can be compared."
    );
  }

  if (
    adherence.evaluatedWeekCount ===
    0
  ) {
    dataLimitations.push(
      adherence.reason
    );
  }


  // ----------------------------------------------------------
  // Scope
  // ----------------------------------------------------------

  const scopeNotes = [
    resolvedStrengthRetention
      ? "Whole-program strength retention includes only exercises with enough repeated weighted performance evidence inside the selected period."
      : "Strength currently reflects one selected exercise and should not yet be presented as a complete whole-program strength-retention conclusion.",

    "Each domain uses the same review-period boundaries, but its canonical trend utility retains its own evidence requirements.",

    "DEXA changes compare the earliest and latest scans contained entirely within the selected review period.",

    "The review describes associations in the available history and does not attribute body-composition changes to one training or lifestyle factor.",
  ];


  // ----------------------------------------------------------
  // Result
  // ----------------------------------------------------------

  return {
    period,

    bodyComposition,

    dexa:
      resolvedDexa,

    domainTrends,

    strengthRetention:
      resolvedStrengthRetention,

    adherence,

    milestones:
      periodMilestones,

    observations,

    dataLimitations,

    scopeNotes,
  };
}