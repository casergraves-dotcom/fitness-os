"use client";

// ============================================================
// Imports
// ============================================================

import {
  useMemo,
} from "react";

import {
  useDailySteps,
} from "./useDailySteps";

import {
  useStepTargets,
} from "./useStepTargets";

import {
  getWeeklyStepAdherence,
} from "../utils/getWeeklyStepAdherence";
import { getTrainingWeekDatesThroughDate } from "@/lib/date/trainingWeek";


// ============================================================
// Hook
// ============================================================

export function useWeeklyStepAdherence() {
  const {
    loaded:
      stepsLoaded,

    records:
      stepRecords,
  } =
    useDailySteps();

  const {
    loaded:
      targetsLoaded,

    history:
      targetHistory,
  } =
    useStepTargets();

  const loaded =
    stepsLoaded &&
    targetsLoaded;


  // ----------------------------------------------------------
  // Current Week
  // ----------------------------------------------------------

  const weeklyAdherence =
    useMemo(
      () => {
        if (
          !loaded
        ) {
          return null;
        }

        const dates =
          getTrainingWeekDatesThroughDate(
            new Date()
          );

        const dailyAdherence =
          dates.map(
            (
              date
            ) => {
              const target =
                targetHistory.find(
                  (
                    candidate
                  ) =>
                    candidate.effectiveDate <=
                    date
                ) ??
                null;

              const record =
                stepRecords.find(
                  (
                    candidate
                  ) =>
                    candidate.date ===
                    date
                ) ??
                null;

              return {
                date,

                targetSteps:
                  target?.dailyStepTarget,

                actualSteps:
                  record?.steps,
              };
            }
          );

        return getWeeklyStepAdherence(
          dailyAdherence
        );
      },
      [
        loaded,
        stepRecords,
        targetHistory,
      ]
    );


  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------

  return {
    loaded,

    weeklyAdherence,
  };
}
