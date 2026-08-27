"use client";

// ============================================================
// Imports
// ============================================================

import {
  useMemo,
} from "react";

import {
  useDailyNutrition,
  useNutritionTargets,
} from "@/features/nutrition";

import {
  useDailySteps,
  useStepTargets,
} from "@/features/dailyActivity";

import type {
  BodyCompositionGoalProgress,
} from "./useBodyCompositionGoalProgress";

import {
  getLifestyleGoalProgressEvidence,
} from "../utils/getLifestyleGoalProgressEvidence";


// ============================================================
// Hook
// ============================================================

export function useLifestyleGoalProgressEvidence(
  goalProgress:
    BodyCompositionGoalProgress
) {
  const {
    loaded:
      nutritionLoaded,

    records:
      nutritionRecords,
  } =
    useDailyNutrition();

  const {
    loaded:
      nutritionTargetsLoaded,

    history:
      nutritionTargetHistory,
  } =
    useNutritionTargets();

  const {
    loaded:
      stepsLoaded,

    records:
      stepRecords,
  } =
    useDailySteps();

  const {
    loaded:
      stepTargetsLoaded,

    history:
      stepTargetHistory,
  } =
    useStepTargets();


  // ----------------------------------------------------------
  // Loaded
  // ----------------------------------------------------------

  const loaded =
    nutritionLoaded &&
    nutritionTargetsLoaded &&
    stepsLoaded &&
    stepTargetsLoaded;


  // ----------------------------------------------------------
  // Evidence
  // ----------------------------------------------------------

  const evidence =
    useMemo(
      () => {
        if (
          !loaded
        ) {
          return null;
        }

        return getLifestyleGoalProgressEvidence({
          currentDate:
            new Date(),

          goalProgress,

          nutritionRecords,

          nutritionTargetHistory,

          stepRecords,

          stepTargetHistory,
        });
      },
      [
        loaded,
        goalProgress,
        nutritionRecords,
        nutritionTargetHistory,
        stepRecords,
        stepTargetHistory,
      ]
    );


  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------

  return {
    loaded,

    evidence,
  };
}