"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  MorningCheckInRatings,
} from "../components/MorningCheckIn";


// ============================================================
// Types
// ============================================================

export interface MorningCheckInRecord {
  date: string;

  ratings: MorningCheckInRatings;

  updatedAt: string;
}


// ============================================================
// Storage
// ============================================================

const MORNING_CHECK_IN_STORAGE_KEY =
  "fitness-os-morning-check-ins";


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


function readMorningCheckIns():
MorningCheckInRecord[] {
  const saved =
    localStorage.getItem(
      MORNING_CHECK_IN_STORAGE_KEY
    );

  if (!saved) {
    return [];
  }

  try {
    const parsed: unknown =
      JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (
        value
      ): value is MorningCheckInRecord => {
        if (
          typeof value !== "object" ||
          value === null
        ) {
          return false;
        }

        const candidate =
          value as Partial<MorningCheckInRecord>;

        return (
          typeof candidate.date ===
            "string" &&
          typeof candidate.updatedAt ===
            "string" &&
          typeof candidate.ratings ===
            "object" &&
          candidate.ratings !== null
        );
      }
    );
  } catch {
    return [];
  }
}


function writeMorningCheckIns(
  records:
    MorningCheckInRecord[]
) {
  localStorage.setItem(
    MORNING_CHECK_IN_STORAGE_KEY,
    JSON.stringify(records)
  );
}


// ============================================================
// Defaults
// ============================================================

const defaultRatings:
MorningCheckInRatings = {
  Energy: 0,
  Sleep: 0,
  Mood: 0,
  Stress: 0,
  UpperBodySoreness: 0,
  LowerBodySoreness: 0,
};


// ============================================================
// Hook
// ============================================================

export function useMorningCheckIn() {

  const [
    ratings,
    setRatingsState,
  ] =
    useState<MorningCheckInRatings>(
      defaultRatings
    );

  const [
    history,
    setHistory,
  ] =
    useState<
      MorningCheckInRecord[]
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
      readMorningCheckIns();

    const today =
      formatLocalDate(
        new Date()
      );

    const todayRecord =
      saved.find(
        (record) =>
          record.date ===
          today
      );

    setHistory(saved);

    setRatingsState(
      todayRecord?.ratings ??
        defaultRatings
    );

    setLoaded(true);
  }, []);


  // ----------------------------------------------------------
  // Update Today's Check-In
  // ----------------------------------------------------------

  function setRatings(
    nextRatings:
      MorningCheckInRatings
  ) {
    setRatingsState(
      nextRatings
    );

    const date =
      formatLocalDate(
        new Date()
      );

    const record:
      MorningCheckInRecord = {
        date,

        ratings:
          nextRatings,

        updatedAt:
          new Date()
            .toISOString(),
      };

    setHistory(
      (previous) => {
        const withoutToday =
          previous.filter(
            (item) =>
              item.date !==
              date
          );

        const updated = [
          ...withoutToday,
          record,
        ].sort(
          (a, b) =>
            a.date.localeCompare(
              b.date
            )
        );

        writeMorningCheckIns(
          updated
        );

        return updated;
      }
    );
  }


  // ----------------------------------------------------------
  // API
  // ----------------------------------------------------------

  return {
    ratings,
    history,
    loaded,

    setRatings,
  };
}