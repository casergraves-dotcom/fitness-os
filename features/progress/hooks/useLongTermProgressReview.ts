"use client";

import {
  useMemo,
} from "react";

import {
  useMorningCheckIn,
} from "@/features/recovery/hooks/useMorningCheckIn";

import {
  useRunSession,
} from "@/features/running/hooks/useRunSession";

import {
  useExerciseLibrary,
} from "@/features/workout/hooks/useExerciseLibrary";

import {
  useTrainingActivityCompletions,
} from "@/features/workout/hooks/useTrainingActivityCompletions";

import {
  useTrainingPlanState,
} from "@/features/workout/hooks/useTrainingPlanState";

import {
  useWorkoutHistory,
} from "@/features/workout/hooks/useWorkoutHistory";

import {
  useBodyCompositionGoals,
} from "./useBodyCompositionGoals";

import {
  useBodyCompositionMilestones,
} from "./useBodyCompositionMilestones";

import {
  useBodyCompositionTrends,
} from "./useBodyCompositionTrends";

import {
  useBodyMeasurements,
} from "./useBodyMeasurements";

import {
  useDexaRecords,
} from "./useDexaRecords";

import {
  useProgressCheckIns,
} from "./useProgressCheckIns";

import {
  getBodyCompositionPeriodComparison,
} from "../utils/getBodyCompositionPeriodComparison";

import {
  getLongTermProgressReview,
} from "../utils/getLongTermProgressReview";

import {
  getPeriodDexaComparison,
} from "../utils/getPeriodDexaComparison";

import {
  getPeriodStrengthRetentionReview,
} from "../utils/getPeriodStrengthRetentionReview";

import {
  getProgressReviewAdherence,
} from "../utils/getProgressReviewAdherence";

import {
  getProgressReviewDomainTrends,
} from "../utils/getProgressReviewDomainTrends";

import {
  getProgressReviewPeriod,
} from "../utils/getProgressReviewPeriod";

import {
  getProgressReviewPersonalRecords,
} from "../utils/getProgressReviewPersonalRecords";

import {
  getProgressReviewPhotoComparison,
} from "../utils/getProgressReviewPhotoComparison";

import type {
  ProgressReviewRange,
} from "../utils/getProgressReviewPeriod";


// ============================================================
// Helpers
// ============================================================

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

  return (
    `${year}-${month}-${day}`
  );
}


function getLocalDate(
  value:
    string
) {
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    return value;
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return formatLocalDate(
    date
  );
}


function getEarliestDate(
  values:
    Array<
      string |
      null |
      undefined
    >
) {
  const validDates =
    values
      .map(
        (
          value
        ) =>
          value
            ? getLocalDate(
                value
              )
            : null
      )
      .filter(
        (
          value
        ): value is string =>
          value !==
          null
      )
      .sort(
        (
          a,
          b
        ) =>
          a.localeCompare(
            b
          )
      );

  return (
    validDates[0] ??
    null
  );
}


// ============================================================
// Long-Term Progress Review Hook
// ============================================================

export function useLongTermProgressReview({
  range,
}: {
  range:
    ProgressReviewRange;
}) {
  const {
    loaded:
      measurementsLoaded,

    measurements,
  } =
    useBodyMeasurements();

  const {
    loaded:
      goalsLoaded,

    currentGoal,
  } =
    useBodyCompositionGoals();

  const {
    loaded:
      dexaRecordsLoaded,

    records:
      dexaRecords,
  } =
    useDexaRecords();

  const {
    weightTrend,
  } =
    useBodyCompositionTrends(
      measurements
    );

  const milestones =
    useBodyCompositionMilestones(
      currentGoal,
      weightTrend
    );

  const {
    loaded:
      progressCheckInsLoaded,

    checkIns:
      progressCheckIns,
  } =
    useProgressCheckIns();


  // ----------------------------------------------------------
  // Running
  // ----------------------------------------------------------

  const {
    loaded:
      runHistoryLoaded,

    history:
      runHistory,
  } =
    useRunSession();


  // ----------------------------------------------------------
  // Recovery
  // ----------------------------------------------------------

  const {
    loaded:
      recoveryLoaded,

    history:
      recoveryHistory,
  } =
    useMorningCheckIn();


  // ----------------------------------------------------------
  // Training
  // ----------------------------------------------------------

  const {
    loaded:
      trainingPlanLoaded,

    state:
      trainingPlanState,
  } =
    useTrainingPlanState();

  const {
    loaded:
      completionsLoaded,

    completions,
  } =
    useTrainingActivityCompletions();

  const {
    loaded:
      workoutHistoryLoaded,

    history:
      workoutHistory,
  } =
    useWorkoutHistory();

  const {
    loaded:
      exerciseLibraryLoaded,

    exercises:
      exerciseDefinitions,
  } =
    useExerciseLibrary();


  // ----------------------------------------------------------
  // Loading
  // ----------------------------------------------------------

  const loaded =
    measurementsLoaded &&
    goalsLoaded &&
    dexaRecordsLoaded &&
    progressCheckInsLoaded &&
    runHistoryLoaded &&
    recoveryLoaded &&
    trainingPlanLoaded &&
    completionsLoaded &&
    workoutHistoryLoaded &&
    exerciseLibraryLoaded;


  // ----------------------------------------------------------
  // Review Period
  // ----------------------------------------------------------

  const earliestAvailableDate =
    useMemo(
      () =>
        getEarliestDate([
          trainingPlanState
            ?.startDate,

          ...weightTrend.map(
            (
              entry
            ) =>
              entry.date
          ),

          ...dexaRecords.map(
            (
              record
            ) =>
              record.scanDate
          ),

          ...progressCheckIns.map(
            (
              checkIn
            ) =>
              checkIn.date
          ),

          ...workoutHistory.map(
            (
              workout
            ) =>
              workout.completedAt ??
              workout.startedAt
          ),

          ...runHistory.map(
            (
              run
            ) =>
              run.completedAt ??
              run.startedAt
          ),

          ...recoveryHistory.map(
            (
              record
            ) =>
              record.date
          ),
        ]),
      [
        trainingPlanState,
        weightTrend,
        dexaRecords,
        progressCheckIns,
        workoutHistory,
        runHistory,
        recoveryHistory,
      ]
    );

  const period =
    useMemo(
      () =>
        getProgressReviewPeriod({
          range,
          earliestAvailableDate,
        }),
      [
        range,
        earliestAvailableDate,
      ]
    );


  // ----------------------------------------------------------
  // Strength Retention
  // ----------------------------------------------------------

  const strengthRetention =
    useMemo(
      () =>
        getPeriodStrengthRetentionReview({
          workoutHistory,
          period,
        }),
      [
        workoutHistory,
        period,
      ]
    );

  const personalRecords =
    useMemo(
      () =>
        getProgressReviewPersonalRecords({
          workoutHistory,
          exerciseDefinitions,
          period,
        }),
      [
        workoutHistory,
        exerciseDefinitions,
        period,
      ]
    );

  const photoComparison =
    useMemo(
      () =>
        getProgressReviewPhotoComparison({
          checkIns:
            progressCheckIns,
          period,
        }),
      [
        progressCheckIns,
        period,
      ]
    );


  // ----------------------------------------------------------
  // Review
  // ----------------------------------------------------------

  const review =
    useMemo(
      () => {
        if (!loaded) {
          return null;
        }

        const bodyComposition =
          getBodyCompositionPeriodComparison({
            weightTrend,
            currentPeriod:
              period,
          });

        const dexa =
          getPeriodDexaComparison({
            records:
              dexaRecords,
            period,
          });

        const domainTrends =
          getProgressReviewDomainTrends({
            period,
            runHistory,
            recoveryHistory,
          });

        const adherence =
          getProgressReviewAdherence({
            period,
            trainingPlanState,
            completions,
            recoveryCheckIns:
              recoveryHistory,
            workoutHistory,
            runHistory,
          });

        return getLongTermProgressReview({
          period,
          bodyComposition,
          dexa,
          domainTrends,
          strengthRetention,
          adherence,
          milestones,
          personalRecords,
          photoComparison,
        });
      },
      [
        loaded,
        period,
        weightTrend,
        dexaRecords,
        runHistory,
        recoveryHistory,
        trainingPlanState,
        completions,
        workoutHistory,
        strengthRetention,
        milestones,
        personalRecords,
        photoComparison,
      ]
    );


  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------

  return {
    loaded,

    review,
  };
}
