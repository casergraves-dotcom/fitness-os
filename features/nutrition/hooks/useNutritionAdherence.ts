"use client";

// ============================================================
// Imports
// ============================================================

import {
  useMemo,
} from "react";

import {
  useDailyNutrition,
} from "./useDailyNutrition";

import {
  useNutritionTargets,
} from "./useNutritionTargets";

import {
  getNutritionAdherence,
} from "../utils/getNutritionAdherence";


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


// ============================================================
// Hook
// ============================================================

export function useNutritionAdherence() {
  const {
    loaded:
      nutritionLoaded,

    records,

    getRecordForDate,
  } =
    useDailyNutrition();

  const {
    loaded:
      targetsLoaded,

    getTargetForDate,
  } =
    useNutritionTargets();


  // ----------------------------------------------------------
  // Today
  // ----------------------------------------------------------

  const today =
    formatLocalDate(
      new Date()
    );

  const todayAdherence =
    useMemo(
      () => {
        if (
          !nutritionLoaded ||
          !targetsLoaded
        ) {
          return null;
        }

        return getNutritionAdherence(
          today,
          getTargetForDate(
            today
          ),
          getRecordForDate(
            today
          )
        );
      },
      [
        nutritionLoaded,
        targetsLoaded,
        records,
        today,
        getRecordForDate,
        getTargetForDate,
      ]
    );


  // ----------------------------------------------------------
  // Arbitrary Date
  // ----------------------------------------------------------

  function getAdherenceForDate(
    date: string
  ) {
    if (
      !nutritionLoaded ||
      !targetsLoaded
    ) {
      return null;
    }

    return getNutritionAdherence(
      date,
      getTargetForDate(
        date
      ),
      getRecordForDate(
        date
      )
    );
  }


  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------

  return {
    loaded:
      nutritionLoaded &&
      targetsLoaded,

    todayAdherence,

    getAdherenceForDate,
  };
}