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
  readBodyMeasurements,
  subscribeToBodyMeasurements,
  writeBodyMeasurements,
} from "../bodyCompositionStorage";

import type {
  BodyMeasurement,
  BodyMeasurementSource,
} from "../bodyCompositionTypes";


// ============================================================
// Types
// ============================================================

export interface BodyMeasurementInput {
  date?: string;

  source?:
    BodyMeasurementSource;

  // ----------------------------------------------------------
  // Scale / Body Composition
  // ----------------------------------------------------------

  weightLb?: number;

  bodyFatPercent?: number;

  leanMassLb?: number;

  fatMassLb?: number;

  // ----------------------------------------------------------
  // Circumference Measurements
  // ----------------------------------------------------------

  neckIn?: number;

  chestIn?: number;

  shouldersIn?: number;

  abdomenIn?: number;

  waistIn?: number;

  hipsIn?: number;

  leftUpperArmIn?: number;

  rightUpperArmIn?: number;

  leftThighIn?: number;

  rightThighIn?: number;

  leftCalfIn?: number;

  rightCalfIn?: number;

  // ----------------------------------------------------------
  // Metadata
  // ----------------------------------------------------------

  notes?: string;

  dexaRecordId?: string;
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


function sortMeasurements(
  measurements:
    BodyMeasurement[]
) {
  return [
    ...measurements,
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

export function useBodyMeasurements() {
  const [
    measurements,
    setMeasurements,
  ] =
    useState<
      BodyMeasurement[]
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
        setMeasurements(
          sortMeasurements(
            readBodyMeasurements()
          )
        );

        setLoaded(
          true
        );
      };

    refresh();

    return subscribeToBodyMeasurements(
      refresh
    );
  }, []);


  // ----------------------------------------------------------
  // Latest Measurement
  // ----------------------------------------------------------

  const latestMeasurement =
    useMemo(
      () =>
        measurements[0] ??
        null,
      [
        measurements,
      ]
    );


  // ----------------------------------------------------------
  // Add Measurement
  // ----------------------------------------------------------

  function addMeasurement(
    input:
      BodyMeasurementInput
  ) {
    const now =
      new Date()
        .toISOString();

    const measurement:
      BodyMeasurement = {
      id:
        createId(),

      date:
        input.date ??
        formatLocalDate(
          new Date()
        ),

      source:
        input.source ??
        "Manual",

      // ------------------------------------------------------
      // Scale / Body Composition
      // ------------------------------------------------------

      weightLb:
        input.weightLb,

      bodyFatPercent:
        input.bodyFatPercent,

      leanMassLb:
        input.leanMassLb,

      fatMassLb:
        input.fatMassLb,

      // ------------------------------------------------------
      // Circumference Measurements
      // ------------------------------------------------------

      neckIn:
        input.neckIn,

      chestIn:
        input.chestIn,

      shouldersIn:
        input.shouldersIn,

      abdomenIn:
        input.abdomenIn,

      waistIn:
        input.waistIn,

      hipsIn:
        input.hipsIn,

      leftUpperArmIn:
        input.leftUpperArmIn,

      rightUpperArmIn:
        input.rightUpperArmIn,

      leftThighIn:
        input.leftThighIn,

      rightThighIn:
        input.rightThighIn,

      leftCalfIn:
        input.leftCalfIn,

      rightCalfIn:
        input.rightCalfIn,

      // ------------------------------------------------------
      // Metadata
      // ------------------------------------------------------

      notes:
        input.notes,

      dexaRecordId:
        input.dexaRecordId,

      createdAt:
        now,

      updatedAt:
        now,
    };

    const updatedMeasurements =
      sortMeasurements([
        measurement,
        ...measurements,
      ]);

    writeBodyMeasurements(
      updatedMeasurements
    );

    return measurement;
  }


  // ----------------------------------------------------------
  // Update Measurement
  // ----------------------------------------------------------

  function updateMeasurement(
    id: string,
    input:
      BodyMeasurementInput
  ) {
    const existing =
      measurements.find(
        (
          measurement
        ) =>
          measurement.id ===
          id
      );

    if (
      !existing
    ) {
      return null;
    }

    const updatedMeasurement:
      BodyMeasurement = {
      ...existing,

      date:
        input.date ??
        existing.date,

      source:
        input.source ??
        existing.source,

      // ------------------------------------------------------
      // Scale / Body Composition
      // ------------------------------------------------------

      weightLb:
        input.weightLb,

      bodyFatPercent:
        input.bodyFatPercent,

      leanMassLb:
        input.leanMassLb,

      fatMassLb:
        input.fatMassLb,

      // ------------------------------------------------------
      // Circumference Measurements
      // ------------------------------------------------------

      neckIn:
        input.neckIn,

      chestIn:
        input.chestIn,

      shouldersIn:
        input.shouldersIn,

      abdomenIn:
        input.abdomenIn,

      waistIn:
        input.waistIn,

      hipsIn:
        input.hipsIn,

      leftUpperArmIn:
        input.leftUpperArmIn,

      rightUpperArmIn:
        input.rightUpperArmIn,

      leftThighIn:
        input.leftThighIn,

      rightThighIn:
        input.rightThighIn,

      leftCalfIn:
        input.leftCalfIn,

      rightCalfIn:
        input.rightCalfIn,

      // ------------------------------------------------------
      // Metadata
      // ------------------------------------------------------

      notes:
        input.notes,

      dexaRecordId:
        input.dexaRecordId,

      updatedAt:
        new Date()
          .toISOString(),
    };

    const updatedMeasurements =
      sortMeasurements(
        measurements.map(
          (
            measurement
          ) =>
            measurement.id ===
            id
              ? updatedMeasurement
              : measurement
        )
      );

    writeBodyMeasurements(
      updatedMeasurements
    );

    return updatedMeasurement;
  }


  // ----------------------------------------------------------
  // Delete Measurement
  // ----------------------------------------------------------

  function deleteMeasurement(
    id: string
  ) {
    const updatedMeasurements =
      measurements.filter(
        (
          measurement
        ) =>
          measurement.id !==
          id
      );

    writeBodyMeasurements(
      updatedMeasurements
    );
  }


  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------

  return {
    loaded,

    measurements,

    latestMeasurement,

    addMeasurement,

    updateMeasurement,

    deleteMeasurement,
  };
}
