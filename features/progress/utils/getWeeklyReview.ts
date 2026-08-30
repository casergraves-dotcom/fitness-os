import type {
  CurrentWeeklyProgress,
} from "@/features/today/utils/getCurrentWeeklyProgress";

import type {
  BodyCompositionGoalProgress,
} from "../hooks/useBodyCompositionGoalProgress";

import type {
  LifestyleGoalProgressEvidence,
} from "./getLifestyleGoalProgressEvidence";

import {
  getLifestyleGoalProgressPatterns,
} from "./getLifestyleGoalProgressPatterns";

import type {
  LifestyleGoalProgressPattern,
  LifestyleGoalProgressPatternResult,
} from "./getLifestyleGoalProgressPatterns";

import type {
  RecoveryProgressTrend,
} from "./getRecoveryProgressTrend";

import type {
  RunningProgressTrend,
} from "./getRunningProgressTrend";

import type {
  StrengthProgressTrend,
} from "./getStrengthProgressTrend";
import {
  getRequiredAdherenceToDate,
} from "./getRequiredAdherenceToDate.ts";


// ============================================================
// Types
// ============================================================

export type WeeklyReviewObservationType =
  | "Training"
  | "GoalProgress"
  | "StrengthProgress"
  | "RunningProgress"
  | "RecoveryTrend"
  | "Nutrition"
  | "DailyActivity";


export interface WeeklyReviewObservation {
  type:
    WeeklyReviewObservationType;

  message: string;
}


interface RankedWeeklyReviewObservation {
  observation:
    WeeklyReviewObservation;

  priority: number;
}


export interface WeeklyReviewTrainingSummary {
  requiredScheduled: number;

  requiredCompleted: number;

  adherenceRate: number;

  scheduledStrengthCount: number;

  completedStrengthCount: number;

  requiredStrengthCount: number;
}


export interface WeeklyReviewStrengthSummary {
  status:
    CurrentWeeklyProgress[
      "strengthQuality"
    ]["status"];

  sessionCount: number;

  prescribedSetCount: number;

  completedSetCount: number;

  completionRate: number;

  ratedSetCount: number;

  highEffortSetCount: number;

  message: string;
}


export interface WeeklyReviewRunningSummary {
  status:
    CurrentWeeklyProgress[
      "runningLoad"
    ]["status"];

  completedRunCount: number;

  evaluatedRunCount: number;

  totalDurationMinutes: number;

  averageDurationCompletionRate:
    number | null;

  averageRpe:
    number | null;

  message: string;
}


export interface WeeklyReviewRecoverySummary {
  status:
    CurrentWeeklyProgress[
      "recovery"
    ]["status"];

  checkInCount: number;

  message: string;
}


export interface WeeklyReviewStrengthProgressSummary {
  status:
    StrengthProgressTrend["status"];

  changePercent:
    number | null;

  sampleCount: number;

  message: string;
}


export interface WeeklyReviewRunningProgressSummary {
  status:
    RunningProgressTrend["status"];

  changePercent:
    number | null;

  sampleCount: number;

  message: string;
}


export interface WeeklyReviewRecoveryTrendSummary {
  status:
    RecoveryProgressTrend["status"];

  changePercent:
    number | null;

  sampleCount: number;

  previousAverageReadiness:
    number | null;

  recentAverageReadiness:
    number | null;

  message: string;
}


export interface WeeklyReviewTrainingDecision {
  status:
    CurrentWeeklyProgress["decision"]["status"];

  shouldAdvance: boolean;

  reason: string;

  factors: string[];

  isFinal: boolean;
}


export interface WeeklyReview {
  weekStartDate: string;

  weekType:
    CurrentWeeklyProgress["weekType"];

  training:
    WeeklyReviewTrainingSummary;

  strength:
    WeeklyReviewStrengthSummary;

  running:
    WeeklyReviewRunningSummary;

  recovery:
    WeeklyReviewRecoverySummary;

  strengthProgress:
    WeeklyReviewStrengthProgressSummary;

  runningProgress:
    WeeklyReviewRunningProgressSummary;

  recoveryTrend:
    WeeklyReviewRecoveryTrendSummary;

  trainingDecision:
    WeeklyReviewTrainingDecision;

  goalProgress:
    BodyCompositionGoalProgress;

  lifestyleEvidence:
    LifestyleGoalProgressEvidence |
    null;

  lifestylePatterns:
    LifestyleGoalProgressPatternResult |
    null;

  observations:
    WeeklyReviewObservation[];

  dataLimitations: string[];
}


// ============================================================
// Strength Summary
// ============================================================

function getStrengthSummary(
  weeklyProgress:
    CurrentWeeklyProgress
): WeeklyReviewStrengthSummary {
  const strength =
    weeklyProgress
      .strengthQuality;

  let message: string;

  if (
    strength.status ===
    "NoData"
  ) {
    message =
      "No completed strength-session data is available yet for this week.";
  } else if (
    strength.factor
  ) {
    message =
      strength.factor;
  } else {
    message =
      `${strength.sessionCount} strength session${strength.sessionCount === 1 ? "" : "s"} reviewed this week.`;
  }

  return {
    status:
      strength.status,

    sessionCount:
      strength.sessionCount,

    prescribedSetCount:
      strength.prescribedSetCount,

    completedSetCount:
      strength.completedSetCount,

    completionRate:
      strength.completionRate,

    ratedSetCount:
      strength.ratedSetCount,

    highEffortSetCount:
      strength.highEffortSetCount,

    message,
  };
}


// ============================================================
// Running Summary
// ============================================================

function getRunningSummary(
  weeklyProgress:
    CurrentWeeklyProgress
): WeeklyReviewRunningSummary {
  const running =
    weeklyProgress
      .runningLoad;

  let message: string;

  if (
    running.status ===
    "NoData"
  ) {
    message =
      "No completed scheduled-run data is available yet for this week.";
  } else if (
    running.factor
  ) {
    message =
      running.factor;
  } else {
    message =
      `${running.completedRunCount} scheduled run${running.completedRunCount === 1 ? "" : "s"} completed this week.`;
  }

  return {
    status:
      running.status,

    completedRunCount:
      running.completedRunCount,

    evaluatedRunCount:
      running.evaluatedRunCount,

    totalDurationMinutes:
      running.totalDurationMinutes,

    averageDurationCompletionRate:
      running
        .averageDurationCompletionRate,

    averageRpe:
      running.averageRpe,

    message,
  };
}


// ============================================================
// Recovery Summary
// ============================================================

function getRecoverySummary(
  weeklyProgress:
    CurrentWeeklyProgress
): WeeklyReviewRecoverySummary {
  const recovery =
    weeklyProgress
      .recovery;

  let message: string;

  if (
    recovery.status ===
    "NoData"
  ) {
    message =
      "No usable recovery check-ins are available yet for this week.";
  } else if (
    recovery.factor
  ) {
    message =
      recovery.factor;
  } else {
    message =
      `${recovery.checkInCount} recovery check-in${recovery.checkInCount === 1 ? "" : "s"} reviewed this week.`;
  }

  return {
    status:
      recovery.status,

    checkInCount:
      recovery.checkInCount,

    message,
  };
}


// ============================================================
// Strength Progress
// ============================================================

function getStrengthProgressSummary(
  trend:
    StrengthProgressTrend
): WeeklyReviewStrengthProgressSummary {
  let message: string;

  switch (
    trend.status
  ) {
    case "Improving":
      message =
        "Longer-term strength performance is improving.";
      break;

    case "Maintained":
      message =
        "Longer-term strength performance is being maintained.";
      break;

    case "Declining":
      message =
        "Longer-term strength performance has declined enough to be worth watching.";
      break;

    case "InsufficientData":
    default:
      message =
        "More strength-history data is needed before a meaningful longer-term trend can be identified.";
      break;
  }

  return {
    status:
      trend.status,

    changePercent:
      trend.changePercent,

    sampleCount:
      trend.sampleCount,

    message,
  };
}


// ============================================================
// Running Progress
// ============================================================

function getRunningProgressSummary(
  trend:
    RunningProgressTrend
): WeeklyReviewRunningProgressSummary {
  let message: string;

  switch (
    trend.status
  ) {
    case "Improving":
      message =
        "Longer-term running pace is improving.";
      break;

    case "Maintained":
      message =
        "Longer-term running pace is being maintained.";
      break;

    case "Declining":
      message =
        "Longer-term running pace has declined enough to be worth watching.";
      break;

    case "InsufficientData":
    default:
      message =
        "More run-history data is needed before a meaningful longer-term pace trend can be identified.";
      break;
  }

  return {
    status:
      trend.status,

    changePercent:
      trend.changePercent,

    sampleCount:
      trend.sampleCount,

    message,
  };
}


// ============================================================
// Recovery Trend
// ============================================================

function getRecoveryTrendSummary(
  trend:
    RecoveryProgressTrend
): WeeklyReviewRecoveryTrendSummary {
  let message: string;

  switch (
    trend.status
  ) {
    case "Improving":
      message =
        "Recent recovery readiness is improving compared with the preceding check-ins.";
      break;

    case "Maintained":
      message =
        "Recent recovery readiness is relatively stable compared with the preceding check-ins.";
      break;

    case "Declining":
      message =
        "Recent recovery readiness has declined compared with the preceding check-ins.";
      break;

    case "InsufficientData":
    default:
      message =
        "More recovery check-ins are needed before a meaningful recovery trend can be identified.";
      break;
  }

  return {
    status:
      trend.status,

    changePercent:
      trend.changePercent,

    sampleCount:
      trend.sampleCount,

    previousAverageReadiness:
      trend.previousAverageReadiness,

    recentAverageReadiness:
      trend.recentAverageReadiness,

    message,
  };
}


// ============================================================
// Ranked Observations
// ============================================================

function getTrainingObservation(
  weeklyProgress:
    CurrentWeeklyProgress,
  adherenceToDate: {
    requiredScheduled: number;
    requiredCompleted: number;
    adherenceRate: number;
  }
): RankedWeeklyReviewObservation {
  return {
    observation: {
      type:
        "Training",

      message:
        `${adherenceToDate.requiredCompleted} of ` +
        `${adherenceToDate.requiredScheduled} required activities due so far are complete. ` +
        `${weeklyProgress.decision.completedStrengthCount} of ` +
        `${weeklyProgress.decision.requiredStrengthCount} minimum strength sessions are complete.`,
    },

    priority:
      adherenceToDate.adherenceRate <
      0.75
        ? 65
        : 20,
  };
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getGoalProgressObservation(
  goalProgress:
    BodyCompositionGoalProgress
): RankedWeeklyReviewObservation | null {
  switch (
    goalProgress.status
  ) {
    case "OnTrack":
      return {
        observation: {
          type:
            "GoalProgress",

          message:
            "Your recent body-composition trend is moving at about the expected rate.",
        },

        priority:
          55,
      };

    case "SlowerThanExpected":
      return {
        observation: {
          type:
            "GoalProgress",

          message:
            "Your recent body-composition trend is moving toward the goal more slowly than expected.",
        },

        priority:
          75,
      };

    case "FasterThanExpected":
      return {
        observation: {
          type:
            "GoalProgress",

          message:
            "Your recent body-composition trend is moving toward the goal faster than expected.",
        },

        priority:
          80,
      };

    case "Plateau":
      return {
        observation: {
          type:
            "GoalProgress",

          message:
            "Your recent body-composition trend has been relatively flat long enough to be considered a meaningful plateau.",
        },

        priority:
          90,
      };

    case "MovingAwayFromGoal":
      return {
        observation: {
          type:
            "GoalProgress",

          message:
            "Your recent body-composition trend is currently moving away from the active goal.",
        },

        priority:
          95,
      };

    case "InsufficientData":
    default:
      return null;
  }
}


function getStrengthProgressObservation(
  strengthProgress:
    WeeklyReviewStrengthProgressSummary
): RankedWeeklyReviewObservation | null {
  switch (
    strengthProgress.status
  ) {
    case "Improving":
      return {
        observation: {
          type:
            "StrengthProgress",

          message:
            strengthProgress.message,
        },

        priority:
          70,
      };

    case "Declining":
      return {
        observation: {
          type:
            "StrengthProgress",

          message:
            strengthProgress.message,
        },

        priority:
          87,
      };

    case "Maintained":
    case "InsufficientData":
    default:
      return null;
  }
}


function getRunningProgressObservation(
  runningProgress:
    WeeklyReviewRunningProgressSummary
): RankedWeeklyReviewObservation | null {
  switch (
    runningProgress.status
  ) {
    case "Improving":
      return {
        observation: {
          type:
            "RunningProgress",

          message:
            runningProgress.message,
        },

        priority:
          69,
      };

    case "Declining":
      return {
        observation: {
          type:
            "RunningProgress",

          message:
            runningProgress.message,
        },

        priority:
          86,
      };

    case "Maintained":
    case "InsufficientData":
    default:
      return null;
  }
}


function getRecoveryTrendObservation(
  recoveryTrend:
    WeeklyReviewRecoveryTrendSummary
): RankedWeeklyReviewObservation | null {
  switch (
    recoveryTrend.status
  ) {
    case "Improving":
      return {
        observation: {
          type:
            "RecoveryTrend",

          message:
            recoveryTrend.message,
        },

        priority:
          68,
      };

    case "Declining":
      return {
        observation: {
          type:
            "RecoveryTrend",

          message:
            recoveryTrend.message,
        },

        priority:
          85,
      };

    case "Maintained":
    case "InsufficientData":
    default:
      return null;
  }
}


function getLifestylePatternObservation(
  pattern:
    LifestyleGoalProgressPattern
): RankedWeeklyReviewObservation {
  let priority: number;

  switch (
    pattern.direction
  ) {
    case "MayLimitProgress":
      priority =
        84;
      break;

    case "MayAccelerateProgress":
      priority =
        79;
      break;

    case "SupportsGoal":
      priority =
        50;
      break;

    case "ContextOnly":
    default:
      priority =
        45;
      break;
  }

  return {
    observation: {
      type:
        pattern.category ===
        "Steps"
          ? "DailyActivity"
          : "Nutrition",

      message:
        pattern.summary,
    },

    priority,
  };
}


function getMaintainedObservations(
  strengthProgress:
    WeeklyReviewStrengthProgressSummary,
  runningProgress:
    WeeklyReviewRunningProgressSummary,
  recoveryTrend:
    WeeklyReviewRecoveryTrendSummary
): RankedWeeklyReviewObservation[] {
  const observations:
    RankedWeeklyReviewObservation[] = [];

  if (
    strengthProgress.status ===
    "Maintained"
  ) {
    observations.push({
      observation: {
        type:
          "StrengthProgress",

        message:
          strengthProgress.message,
      },

      priority:
        12,
    });
  }

  if (
    runningProgress.status ===
    "Maintained"
  ) {
    observations.push({
      observation: {
        type:
          "RunningProgress",

        message:
          runningProgress.message,
      },

      priority:
        11,
    });
  }

  if (
    recoveryTrend.status ===
    "Maintained"
  ) {
    observations.push({
      observation: {
        type:
          "RecoveryTrend",

        message:
          recoveryTrend.message,
      },

      priority:
        10,
    });
  }

  return observations;
}


function getRankedObservations({
  weeklyProgress,
  adherenceToDate,
}: {
  weeklyProgress:
    CurrentWeeklyProgress;

  adherenceToDate: {
    requiredScheduled: number;
    requiredCompleted: number;
    adherenceRate: number;
  };

  goalProgress:
    BodyCompositionGoalProgress;

  strengthProgress:
    WeeklyReviewStrengthProgressSummary;

  runningProgress:
    WeeklyReviewRunningProgressSummary;

  recoveryTrend:
    WeeklyReviewRecoveryTrendSummary;

  lifestylePatterns:
    LifestyleGoalProgressPatternResult |
    null;
}): WeeklyReviewObservation[] {
  const trainingObservation =
    getTrainingObservation(
      weeklyProgress,
      adherenceToDate
    );

  return [
    trainingObservation
      .observation,
  ];
}


// ============================================================
// Data Limitations
// ============================================================

function getDataLimitations(
  goalProgress:
    BodyCompositionGoalProgress,
  lifestyleEvidence:
    LifestyleGoalProgressEvidence |
    null,
  strengthProgress:
    WeeklyReviewStrengthProgressSummary,
  runningProgress:
    WeeklyReviewRunningProgressSummary,
  recoveryTrend:
    WeeklyReviewRecoveryTrendSummary
) {
  const limitations:
    string[] = [];

  if (
    goalProgress.status ===
    "InsufficientData"
  ) {
    limitations.push(
      "More body-composition trend data is needed before progress can be compared meaningfully with the active goal."
    );
  }

  if (
    strengthProgress.status ===
    "InsufficientData"
  ) {
    limitations.push(
      strengthProgress.message
    );
  }

  if (
    runningProgress.status ===
    "InsufficientData"
  ) {
    limitations.push(
      runningProgress.message
    );
  }

  if (
    recoveryTrend.status ===
    "InsufficientData"
  ) {
    limitations.push(
      recoveryTrend.message
    );
  }

  if (
    lifestyleEvidence &&
    !lifestyleEvidence
      .lifestyleEvidenceReady
  ) {
    limitations.push(
      "There is not yet enough multi-week nutrition or daily-activity evidence to use those patterns when interpreting body-composition progress."
    );
  }

  return limitations;
}


// ============================================================
// Weekly Review
// ============================================================

export function getWeeklyReview({
  weeklyProgress,
  goalProgress,
  lifestyleEvidence,
  strengthProgressTrend,
  runningProgressTrend,
  recoveryProgressTrend,
  reviewDate = new Date(),
}: {
  weeklyProgress:
    CurrentWeeklyProgress | null;

  goalProgress:
    BodyCompositionGoalProgress;

  lifestyleEvidence:
    LifestyleGoalProgressEvidence |
    null;

  strengthProgressTrend:
    StrengthProgressTrend;

  runningProgressTrend:
    RunningProgressTrend;

  recoveryProgressTrend:
    RecoveryProgressTrend;

  reviewDate?: Date;
}): WeeklyReview | null {
  if (!weeklyProgress) {
    return null;
  }


  // ----------------------------------------------------------
  // Training Summary
  // ----------------------------------------------------------

  const adherenceToDate = getRequiredAdherenceToDate(
    weeklyProgress.adherence,
    formatLocalDate(reviewDate)
  );

  const training:
    WeeklyReviewTrainingSummary = {
      requiredScheduled:
        adherenceToDate.requiredScheduled,

      requiredCompleted:
        adherenceToDate.requiredCompleted,

      adherenceRate:
        adherenceToDate.adherenceRate,

      scheduledStrengthCount:
        weeklyProgress
          .decision
          .scheduledStrengthCount,

      completedStrengthCount:
        weeklyProgress
          .decision
          .completedStrengthCount,

      requiredStrengthCount:
        weeklyProgress
          .decision
          .requiredStrengthCount,
    };


  // ----------------------------------------------------------
  // Current-Week Evidence
  // ----------------------------------------------------------

  const strength =
    getStrengthSummary(
      weeklyProgress
    );

  const running =
    getRunningSummary(
      weeklyProgress
    );

  const recovery =
    getRecoverySummary(
      weeklyProgress
    );


  // ----------------------------------------------------------
  // Longer-Term Evidence
  // ----------------------------------------------------------

  const strengthProgress =
    getStrengthProgressSummary(
      strengthProgressTrend
    );

  const runningProgress =
    getRunningProgressSummary(
      runningProgressTrend
    );

  const recoveryTrend =
    getRecoveryTrendSummary(
      recoveryProgressTrend
    );

  const lifestylePatterns =
    lifestyleEvidence
      ? getLifestyleGoalProgressPatterns(
          lifestyleEvidence
        )
      : null;


  // ----------------------------------------------------------
  // Training Decision
  // ----------------------------------------------------------

  const trainingDecision:
    WeeklyReviewTrainingDecision = {
      status:
        weeklyProgress
          .decision
          .status,

      shouldAdvance:
        weeklyProgress
          .decision
          .shouldAdvance,

      reason:
        weeklyProgress
          .decision
          .reason,

      factors: [
        ...weeklyProgress
          .decision
          .factors,
      ],

      isFinal:
        false,
    };


  // ----------------------------------------------------------
  // Observations
  // ----------------------------------------------------------

  const observations =
    getRankedObservations({
      weeklyProgress,
      adherenceToDate,
      goalProgress,
      strengthProgress,
      runningProgress,
      recoveryTrend,
      lifestylePatterns,
    });


  // ----------------------------------------------------------
  // Result
  // ----------------------------------------------------------

  return {
    weekStartDate:
      weeklyProgress
        .weekStartDate,

    weekType:
      weeklyProgress
        .weekType,

    training,

    strength,

    running,

    recovery,

    strengthProgress,

    runningProgress,

    recoveryTrend,

    trainingDecision,

    goalProgress,

    lifestyleEvidence,

    lifestylePatterns,

    observations,

    dataLimitations:
      getDataLimitations(
        goalProgress,
        lifestyleEvidence,
        strengthProgress,
        runningProgress,
        recoveryTrend
      ),
  };
}
