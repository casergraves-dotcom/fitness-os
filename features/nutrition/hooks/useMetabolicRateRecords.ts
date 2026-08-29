"use client";

import { useEffect, useMemo, useState } from "react";

import {
  readMetabolicRateRecords,
  writeMetabolicRateRecords,
} from "../nutritionStorage";
import type {
  MetabolicRateRecord,
  MetabolicRateSource,
} from "../nutritionTypes";

export interface MetabolicRateRecordInput {
  measuredDate: string;
  restingCalories: number;
  source: MetabolicRateSource;
  weightLb?: number;
  notes?: string;
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function sortRecords(records: MetabolicRateRecord[]) {
  return [...records].sort((a, b) => {
    const dateComparison = b.measuredDate.localeCompare(a.measuredDate);
    return dateComparison !== 0
      ? dateComparison
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function useMetabolicRateRecords() {
  const [records, setRecords] = useState<MetabolicRateRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setRecords(sortRecords(readMetabolicRateRecords()));
    setLoaded(true);
  }, []);

  const latestRecord = useMemo(() => records[0] ?? null, [records]);

  function addRecord(input: MetabolicRateRecordInput) {
    if (!Number.isFinite(input.restingCalories) || input.restingCalories <= 0) {
      throw new Error("Resting metabolic rate must be greater than zero.");
    }

    const now = new Date().toISOString();
    const record: MetabolicRateRecord = {
      id: createId(),
      measuredDate: input.measuredDate,
      restingCalories: input.restingCalories,
      source: input.source,
      weightLb: input.weightLb,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };
    const updated = sortRecords([record, ...records]);

    writeMetabolicRateRecords(updated);
    setRecords(updated);
    return record;
  }

  function deleteRecord(id: string) {
    const updated = records.filter((record) => record.id !== id);
    writeMetabolicRateRecords(updated);
    setRecords(updated);
  }

  return {
    loaded,
    records,
    latestRecord,
    addRecord,
    deleteRecord,
  };
}
