// ============================================================
// Imports
// ============================================================

import {
  setFitnessOsStorage,
} from "@/lib/storage/fitnessOsStorage";

import {
  FITNESS_OS_STORAGE_KEYS,
} from "@/lib/storage/fitnessOsStorageKeys";

import type {
  BodyCompositionGoal,
  BodyMeasurement,
  DexaRecord,
  ProgressCheckIn,
} from "./bodyCompositionTypes";


// ============================================================
// Generic Collection Helpers
// ============================================================

function readCollection<T>(
  key: string,
  isValid:
    (value: unknown) => value is T
): T[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  const saved =
    localStorage.getItem(
      key
    );

  if (!saved) {
    return [];
  }

  try {
    const parsed: unknown =
      JSON.parse(saved);

    if (
      !Array.isArray(
        parsed
      )
    ) {
      return [];
    }

    return parsed.filter(
      isValid
    );
  } catch {
    return [];
  }
}


function writeCollection<T>(
  key:
    | typeof FITNESS_OS_STORAGE_KEYS.goalHistory
    | typeof FITNESS_OS_STORAGE_KEYS.bodyMeasurements
    | typeof FITNESS_OS_STORAGE_KEYS.dexaRecords
    | typeof FITNESS_OS_STORAGE_KEYS.progressCheckIns,
  records: T[]
): void {
  setFitnessOsStorage(
    key,
    JSON.stringify(
      records
    )
  );
}


// ============================================================
// Shared Validation
// ============================================================

function isObject(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !==
      null
  );
}


function isOptionalNumber(
  value: unknown
) {
  return (
    value ===
      undefined ||
    typeof value ===
      "number"
  );
}


function isOptionalString(
  value: unknown
) {
  return (
    value ===
      undefined ||
    typeof value ===
      "string"
  );
}


// ============================================================
// Goal History
// ============================================================

function isBodyCompositionGoal(
  value: unknown
): value is BodyCompositionGoal {
  if (
    !isObject(
      value
    )
  ) {
    return false;
  }

  return (
    typeof value.id ===
      "string" &&
    typeof value.effectiveDate ===
      "string" &&
    typeof value.primaryGoal ===
      "string" &&
    isOptionalNumber(
      value.targetWeightLb
    ) &&
    isOptionalNumber(
      value.targetBodyFatPercent
    ) &&
    isOptionalNumber(
      value.expectedWeeklyWeightChangeLb
    ) &&
    (
      value.performanceGoals ===
        undefined ||
      (
        Array.isArray(
          value.performanceGoals
        ) &&
        value.performanceGoals.every(
          (
            item
          ) =>
            typeof item ===
              "string"
        )
      )
    ) &&
    isOptionalString(
      value.notes
    ) &&
    typeof value.createdAt ===
      "string" &&
    typeof value.updatedAt ===
      "string"
  );
}


export function readGoalHistory():
BodyCompositionGoal[] {
  return readCollection(
    FITNESS_OS_STORAGE_KEYS.goalHistory,
    isBodyCompositionGoal
  );
}


export function writeGoalHistory(
  records:
    BodyCompositionGoal[]
): void {
  writeCollection(
    FITNESS_OS_STORAGE_KEYS.goalHistory,
    records
  );
}


// ============================================================
// Body Measurements
// ============================================================

function isBodyMeasurement(
  value: unknown
): value is BodyMeasurement {
  if (
    !isObject(
      value
    )
  ) {
    return false;
  }

  return (
    typeof value.id ===
      "string" &&
    typeof value.date ===
      "string" &&
    (
      value.source ===
        "Manual" ||
      value.source ===
        "HomeScale" ||
      value.source ===
        "DEXA"
    ) &&
    isOptionalNumber(
      value.weightLb
    ) &&
    isOptionalNumber(
      value.waistIn
    ) &&
    isOptionalNumber(
      value.bodyFatPercent
    ) &&
    isOptionalNumber(
      value.leanMassLb
    ) &&
    isOptionalNumber(
      value.fatMassLb
    ) &&
    isOptionalString(
      value.notes
    ) &&
    isOptionalString(
      value.dexaRecordId
    ) &&
    typeof value.createdAt ===
      "string" &&
    typeof value.updatedAt ===
      "string"
  );
}


export function readBodyMeasurements():
BodyMeasurement[] {
  return readCollection(
    FITNESS_OS_STORAGE_KEYS.bodyMeasurements,
    isBodyMeasurement
  );
}


export const BODY_MEASUREMENTS_CHANGED_EVENT =
  "fitness-os-body-measurements-changed";


export function subscribeToBodyMeasurements(
  listener:
    () => void
): () => void {
  if (
    typeof window ===
    "undefined"
  ) {
    return () => {};
  }

  const handleCustomEvent =
    () => {
      listener();
    };

  const handleStorageEvent =
    (
      event:
        StorageEvent
    ) => {
      if (
        event.key ===
        FITNESS_OS_STORAGE_KEYS.bodyMeasurements
      ) {
        listener();
      }
    };

  window.addEventListener(
    BODY_MEASUREMENTS_CHANGED_EVENT,
    handleCustomEvent
  );

  window.addEventListener(
    "storage",
    handleStorageEvent
  );

  return () => {
    window.removeEventListener(
      BODY_MEASUREMENTS_CHANGED_EVENT,
      handleCustomEvent
    );

    window.removeEventListener(
      "storage",
      handleStorageEvent
    );
  };
}


export function writeBodyMeasurements(
  records:
    BodyMeasurement[]
): void {
  writeCollection(
    FITNESS_OS_STORAGE_KEYS.bodyMeasurements,
    records
  );

  if (
    typeof window !==
    "undefined"
  ) {
    window.dispatchEvent(
      new Event(
        BODY_MEASUREMENTS_CHANGED_EVENT
      )
    );
  }
}


// ============================================================
// DEXA Records
// ============================================================

function isDexaRecord(
  value: unknown
): value is DexaRecord {
  if (
    !isObject(
      value
    )
  ) {
    return false;
  }

  const reportFile =
    value.reportFile;

  const validReportFile =
    reportFile ===
      undefined ||
    (
      isObject(
        reportFile
      ) &&
      typeof reportFile.storagePath ===
        "string" &&
      typeof reportFile.fileName ===
        "string" &&
      typeof reportFile.contentType ===
        "string"
    );

  return (
    typeof value.id ===
      "string" &&
    typeof value.scanDate ===
      "string" &&
    isOptionalNumber(
      value.weightLb
    ) &&
    isOptionalNumber(
      value.bodyFatPercent
    ) &&
    isOptionalNumber(
      value.fatMassLb
    ) &&
    isOptionalNumber(
      value.leanMassLb
    ) &&
    isOptionalString(
      value.notes
    ) &&
    validReportFile &&
    typeof value.createdAt ===
      "string" &&
    typeof value.updatedAt ===
      "string"
  );
}


export function readDexaRecords():
DexaRecord[] {
  return readCollection(
    FITNESS_OS_STORAGE_KEYS.dexaRecords,
    isDexaRecord
  );
}


export function writeDexaRecords(
  records:
    DexaRecord[]
): void {
  writeCollection(
    FITNESS_OS_STORAGE_KEYS.dexaRecords,
    records
  );
}


// ============================================================
// Progress Check-Ins
// ============================================================

function isProgressCheckIn(
  value: unknown
): value is ProgressCheckIn {
  if (
    !isObject(
      value
    )
  ) {
    return false;
  }

  const photos =
    value.photos;

  const validPhotos =
    photos ===
      undefined ||
    (
      Array.isArray(
        photos
      ) &&
      photos.every(
        (
          photo
        ) =>
          isObject(
            photo
          ) &&
          typeof photo.id ===
            "string" &&
          (
            photo.view ===
              "Front" ||
            photo.view ===
              "Side" ||
            photo.view ===
              "Back"
          ) &&
          typeof photo.storagePath ===
            "string" &&
          typeof photo.fileName ===
            "string" &&
          typeof photo.contentType ===
            "string" &&
          typeof photo.uploadedAt ===
            "string"
      )
    );

  return (
    typeof value.id ===
      "string" &&
    typeof value.date ===
      "string" &&
    isOptionalString(
      value.measurementId
    ) &&
    validPhotos &&
    isOptionalString(
      value.notes
    ) &&
    typeof value.createdAt ===
      "string" &&
    typeof value.updatedAt ===
      "string"
  );
}


export function readProgressCheckIns():
ProgressCheckIn[] {
  return readCollection(
    FITNESS_OS_STORAGE_KEYS.progressCheckIns,
    isProgressCheckIn
  );
}


export function writeProgressCheckIns(
  records:
    ProgressCheckIn[]
): void {
  writeCollection(
    FITNESS_OS_STORAGE_KEYS.progressCheckIns,
    records
  );
}