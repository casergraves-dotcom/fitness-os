"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  readBodyMeasurements,
  readDexaRecords,
  writeBodyMeasurements,
  writeDexaRecords,
} from "../bodyCompositionStorage";

import type {
  BodyMeasurement,
  DexaRecord,
} from "../bodyCompositionTypes";

import {
  createPrivateFileSignedUrl,
  deletePrivateFile,
  getDexaReportStoragePath,
  uploadPrivateFile,
} from "@/lib/storage/privateFileStorage";

import {
  useAuth,
} from "@/features/auth";


// ============================================================
// Types
// ============================================================

export interface DexaRecordInput {
  scanDate?: string;

  weightLb?: number;

  bodyFatPercent?: number;

  fatMassLb?: number;

  leanMassLb?: number;

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
  date:
    Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() +
      1
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


function sortDexaRecords(
  records:
    DexaRecord[]
) {
  return [
    ...records,
  ].sort(
    (
      a,
      b
    ) => {
      const dateComparison =
        b.scanDate.localeCompare(
          a.scanDate
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


function sortBodyMeasurements(
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


function buildDexaMeasurement(
  record:
    DexaRecord
):
BodyMeasurement {
  return {
    id:
      createId(),

    date:
      record.scanDate,

    source:
      "DEXA",

    weightLb:
      record.weightLb,

    bodyFatPercent:
      record.bodyFatPercent,

    leanMassLb:
      record.leanMassLb,

    fatMassLb:
      record.fatMassLb,

    notes:
      record.notes,

    dexaRecordId:
      record.id,

    createdAt:
      record.createdAt,

    updatedAt:
      record.updatedAt,
  };
}


function updateLinkedDexaMeasurement(
  existing:
    BodyMeasurement,
  record:
    DexaRecord
):
BodyMeasurement {
  return {
    ...existing,

    date:
      record.scanDate,

    source:
      "DEXA",

    weightLb:
      record.weightLb,

    bodyFatPercent:
      record.bodyFatPercent,

    leanMassLb:
      record.leanMassLb,

    fatMassLb:
      record.fatMassLb,

    notes:
      record.notes,

    dexaRecordId:
      record.id,

    updatedAt:
      record.updatedAt,
  };
}


// ============================================================
// Hook
// ============================================================

export function useDexaRecords() {
  const {
    user,
    loaded:
      authLoaded,
  } =
    useAuth();

  const [
    records,
    setRecords,
  ] =
    useState<
      DexaRecord[]
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
    setRecords(
      sortDexaRecords(
        readDexaRecords()
      )
    );

    setLoaded(
      true
    );
  }, []);


  // ----------------------------------------------------------
  // Latest
  // ----------------------------------------------------------

  const latestRecord =
    useMemo(
      () =>
        records[0] ??
        null,
      [
        records,
      ]
    );


  // ----------------------------------------------------------
  // Add Record
  // ----------------------------------------------------------

  async function addDexaRecord(
    input:
      DexaRecordInput,
    reportFile?:
      File
  ) {
    const now =
      new Date()
        .toISOString();

    const id =
      createId();

    let uploadedStoragePath:
      string |
      undefined;

    try {
      let reportFileReference:
        DexaRecord["reportFile"];

      if (
        reportFile
      ) {
        if (
          !user
        ) {
          throw new Error(
            "Sign in before uploading a DEXA report."
          );
        }

        uploadedStoragePath =
          getDexaReportStoragePath(
            user.id,
            id,
            reportFile.name
          );

        await uploadPrivateFile(
          uploadedStoragePath,
          reportFile
        );

        reportFileReference = {
          storagePath:
            uploadedStoragePath,

          fileName:
            reportFile.name,

          contentType:
            reportFile.type ||
            "application/octet-stream",
        };
      }

      const record:
        DexaRecord = {
        id,

        scanDate:
          input.scanDate ??
          formatLocalDate(
            new Date()
          ),

        weightLb:
          input.weightLb,

        bodyFatPercent:
          input.bodyFatPercent,

        fatMassLb:
          input.fatMassLb,

        leanMassLb:
          input.leanMassLb,

        notes:
          input.notes,

        reportFile:
          reportFileReference,

        createdAt:
          now,

        updatedAt:
          now,
      };

      const previousRecords =
        readDexaRecords();

      const previousMeasurements =
        readBodyMeasurements();

      const updatedRecords =
        sortDexaRecords([
          record,
          ...previousRecords,
        ]);

      const linkedMeasurement =
        buildDexaMeasurement(
          record
        );

      const updatedMeasurements =
        sortBodyMeasurements([
          linkedMeasurement,
          ...previousMeasurements,
        ]);

      try {
        writeDexaRecords(
          updatedRecords
        );

        writeBodyMeasurements(
          updatedMeasurements
        );
      } catch (
        error
      ) {
        writeDexaRecords(
          previousRecords
        );

        writeBodyMeasurements(
          previousMeasurements
        );

        throw error;
      }

      setRecords(
        updatedRecords
      );

      return record;
    } catch (
      error
    ) {
      if (
        uploadedStoragePath
      ) {
        try {
          await deletePrivateFile(
            uploadedStoragePath
          );
        } catch (
          cleanupError
        ) {
          console.error(
            "Fitness OS could not clean up the uploaded DEXA report after a failed save:",
            cleanupError
          );
        }
      }

      throw error;
    }
  }


  // ----------------------------------------------------------
  // Update Record
  // ----------------------------------------------------------

  async function updateDexaRecord(
    id:
      string,
    input:
      DexaRecordInput
  ) {
    const existingRecord =
      records.find(
        (
          record
        ) =>
          record.id ===
          id
      );

    if (
      !existingRecord
    ) {
      throw new Error(
        "DEXA record was not found."
      );
    }

    const now =
      new Date()
        .toISOString();

    const updatedRecord:
      DexaRecord = {
      ...existingRecord,

      scanDate:
        input.scanDate ??
        existingRecord.scanDate,

      weightLb:
        input.weightLb,

      bodyFatPercent:
        input.bodyFatPercent,

      fatMassLb:
        input.fatMassLb,

      leanMassLb:
        input.leanMassLb,

      notes:
        input.notes,

      // Editing scan values does not replace or remove the
      // original report. File replacement/removal is handled as
      // a separate intentional workflow.
      reportFile:
        existingRecord.reportFile,

      updatedAt:
        now,
    };

    const previousRecords =
      readDexaRecords();

    const previousMeasurements =
      readBodyMeasurements();

    const updatedRecords =
      sortDexaRecords(
        previousRecords.map(
          (
            record
          ) =>
            record.id ===
            id
              ? updatedRecord
              : record
        )
      );

    const linkedMeasurement =
      previousMeasurements.find(
        (
          measurement
        ) =>
          measurement.dexaRecordId ===
          id
      );

    const updatedMeasurements =
      linkedMeasurement
        ? sortBodyMeasurements(
            previousMeasurements.map(
              (
                measurement
              ) =>
                measurement.dexaRecordId ===
                id
                  ? updateLinkedDexaMeasurement(
                      measurement,
                      updatedRecord
                    )
                  : measurement
            )
          )
        : sortBodyMeasurements([
            buildDexaMeasurement(
              updatedRecord
            ),
            ...previousMeasurements,
          ]);

    try {
      writeDexaRecords(
        updatedRecords
      );

      writeBodyMeasurements(
        updatedMeasurements
      );
    } catch (
      error
    ) {
      writeDexaRecords(
        previousRecords
      );

      writeBodyMeasurements(
        previousMeasurements
      );

      throw error;
    }

    setRecords(
      updatedRecords
    );

    return updatedRecord;
  }


  // ----------------------------------------------------------
  // Delete Record
  // ----------------------------------------------------------

  async function deleteDexaRecord(
    id:
      string
  ) {
    const record =
      records.find(
        (
          candidate
        ) =>
          candidate.id ===
          id
      );

    if (
      !record
    ) {
      return;
    }

    // Delete the optional binary first. If this fails, keep the
    // structured record so the user can retry intentionally.
    if (
      record.reportFile
    ) {
      await deletePrivateFile(
        record.reportFile
          .storagePath
      );
    }

    const previousRecords =
      readDexaRecords();

    const previousMeasurements =
      readBodyMeasurements();

    const updatedRecords =
      sortDexaRecords(
        previousRecords.filter(
          (
            candidate
          ) =>
            candidate.id !==
            id
        )
      );

    const updatedMeasurements =
      sortBodyMeasurements(
        previousMeasurements.filter(
          (
            measurement
          ) =>
            measurement.dexaRecordId !==
            id
        )
      );

    try {
      writeDexaRecords(
        updatedRecords
      );

      writeBodyMeasurements(
        updatedMeasurements
      );
    } catch (
      error
    ) {
      // The report may already be gone, but the structured record
      // remains locally recoverable if one of these writes fails.
      writeDexaRecords(
        previousRecords
      );

      writeBodyMeasurements(
        previousMeasurements
      );

      throw error;
    }

    setRecords(
      updatedRecords
    );
  }


  // ----------------------------------------------------------
  // Open Report
  // ----------------------------------------------------------

  async function openDexaReport(
    record:
      DexaRecord
  ) {
    if (
      !record.reportFile
    ) {
      return;
    }

    const url =
      await createPrivateFileSignedUrl(
        record.reportFile
          .storagePath
      );

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }


  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------

  return {
    loaded:
      loaded &&
      authLoaded,

    user,

    records,

    latestRecord,

    addDexaRecord,

    updateDexaRecord,

    deleteDexaRecord,

    openDexaReport,
  };
}
