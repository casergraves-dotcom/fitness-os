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
import { getTrainingWeekDatesThroughDate } from "@/lib/date/trainingWeek";


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
          getTrainingWeekDatesThroughDate(
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
