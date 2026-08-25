"use client";

// ============================================================
// Imports
// ============================================================

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  readGoalHistory,
  writeGoalHistory,
} from "../bodyCompositionStorage";

import type {
  BodyCompositionGoal,
  BodyCompositionGoalType,
} from "../bodyCompositionTypes";


// ============================================================
// Types
// ============================================================

export interface BodyCompositionGoalInput {
  effectiveDate?: string;

  primaryGoal:
    BodyCompositionGoalType;

  targetWeightLb?: number;

  targetBodyFatPercent?: number;

  expectedWeeklyWeightChangeLb?: number;

  performanceGoals?: string[];

  notes?: string;
}


// ============================================================
// Helpers
// ============================================================

function createId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}


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


function sortGoalHistory(
  goals:
    BodyCompositionGoal[]
) {
  return [
    ...goals,
  ].sort(
    (
      a,
      b
    ) => {
      const dateComparison =
        b.effectiveDate.localeCompare(
          a.effectiveDate
        );

      if (
        dateComparison !==
        0
      ) {
        return dateComparison;
      }

      return (
        new Date(
          b.createdAt
        ).getTime() -
        new Date(
          a.createdAt
        ).getTime()
      );
    }
  );
}


// ============================================================
// Hook
// ============================================================

export function useBodyCompositionGoals() {
  const [
    history,
    setHistory,
  ] =
    useState<
      BodyCompositionGoal[]
    >([]);

  const [
    loaded,
    setLoaded,
  ] =
    useState(false);


  // ----------------------------------------------------------
  // Load
  // ----------------------------------------------------------

  useEffect(() => {
    const saved =
      sortGoalHistory(
        readGoalHistory()
      );

    setHistory(
      saved
    );

    setLoaded(
      true
    );
  }, []);


  // ----------------------------------------------------------
  // Current Goal
  // ----------------------------------------------------------
  //
  // A goal becomes active on its effective date.
  //
  // Future-dated goals remain in history but do not replace
  // the currently active goal until their effective date.
  // ----------------------------------------------------------

  const currentGoal =
    useMemo(
      () => {
        const today =
          formatLocalDate(
            new Date()
          );

        return (
          history.find(
            (
              goal
            ) =>
              goal.effectiveDate <=
              today
          ) ??
          null
        );
      },
      [
        history,
      ]
    );


  // ----------------------------------------------------------
  // Add Goal
  // ----------------------------------------------------------
  //
  // Goal changes create a new historical record rather than
  // modifying the previous goal.
  //
  // This preserves the goal context that was active during
  // earlier training/body-composition periods.
  // ----------------------------------------------------------

  function addGoal(
    input:
      BodyCompositionGoalInput
  ) {
    const now =
      new Date()
        .toISOString();

    const goal:
      BodyCompositionGoal = {
      id:
        createId(),

      effectiveDate:
        input.effectiveDate ??
        formatLocalDate(
          new Date()
        ),

      primaryGoal:
        input.primaryGoal,

      targetWeightLb:
        input.targetWeightLb,

      targetBodyFatPercent:
        input.targetBodyFatPercent,

      expectedWeeklyWeightChangeLb:
        input.expectedWeeklyWeightChangeLb,

      performanceGoals:
        input.performanceGoals,

      notes:
        input.notes,

      createdAt:
        now,

      updatedAt:
        now,
    };

    const updatedHistory =
      sortGoalHistory([
        goal,
        ...history,
      ]);

    writeGoalHistory(
      updatedHistory
    );

    setHistory(
      updatedHistory
    );

    return goal;
  }


  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------

  return {
    loaded,

    history,

    currentGoal,

    addGoal,
  };
}