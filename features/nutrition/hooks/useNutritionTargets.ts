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
  readNutritionTargets,
  writeNutritionTargets,
} from "../nutritionStorage";

import type {
  NutritionTarget,
} from "../nutritionTypes";


// ============================================================
// Types
// ============================================================

export interface NutritionTargetInput {
  effectiveDate?: string;

  calorieTarget?: number;

  proteinTargetGrams?: number;

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


function sortNutritionTargets(
  targets:
    NutritionTarget[]
) {
  return [
    ...targets,
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


function getNutritionTargetForDate(
  history:
    NutritionTarget[],
  date: string
) {
  return (
    history.find(
      (
        target
      ) =>
        target.effectiveDate <=
        date
    ) ??
    null
  );
}


// ============================================================
// Hook
// ============================================================

export function useNutritionTargets() {
  const [
    history,
    setHistory,
  ] =
    useState<
      NutritionTarget[]
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
      sortNutritionTargets(
        readNutritionTargets()
      );

    setHistory(
      saved
    );

    setLoaded(
      true
    );
  }, []);


  // ----------------------------------------------------------
  // Current Target
  // ----------------------------------------------------------
  //
  // A nutrition target becomes active on its effective date.
  //
  // Future-dated targets remain in history but do not replace
  // the currently active target until their effective date.
  // ----------------------------------------------------------

    const currentTarget =
    useMemo(
        () => {
        const today =
            formatLocalDate(
            new Date()
            );

        return getNutritionTargetForDate(
            history,
            today
        );
        },
        [
        history,
        ]
    );

    function getTargetForDate(
        date: string
        ) {
        return getNutritionTargetForDate(
            history,
            date
        );
    }


  // ----------------------------------------------------------
  // Add Target
  // ----------------------------------------------------------
  //
  // Target changes create a new historical record rather than
  // modifying the previous target.
  // ----------------------------------------------------------

  function addTarget(
    input:
      NutritionTargetInput
  ) {
    const now =
      new Date()
        .toISOString();

    const target:
      NutritionTarget = {
      id:
        createId(),

      effectiveDate:
        input.effectiveDate ??
        formatLocalDate(
          new Date()
        ),

      calorieTarget:
        input.calorieTarget,

      proteinTargetGrams:
        input.proteinTargetGrams,

      notes:
        input.notes,

      createdAt:
        now,

      updatedAt:
        now,
    };

    const updatedHistory =
      sortNutritionTargets([
        target,
        ...history,
      ]);

    writeNutritionTargets(
      updatedHistory
    );

    setHistory(
      updatedHistory
    );

    return target;
  }


  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------

  return {
    loaded,

    history,

    currentTarget,

    getTargetForDate,

    addTarget,
  };
}