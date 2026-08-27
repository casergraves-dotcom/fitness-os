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
  readStepTargets,
  writeStepTargets,
} from "../dailyActivityStorage";

import type {
  StepTarget,
} from "../dailyActivityTypes";


// ============================================================
// Types
// ============================================================

export interface StepTargetInput {
  effectiveDate?: string;

  dailyStepTarget: number;

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


function sortStepTargets(
  targets:
    StepTarget[]
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


function getStepTargetForDate(
  history:
    StepTarget[],
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

export function useStepTargets() {
  const [
    history,
    setHistory,
  ] =
    useState<
      StepTarget[]
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
      sortStepTargets(
        readStepTargets()
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
  // A step target becomes active on its effective date.
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

        return getStepTargetForDate(
          history,
          today
        );
      },
      [
        history,
      ]
    );


  // ----------------------------------------------------------
  // Target Lookup
  // ----------------------------------------------------------

  function getTargetForDate(
    date: string
  ) {
    return getStepTargetForDate(
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
      StepTargetInput
  ) {
    const now =
      new Date()
        .toISOString();

    const target:
      StepTarget = {
      id:
        createId(),

      effectiveDate:
        input.effectiveDate ??
        formatLocalDate(
          new Date()
        ),

      dailyStepTarget:
        input.dailyStepTarget,

      notes:
        input.notes,

      createdAt:
        now,

      updatedAt:
        now,
    };

    const updatedHistory =
      sortStepTargets([
        target,
        ...history,
      ]);

    writeStepTargets(
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