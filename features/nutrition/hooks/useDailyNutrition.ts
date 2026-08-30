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
  readDailyNutrition,
  subscribeToDailyNutrition,
  writeDailyNutrition,
} from "../nutritionStorage";

import type {
  DailyNutritionRecord,
} from "../nutritionTypes";


// ============================================================
// Types
// ============================================================

export interface DailyNutritionInput {
  date?: string;

  calories?: number;

  proteinGrams?: number;

  notes?: string;

  confirmedAt?: string;
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


function sortDailyNutrition(
  records:
    DailyNutritionRecord[]
) {
  return [
    ...records,
  ].sort(
    (
      a,
      b
    ) => {
      const dateComparison =
        b.date.localeCompare(
          a.date
        );

      if (
        dateComparison !==
        0
      ) {
        return dateComparison;
      }

      return (
        new Date(
          b.updatedAt
        ).getTime() -
        new Date(
          a.updatedAt
        ).getTime()
      );
    }
  );
}


// ============================================================
// Hook
// ============================================================

export function useDailyNutrition() {
  const [
    records,
    setRecords,
  ] =
    useState<
      DailyNutritionRecord[]
    >([]);

  const [
    loaded,
    setLoaded,
  ] =
    useState(false);


  // ----------------------------------------------------------
  // Load / Synchronize
  // ----------------------------------------------------------

  useEffect(() => {
    const refresh =
      () => {
        setRecords(
          sortDailyNutrition(
            readDailyNutrition()
          )
        );

        setLoaded(
          true
        );
      };

    refresh();

    return subscribeToDailyNutrition(
      refresh
    );
  }, []);


  // ----------------------------------------------------------
  // Today's Record
  // ----------------------------------------------------------

  const today =
    formatLocalDate(
      new Date()
    );

  const todayRecord =
    useMemo(
      () =>
        records.find(
          (
            record
          ) =>
            record.date ===
            today
        ) ??
        null,
      [
        records,
        today,
      ]
    );


  // ----------------------------------------------------------
  // Record Lookup
  // ----------------------------------------------------------

  function getRecordForDate(
    date: string
  ) {
    return (
      records.find(
        (
          record
        ) =>
          record.date ===
          date
      ) ??
      null
    );
  }


  // ----------------------------------------------------------
  // Save / Update Daily Record
  // ----------------------------------------------------------
  //
  // Daily nutrition is one logical record per calendar date.
  // Saving the same date updates that record rather than
  // creating another historical entry.
  // ----------------------------------------------------------

  function saveDailyNutrition(
    input:
      DailyNutritionInput
  ) {
    const date =
      input.date ??
      formatLocalDate(
        new Date()
      );

    const existing =
      records.find(
        (
          record
        ) =>
          record.date ===
          date
      );

    const now =
      new Date()
        .toISOString();

    if (
      existing
    ) {
      const updatedRecord:
        DailyNutritionRecord = {
        ...existing,

        calories:
          input.calories,

        proteinGrams:
          input.proteinGrams,

        notes:
          input.notes,

        confirmedAt:
          input.confirmedAt,

        updatedAt:
          now,
      };

      const updatedRecords =
        sortDailyNutrition(
          records.map(
            (
              record
            ) =>
              record.id ===
              existing.id
                ? updatedRecord
                : record
          )
        );

      writeDailyNutrition(
        updatedRecords
      );

      return updatedRecord;
    }

    const record:
      DailyNutritionRecord = {
      id:
        createId(),

      date,

      calories:
        input.calories,

      proteinGrams:
        input.proteinGrams,

      notes:
        input.notes,

      confirmedAt:
        input.confirmedAt,

      createdAt:
        now,

      updatedAt:
        now,
    };

    const updatedRecords =
      sortDailyNutrition([
        record,
        ...records,
      ]);

    writeDailyNutrition(
      updatedRecords
    );

    return record;
  }


  // ----------------------------------------------------------
  // Delete Daily Record
  // ----------------------------------------------------------

  function deleteDailyNutrition(
    id: string
  ) {
    const updatedRecords =
      records.filter(
        (
          record
        ) =>
          record.id !==
          id
      );

    writeDailyNutrition(
      updatedRecords
    );
  }


  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------

  return {
    loaded,

    records,

    todayRecord,

    getRecordForDate,

    saveDailyNutrition,

    deleteDailyNutrition,
  };
}
