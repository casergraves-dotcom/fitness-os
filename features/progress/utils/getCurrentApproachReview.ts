import type {
  BodyCompositionGoalProgressStatus,
} from "../hooks/useBodyCompositionGoalProgress";

import type {
  CurrentApproachEvidence,
} from "./getCurrentApproachEvidence";

import type {
  ProgressReviewAdherence,
} from "./getProgressReviewAdherence";

import type {
  RunningProgressTrend,
} from "./getRunningProgressTrend";

import type {
  StrengthRetentionReview,
} from "./getStrengthRetentionReview";


// ============================================================
// Types
// ============================================================

export type CurrentApproachReviewStatus =
  | "NoActiveProgram"
  | "TooEarly"
  | "InsufficientEvidence"
  | "Supported"
  | "Mixed"
  | "NeedsAttention";


export type CurrentApproachSignalDomain =
  | "BodyComposition"
  | "Strength"
  | "Cardio"
  | "Adherence";


export type CurrentApproachSignalStatus =
  | "SupportsApproach"
  | "Mixed"
  | "Concern"
  | "InsufficientData";


export interface CurrentApproachSignal {
  domain:
    CurrentApproachSignalDomain;

  status:
    CurrentApproachSignalStatus;

  label: string;

  message: string;
}


export interface CurrentApproachReview {
  status:
    CurrentApproachReviewStatus;

  title: string;

  message: string;

  availableSignalCount: number;

  supportingSignalCount: number;

  mixedSignalCount: number;

  concernSignalCount: number;

  signals:
    CurrentApproachSignal[];
}


// ============================================================
// Constants
// ============================================================

const SUPPORTIVE_ADHERENCE_RATE =
  0.75;

const MIN_CONCLUSION_SIGNAL_COUNT =
  2;


// ============================================================
// Signal Builders
// ============================================================

function getBodyCompositionSignal(
  status:
    BodyCompositionGoalProgressStatus
): CurrentApproachSignal {
  switch (
    status
  ) {
    case "OnTrack":
      return {
        domain:
          "BodyComposition",

        status:
          "SupportsApproach",

        label:
          "On track",

        message:
          "Current-program body-composition progress is moving at about the intended rate.",
      };

    case "FasterThanExpected":
      return {
        domain:
          "BodyComposition",

        status:
          "SupportsApproach",

        label:
          "Faster than expected",

        message:
          "Current-program body-composition progress is moving toward the goal faster than expected.",
      };

    case "SlowerThanExpected":
      return {
        domain:
          "BodyComposition",

        status:
          "Mixed",

        label:
          "Slower than expected",

        message:
          "Current-program body-composition progress is moving toward the goal, but more slowly than expected.",
      };

    case "Plateau":
      return {
        domain:
          "BodyComposition",

        status:
          "Concern",

        label:
          "Plateau",

        message:
          "Current-program body-composition progress has remained relatively flat long enough to warrant attention.",
      };

    case "MovingAwayFromGoal":
      return {
        domain:
          "BodyComposition",

        status:
          "Concern",

        label:
          "Moving away from goal",

        message:
          "Current-program body-composition progress is moving away from the active goal.",
      };

    case "InsufficientData":
    default:
      return {
        domain:
          "BodyComposition",

        status:
          "InsufficientData",

        label:
          "Not enough data",

        message:
          "More current-program body-composition evidence is needed.",
      };
  }
}


function getStrengthSignal(
  review:
    StrengthRetentionReview |
    null
): CurrentApproachSignal {
  if (
    !review
  ) {
    return {
      domain:
        "Strength",

      status:
        "InsufficientData",

      label:
        "Not enough data",

      message:
        "A current program is needed before strength retention can be evaluated.",
    };
  }

  switch (
    review.status
  ) {
    case "Improving":
      return {
        domain:
          "Strength",

        status:
          "SupportsApproach",

        label:
          "Improving",

        message:
          review.message,
      };

    case "Maintained":
      return {
        domain:
          "Strength",

        status:
          "SupportsApproach",

        label:
          "Maintained",

        message:
          review.message,
      };

    case "Mixed":
      return {
        domain:
          "Strength",

        status:
          "Mixed",

        label:
          "Mixed",

        message:
          review.message,
      };

    case "Declining":
      return {
        domain:
          "Strength",

        status:
          "Concern",

        label:
          "Declining",

        message:
          review.message,
      };

    case "InsufficientData":
    default:
      return {
        domain:
          "Strength",

        status:
          "InsufficientData",

        label:
          "Not enough data",

        message:
          review.message,
      };
  }
}


function getCardioSignal(
  trend:
    RunningProgressTrend |
    null
): CurrentApproachSignal {
  if (
    !trend
  ) {
    return {
      domain:
        "Cardio",

      status:
        "InsufficientData",

      label:
        "Not enough data",

      message:
        "A current program is needed before cardio progress can be evaluated.",
    };
  }

  switch (
    trend.status
  ) {
    case "Improving":
      return {
        domain:
          "Cardio",

        status:
          "SupportsApproach",

        label:
          "Improving",

        message:
          "Running pace improved during the current-program evidence window.",
      };

    case "Maintained":
      return {
        domain:
          "Cardio",

        status:
          "SupportsApproach",

        label:
          "Maintained",

        message:
          "Running pace was maintained during the current-program evidence window.",
      };

    case "Declining":
      return {
        domain:
          "Cardio",

        status:
          "Concern",

        label:
          "Declining",

        message:
          "Running pace declined during the current-program evidence window.",
      };

    case "InsufficientData":
    default:
      return {
        domain:
          "Cardio",

        status:
          "InsufficientData",

        label:
          "Not enough data",

        message:
          "More runs with valid duration and distance are needed during the current program.",
      };
  }
}


function getAdherenceSignal(
  adherence:
    ProgressReviewAdherence |
    null
): CurrentApproachSignal {
  if (
    !adherence ||
    adherence.adherenceRate ===
      null ||
    adherence.evaluatedWeekCount ===
      0
  ) {
    return {
      domain:
        "Adherence",

      status:
        "InsufficientData",

      label:
        "Not enough data",

      message:
        adherence?.reason ??
        "A current program is needed before adherence can be evaluated.",
    };
  }

  const adherencePercent =
    Math.round(
      adherence.adherenceRate *
        100
    );

  if (
    adherence.adherenceRate >=
      SUPPORTIVE_ADHERENCE_RATE
  ) {
    return {
      domain:
        "Adherence",

      status:
        "SupportsApproach",

      label:
        `${adherencePercent}%`,

      message:
        `${adherencePercent}% of required training was completed across ${adherence.evaluatedWeekCount} complete evaluated week${adherence.evaluatedWeekCount === 1 ? "" : "s"} during the current program.`,
    };
  }

  return {
    domain:
      "Adherence",

    status:
      "Concern",

    label:
      `${adherencePercent}%`,

    message:
      `${adherencePercent}% of required training was completed across ${adherence.evaluatedWeekCount} complete evaluated week${adherence.evaluatedWeekCount === 1 ? "" : "s"}; limited adherence reduces confidence in evaluating the approach itself.`,
  };
}


// ============================================================
// Result Builder
// ============================================================

function createResult({
  status,
  title,
  message,
  signals,
}: {
  status:
    CurrentApproachReviewStatus;

  title:
    string;

  message:
    string;

  signals:
    CurrentApproachSignal[];
}): CurrentApproachReview {
  const availableSignals =
    signals.filter(
      (
        signal
      ) =>
        signal.status !==
        "InsufficientData"
    );

  return {
    status,

    title,

    message,

    availableSignalCount:
      availableSignals.length,

    supportingSignalCount:
      availableSignals.filter(
        (
          signal
        ) =>
          signal.status ===
          "SupportsApproach"
      ).length,

    mixedSignalCount:
      availableSignals.filter(
        (
          signal
        ) =>
          signal.status ===
          "Mixed"
      ).length,

    concernSignalCount:
      availableSignals.filter(
        (
          signal
        ) =>
          signal.status ===
          "Concern"
      ).length,

    signals,
  };
}


// ============================================================
// Current Approach Review
// ============================================================

export function getCurrentApproachReview({
  evidence,
  bodyCompositionStatus,
  strengthRetention,
  runningTrend,
  adherence,
}: {
  evidence:
    CurrentApproachEvidence;

  bodyCompositionStatus:
    BodyCompositionGoalProgressStatus;

  strengthRetention:
    StrengthRetentionReview |
    null;

  runningTrend:
    RunningProgressTrend |
    null;

  adherence:
    ProgressReviewAdherence |
    null;
}): CurrentApproachReview {
  const signals = [
    getBodyCompositionSignal(
      bodyCompositionStatus
    ),

    getStrengthSignal(
      strengthRetention
    ),

    getCardioSignal(
      runningTrend
    ),

    getAdherenceSignal(
      adherence
    ),
  ];

  if (
    evidence.status ===
    "NoActiveProgram"
  ) {
    return createResult({
      status:
        "NoActiveProgram",

      title:
        "No active program to evaluate",

      message:
        evidence.reason,

      signals,
    });
  }

  if (
    evidence.status ===
    "TooEarly"
  ) {
    return createResult({
      status:
        "TooEarly",

      title:
        "Too early to evaluate the current approach",

      message:
        evidence.reason,

      signals,
    });
  }

  if (
    evidence.status ===
      "InsufficientCurrentProgramData" ||
    bodyCompositionStatus ===
      "InsufficientData"
  ) {
    return createResult({
      status:
        "InsufficientEvidence",

      title:
        "Not enough current-program evidence yet",

      message:
        evidence.reason,

      signals,
    });
  }

  const availableSignals =
    signals.filter(
      (
        signal
      ) =>
        signal.status !==
        "InsufficientData"
    );

  if (
    availableSignals.length <
    MIN_CONCLUSION_SIGNAL_COUNT
  ) {
    return createResult({
      status:
        "InsufficientEvidence",

      title:
        "More supporting evidence is needed",

      message:
        "Body-composition evidence is available, but at least one additional current-program signal is needed before evaluating the approach as a whole.",

      signals,
    });
  }

  const concernSignalCount =
    availableSignals.filter(
      (
        signal
      ) =>
        signal.status ===
        "Concern"
    ).length;

  const mixedSignalCount =
    availableSignals.filter(
      (
        signal
      ) =>
        signal.status ===
        "Mixed"
    ).length;

  if (
    concernSignalCount >=
    2
  ) {
    return createResult({
      status:
        "NeedsAttention",

      title:
        "The current approach may need attention",

      message:
        "Multiple current-program signals are moving in an unfavorable direction. Review the contributing evidence before changing training or lifestyle targets.",

      signals,
    });
  }

  if (
    concernSignalCount >
      0 ||
    mixedSignalCount >
      0
  ) {
    return createResult({
      status:
        "Mixed",

      title:
        "The current approach shows mixed evidence",

      message:
        "Current-program signals do not all point in the same direction. Continue collecting evidence and review the specific concern before making a broad change.",

      signals,
    });
  }

  return createResult({
    status:
      "Supported",

    title:
      "The current approach appears to be working",

    message:
      "At least two current-program signals support the approach, with no available signal currently indicating a meaningful concern.",

    signals,
  });
}
