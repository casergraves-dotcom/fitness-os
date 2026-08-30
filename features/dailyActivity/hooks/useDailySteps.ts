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
  readDailySteps,
  subscribeToDailySteps,
  writeDailySteps,
} from "../dailyActivityStorage";

import type {
  DailyStepRecord,
} from "../dailyActivityTypes";


// ============================================================
// Types
// ============================================================

export interface DailyStepInput {
  date?: string;

  steps: number;

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


function sortDailySteps(
  records:
    DailyStepRecord[]
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

export function useDailySteps() {
  const [
    records,
    setRecords,
  ] =
    useState<
      DailyStepRecord[]
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
          sortDailySteps(
            readDailySteps()
          )
        );

        setLoaded(
          true
        );
      };

    refresh();

    return subscribeToDailySteps(
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
  // Daily steps are one logical record per calendar date.
  // Saving the same date updates the existing record rather
  // than creating another historical entry.
  // ----------------------------------------------------------

  function saveDailySteps(
    input:
      DailyStepInput
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
        DailyStepRecord = {
        ...existing,

        steps:
          input.steps,

        notes:
          input.notes,

        confirmedAt:
          input.confirmedAt,

        updatedAt:
          now,
      };

      const updatedRecords =
        sortDailySteps(
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

      writeDailySteps(
        updatedRecords
      );

      return updatedRecord;
    }

    const record:
      DailyStepRecord = {
      id:
        createId(),

      date,

      steps:
        input.steps,

      source:
        "Manual",

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
      sortDailySteps([
        record,
        ...records,
      ]);

    writeDailySteps(
      updatedRecords
    );

    return record;
  }


  // ----------------------------------------------------------
  // Delete Daily Record
  // ----------------------------------------------------------

  function deleteDailySteps(
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

    writeDailySteps(
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

    saveDailySteps,

    deleteDailySteps,
  };
}
