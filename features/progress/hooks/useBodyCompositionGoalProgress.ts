"use client";

import {
  useMemo,
} from "react";

import type {
  BodyCompositionGoal,
} from "../bodyCompositionTypes";

import type {
  BodyWeightTrendEntry,
} from "./useBodyCompositionTrends";


// ============================================================
// Types
// ============================================================

export type BodyCompositionGoalProgressStatus =
  | "InsufficientData"
  | "OnTrack"
  | "SlowerThanExpected"
  | "FasterThanExpected"
  | "Plateau"
  | "MovingAwayFromGoal";


export interface BodyCompositionGoalProgress {
  status:
    BodyCompositionGoalProgressStatus;

  currentTrendWeightLb?: number;

  targetWeightLb?: number;

  remainingWeightChangeLb?: number;

  expectedWeeklyWeightChangeLb?: number;

  observedWeeklyWeightChangeLb?: number;

  expectedProjectedCompletionDate?: string;

  observedProjectedCompletionDate?: string;

  observedTrendDays?: number;

  observedTrendSampleCount?: number;
}


// ============================================================
// Constants
// ============================================================

// Require at least two weeks between the trend points used to
// calculate the observed rate. This prevents a handful of daily
// measurements from being treated as a meaningful long-term rate.
const MIN_OBSERVED_TREND_DAYS =
  14;


// A longer observation window is required before Fitness OS can
// call a weight trend a plateau.
const MIN_PLATEAU_TREND_DAYS =
  21;


// Average weekly movement inside this range is considered
// effectively flat for plateau detection.
const PLATEAU_WEEKLY_CHANGE_LB =
  0.2;


// Allow normal variation around the expected rate before calling
// progress meaningfully slower or faster than planned.
const RATE_TOLERANCE_FRACTION =
  0.25;


// Avoid producing implausible projections from a rate that is
// technically non-zero but practically flat.
const MIN_PROJECTION_WEEKLY_CHANGE_LB =
  0.1;


// ============================================================
// Helpers
// ============================================================

function parseLocalDate(
  date:
    string
) {
  return new Date(
    `${date}T12:00:00`
  );
}


function getDayDifference(
  laterDate:
    string,
  earlierDate:
    string
) {
  const millisecondsPerDay =
    24 *
    60 *
    60 *
    1000;

  return (
    parseLocalDate(
      laterDate
    ).getTime() -
    parseLocalDate(
      earlierDate
    ).getTime()
  ) /
    millisecondsPerDay;
}


function formatLocalDate(
  date:
    Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() +
      1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}


function roundToTenth(
  value:
    number
) {
  return (
    Math.round(
      value *
      10
    ) /
    10
  );
}


function isMovingTowardTarget(
  currentWeightLb:
    number,
  targetWeightLb:
    number,
  weeklyChangeLb:
    number
) {
  if (
    currentWeightLb >
    targetWeightLb
  ) {
    return (
      weeklyChangeLb <
      0
    );
  }

  if (
    currentWeightLb <
    targetWeightLb
  ) {
    return (
      weeklyChangeLb >
      0
    );
  }

  return true;
}


function calculateProjectedDate(
  currentDate:
    string,
  currentWeightLb:
    number,
  targetWeightLb:
    number,
  weeklyChangeLb:
    number
) {
  const remainingChange =
    targetWeightLb -
    currentWeightLb;

  if (
    Math.abs(
      remainingChange
    ) <
    0.05
  ) {
    return currentDate;
  }

  if (
    Math.abs(
      weeklyChangeLb
    ) <
    MIN_PROJECTION_WEEKLY_CHANGE_LB
  ) {
    return undefined;
  }

  if (
    !isMovingTowardTarget(
      currentWeightLb,
      targetWeightLb,
      weeklyChangeLb
    )
  ) {
    return undefined;
  }

  const weeksRemaining =
    remainingChange /
    weeklyChangeLb;

  if (
    !Number.isFinite(
      weeksRemaining
    ) ||
    weeksRemaining <
    0
  ) {
    return undefined;
  }

  const projectedDate =
    parseLocalDate(
      currentDate
    );

  projectedDate.setDate(
    projectedDate.getDate() +
    Math.ceil(
      weeksRemaining *
      7
    )
  );

  return formatLocalDate(
    projectedDate
  );
}


function findObservedTrendStart(
  weightTrend:
    BodyWeightTrendEntry[]
) {
  if (
    weightTrend.length <
    2
  ) {
    return undefined;
  }

  const latest =
    weightTrend[
      weightTrend.length -
      1
    ];

  // Use the oldest available point once at least two weeks of
  // history exist. This makes the observed rate progressively
  // more stable as real measurement history accumulates.
  const first =
    weightTrend[0];

  const trendDays =
    getDayDifference(
      latest.date,
      first.date
    );

  if (
    trendDays <
    MIN_OBSERVED_TREND_DAYS
  ) {
    return undefined;
  }

  return first;
}


// ============================================================
// Hook
// ============================================================

export function useBodyCompositionGoalProgress(
  currentGoal:
    BodyCompositionGoal |
    null,
  weightTrend:
    BodyWeightTrendEntry[]
) {
  return useMemo<
    BodyCompositionGoalProgress
  >(
    () => {

      // --------------------------------------------------------
      // Goal / Trend Availability
      // --------------------------------------------------------

      if (
        !currentGoal ||
        weightTrend.length ===
          0
      ) {
        return {
          status:
            "InsufficientData",
        };
      }

      const latest =
        weightTrend[
          weightTrend.length -
          1
        ];

      const currentTrendWeightLb =
        latest.trendWeightLb;

      const targetWeightLb =
        currentGoal.targetWeightLb;

      const expectedWeeklyWeightChangeLb =
        currentGoal
          .expectedWeeklyWeightChangeLb;


      // --------------------------------------------------------
      // Observed Rate
      // --------------------------------------------------------

      const observedStart =
        findObservedTrendStart(
          weightTrend
        );

      const observedTrendDays =
        observedStart
          ? getDayDifference(
              latest.date,
              observedStart.date
            )
          : undefined;

      const observedWeeklyWeightChangeLb =
        observedStart &&
        observedTrendDays &&
        observedTrendDays >
          0
          ? roundToTenth(
              (
                latest.trendWeightLb -
                observedStart.trendWeightLb
              ) /
                (
                  observedTrendDays /
                  7
                )
            )
          : undefined;


      // --------------------------------------------------------
      // Goal Distance
      // --------------------------------------------------------

      const remainingWeightChangeLb =
        targetWeightLb !==
        undefined
          ? roundToTenth(
              targetWeightLb -
                currentTrendWeightLb
            )
          : undefined;


      // --------------------------------------------------------
      // Projections
      // --------------------------------------------------------

      const expectedProjectedCompletionDate =
        targetWeightLb !==
          undefined &&
        expectedWeeklyWeightChangeLb !==
          undefined
          ? calculateProjectedDate(
              formatLocalDate(
                new Date()
                ),
              currentTrendWeightLb,
              targetWeightLb,
              expectedWeeklyWeightChangeLb
            )
          : undefined;

      const observedProjectedCompletionDate =
        targetWeightLb !==
          undefined &&
        observedWeeklyWeightChangeLb !==
          undefined
          ? calculateProjectedDate(
              formatLocalDate(
                new Date()
                ),
              currentTrendWeightLb,
              targetWeightLb,
              observedWeeklyWeightChangeLb
            )
          : undefined;


      // --------------------------------------------------------
      // Progress Status
      // --------------------------------------------------------

      let status:
        BodyCompositionGoalProgressStatus =
        "InsufficientData";

      if (
        targetWeightLb !==
          undefined &&
        Math.abs(
          targetWeightLb -
          currentTrendWeightLb
        ) <
          0.05
      ) {
        status =
          "OnTrack";
      } else if (
        observedWeeklyWeightChangeLb !==
        undefined
      ) {
        const movingTowardTarget =
          targetWeightLb !==
            undefined
            ? isMovingTowardTarget(
                currentTrendWeightLb,
                targetWeightLb,
                observedWeeklyWeightChangeLb
              )
            : undefined;

        const plateauEligible =
          observedTrendDays !==
            undefined &&
          observedTrendDays >=
            MIN_PLATEAU_TREND_DAYS;

        const effectivelyFlat =
          Math.abs(
            observedWeeklyWeightChangeLb
          ) <=
          PLATEAU_WEEKLY_CHANGE_LB;

        if (
          targetWeightLb !==
            undefined &&
          movingTowardTarget ===
            false &&
          !effectivelyFlat
        ) {
          status =
            "MovingAwayFromGoal";
        } else if (
          plateauEligible &&
          effectivelyFlat
        ) {
          status =
            "Plateau";
        } else if (
          expectedWeeklyWeightChangeLb !==
            undefined &&
          Math.abs(
            expectedWeeklyWeightChangeLb
          ) >=
            MIN_PROJECTION_WEEKLY_CHANGE_LB
        ) {
          const expectedMagnitude =
            Math.abs(
              expectedWeeklyWeightChangeLb
            );

          const observedMagnitude =
            Math.abs(
              observedWeeklyWeightChangeLb
            );

          const lowerBound =
            expectedMagnitude *
            (
              1 -
              RATE_TOLERANCE_FRACTION
            );

          const upperBound =
            expectedMagnitude *
            (
              1 +
              RATE_TOLERANCE_FRACTION
            );

          const expectedDirection =
            Math.sign(
              expectedWeeklyWeightChangeLb
            );

          const observedDirection =
            Math.sign(
              observedWeeklyWeightChangeLb
            );

          if (
            expectedDirection !==
              0 &&
            observedDirection !==
              0 &&
            expectedDirection !==
              observedDirection
          ) {
            status =
              "MovingAwayFromGoal";
          } else if (
            observedMagnitude <
            lowerBound
          ) {
            status =
              "SlowerThanExpected";
          } else if (
            observedMagnitude >
            upperBound
          ) {
            status =
              "FasterThanExpected";
          } else {
            status =
              "OnTrack";
          }
        } else if (
          targetWeightLb ===
            undefined ||
          movingTowardTarget ===
            true
        ) {
          status =
            "OnTrack";
        }
      }


      // --------------------------------------------------------
      // Result
      // --------------------------------------------------------

      return {
        status,

        currentTrendWeightLb,

        targetWeightLb,

        remainingWeightChangeLb,

        expectedWeeklyWeightChangeLb,

        observedWeeklyWeightChangeLb,

        expectedProjectedCompletionDate,

        observedProjectedCompletionDate,

        observedTrendDays,

        observedTrendSampleCount:
          observedStart
            ? weightTrend.filter(
                (
                  entry
                ) =>
                  entry.date >=
                    observedStart.date &&
                  entry.date <=
                    latest.date
              ).length
            : undefined,
      };
    },
    [
      currentGoal,
      weightTrend,
    ]
  );
}