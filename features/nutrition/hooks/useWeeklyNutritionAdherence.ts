"use client";

// ============================================================
// Imports
// ============================================================

import {
  useMemo,
} from "react";

import {
  useNutritionAdherence,
} from "./useNutritionAdherence";

import {
  getWeeklyNutritionAdherence,
} from "../utils/getWeeklyNutritionAdherence";


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
    offset <= daysSinceMonday;
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

export function useWeeklyNutritionAdherence() {
  const {
    loaded,
    getAdherenceForDate,
  } =
    useNutritionAdherence();


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
          dates
            .map(
              (
                date
              ) =>
                getAdherenceForDate(
                  date
                )
            )
            .filter(
              (
                result
              ) =>
                result !==
                null
            );

        return getWeeklyNutritionAdherence(
          dailyAdherence
        );
      },
      [
        loaded,
        getAdherenceForDate,
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