import type {
  MorningCheckInRecord,
} from "@/features/recovery/hooks/useMorningCheckIn";

import {
  calculateReadiness,
} from "@/features/recovery/utils/readiness";


// ============================================================
// Types
// ============================================================

export type RecoveryProgressTrendStatus =
  | "InsufficientData"
  | "Improving"
  | "Maintained"
  | "Declining";


export interface RecoveryProgressTrend {
  status:
    RecoveryProgressTrendStatus;

  previousAverageReadiness:
    number | null;

  recentAverageReadiness:
    number | null;

  changePercent:
    number | null;

  previousSampleCount:
    number;

  recentSampleCount:
    number;

  sampleCount:
    number;
}


// ============================================================
// Helpers
// ============================================================

function average(
  values:
    number[]
) {
  return (
    values.reduce(
      (
        total,
        value
      ) =>
        total +
        value,
      0
    ) /
    values.length
  );
}


// ============================================================
// Recovery Progress Trend
// ============================================================

export function getRecoveryProgressTrend(
  history:
    MorningCheckInRecord[]
): RecoveryProgressTrend {
  const readinessHistory =
    history
      .map(
        (
          record
        ) => {
          const readiness =
            calculateReadiness(
              record.ratings
            );

          if (!readiness) {
            return null;
          }

          return {
            date:
              record.date,

            score:
              readiness.score,
          };
        }
      )
      .filter(
        (
          result
        ): result is {
          date: string;
          score: number;
        } =>
          result !==
          null
      )
      .sort(
        (
          a,
          b
        ) =>
          a.date.localeCompare(
            b.date
          )
      );


  const sampleCount =
    readinessHistory.length;


  // ----------------------------------------------------------
  // Require Two Three-Check-In Windows
  // ----------------------------------------------------------

  if (
    sampleCount <
    6
  ) {
    const recentScores =
      readinessHistory
        .slice(-3)
        .map(
          (
            result
          ) =>
            result.score
        );

    return {
      status:
        "InsufficientData",

      previousAverageReadiness:
        null,

      recentAverageReadiness:
        recentScores.length >
        0
          ? average(
              recentScores
            )
          : null,

      changePercent:
        null,

      previousSampleCount:
        0,

      recentSampleCount:
        recentScores.length,

      sampleCount,
    };
  }


  // ----------------------------------------------------------
  // Comparison Windows
  // ----------------------------------------------------------

  const recent =
    readinessHistory.slice(
      -3
    );

  const previous =
    readinessHistory.slice(
      -6,
      -3
    );


  const recentAverageReadiness =
    average(
      recent.map(
        (
          result
        ) =>
          result.score
      )
    );

  const previousAverageReadiness =
    average(
      previous.map(
        (
          result
        ) =>
          result.score
      )
    );


  if (
    previousAverageReadiness <=
    0
  ) {
    return {
      status:
        "InsufficientData",

      previousAverageReadiness,

      recentAverageReadiness,

      changePercent:
        null,

      previousSampleCount:
        previous.length,

      recentSampleCount:
        recent.length,

      sampleCount,
    };
  }


  // ----------------------------------------------------------
  // Trend
  // ----------------------------------------------------------

  const changePercent =
    (
      (
        recentAverageReadiness -
        previousAverageReadiness
      ) /
      previousAverageReadiness
    ) *
    100;


  let status:
    RecoveryProgressTrendStatus;


  if (
    changePercent >
    5
  ) {
    status =
      "Improving";
  } else if (
    changePercent <
    -5
  ) {
    status =
      "Declining";
  } else {
    status =
      "Maintained";
  }


  return {
    status,

    previousAverageReadiness,

    recentAverageReadiness,

    changePercent,

    previousSampleCount:
      previous.length,

    recentSampleCount:
      recent.length,

    sampleCount,
  };
}