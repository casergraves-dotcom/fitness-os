"use client";

// ============================================================
// Imports
// ============================================================

import {
  useMemo,
} from "react";

import type {
  CurrentWeeklyProgress,
} from "@/features/today/utils/getCurrentWeeklyProgress";

import type {
  BodyCompositionGoalProgress,
} from "./useBodyCompositionGoalProgress";

import {
  useLifestyleGoalProgressEvidence,
} from "./useLifestyleGoalProgressEvidence";

import type {
  RecoveryProgressTrend,
} from "../utils/getRecoveryProgressTrend";

import type {
  RunningProgressTrend,
} from "../utils/getRunningProgressTrend";

import type {
  StrengthProgressTrend,
} from "../utils/getStrengthProgressTrend";

import {
  getWeeklyReview,
} from "../utils/getWeeklyReview";


// ============================================================
// Hook
// ============================================================

export function useWeeklyReview({
  weeklyProgress,
  goalProgress,
  strengthProgressTrend,
  runningProgressTrend,
  recoveryProgressTrend,
}: {
  weeklyProgress:
    CurrentWeeklyProgress | null;

  goalProgress:
    BodyCompositionGoalProgress;

  strengthProgressTrend:
    StrengthProgressTrend;

  runningProgressTrend:
    RunningProgressTrend;

  recoveryProgressTrend:
    RecoveryProgressTrend;
}) {
  const {
    loaded:
      lifestyleEvidenceLoaded,

    evidence:
      lifestyleEvidence,
  } =
    useLifestyleGoalProgressEvidence(
      goalProgress
    );


  // ----------------------------------------------------------
  // Review
  // ----------------------------------------------------------

  const review =
    useMemo(
      () => {
        if (
          !lifestyleEvidenceLoaded
        ) {
          return null;
        }

        return getWeeklyReview({
          weeklyProgress,

          goalProgress,

          lifestyleEvidence,

          strengthProgressTrend,

          runningProgressTrend,

          recoveryProgressTrend,
        });
      },
      [
        lifestyleEvidenceLoaded,
        weeklyProgress,
        goalProgress,
        lifestyleEvidence,
        strengthProgressTrend,
        runningProgressTrend,
        recoveryProgressTrend,
      ]
    );


  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------

  return {
    loaded:
      lifestyleEvidenceLoaded,

    review,
  };
}