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
  DailyStepRecord,
  StepTarget,
} from "./dailyActivityTypes";


// ============================================================
// Validation Helpers
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
// Step Target Validation
// ============================================================

function isStepTarget(
  value: unknown
): value is StepTarget {
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
    typeof value.dailyStepTarget ===
      "number" &&
    isOptionalString(
      value.notes
    ) &&
    typeof value.createdAt ===
      "string" &&
    typeof value.updatedAt ===
      "string"
  );
}


// ============================================================
// Step Target Storage
// ============================================================

export function readStepTargets():
StepTarget[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  const saved =
    localStorage.getItem(
      FITNESS_OS_STORAGE_KEYS.stepTargets
    );

  if (!saved) {
    return [];
  }

  try {
    const parsed: unknown =
      JSON.parse(
        saved
      );

    if (
      !Array.isArray(
        parsed
      )
    ) {
      return [];
    }

    return parsed.filter(
      isStepTarget
    );
  } catch {
    return [];
  }
}


export function writeStepTargets(
  records:
    StepTarget[]
): void {
  setFitnessOsStorage(
    FITNESS_OS_STORAGE_KEYS.stepTargets,
    JSON.stringify(
      records
    )
  );
}


// ============================================================
// Daily Step Validation
// ============================================================

function isDailyStepRecord(
  value: unknown
): value is DailyStepRecord {
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
    typeof value.steps ===
      "number" &&
    value.source ===
      "Manual" &&
    isOptionalString(
      value.notes
    ) &&
    isOptionalString(
      value.confirmedAt
    ) &&
    typeof value.createdAt ===
      "string" &&
    typeof value.updatedAt ===
      "string"
  );
}


// ============================================================
// Daily Step Storage
// ============================================================

export const DAILY_STEPS_CHANGED_EVENT =
  "fitness-os-daily-steps-changed";


export function readDailySteps():
DailyStepRecord[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  const saved =
    localStorage.getItem(
      FITNESS_OS_STORAGE_KEYS.dailySteps
    );

  if (!saved) {
    return [];
  }

  try {
    const parsed: unknown =
      JSON.parse(
        saved
      );

    if (
      !Array.isArray(
        parsed
      )
    ) {
      return [];
    }

    return parsed.filter(
      isDailyStepRecord
    );
  } catch {
    return [];
  }
}


export function subscribeToDailySteps(
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
        FITNESS_OS_STORAGE_KEYS.dailySteps
      ) {
        listener();
      }
    };

  window.addEventListener(
    DAILY_STEPS_CHANGED_EVENT,
    handleCustomEvent
  );

  window.addEventListener(
    "storage",
    handleStorageEvent
  );

  return () => {
    window.removeEventListener(
      DAILY_STEPS_CHANGED_EVENT,
      handleCustomEvent
    );

    window.removeEventListener(
      "storage",
      handleStorageEvent
    );
  };
}


export function writeDailySteps(
  records:
    DailyStepRecord[]
): void {
  setFitnessOsStorage(
    FITNESS_OS_STORAGE_KEYS.dailySteps,
    JSON.stringify(
      records
    )
  );

  if (
    typeof window !==
    "undefined"
  ) {
    window.dispatchEvent(
      new Event(
        DAILY_STEPS_CHANGED_EVENT
      )
    );
  }
}
