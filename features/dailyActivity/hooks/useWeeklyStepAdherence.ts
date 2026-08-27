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


// ============================================================
// Helpers
// ============================================================

function formatLocalDate(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
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


function getCurrentWeekDates(
  currentDate: Date
) {
  const day =
    currentDate.getDay();

  const daysSinceMonday =
    day === 0
      ? 6
      : day - 1;

  const monday =
    new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() -
        daysSinceMonday
    );

  const dates:
    string[] = [];

  for (
    let offset = 0;
    offset <=
      daysSinceMonday;
    offset += 1
  ) {
    const date =
      new Date(
        monday.getFullYear(),
        monday.getMonth(),
        monday.getDate() +
          offset
      );

    dates.push(
      formatLocalDate(
        date
      )
    );
  }

  return dates;
}


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
          getCurrentWeekDates(
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