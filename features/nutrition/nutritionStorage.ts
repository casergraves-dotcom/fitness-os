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
  DailyNutritionRecord,
  MetabolicRateRecord,
  NutritionTarget,
} from "./nutritionTypes";


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
// Nutrition Target Validation
// ============================================================

function isNutritionTarget(
  value: unknown
): value is NutritionTarget {
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
    isOptionalNumber(
      value.calorieTarget
    ) &&
    isOptionalNumber(
      value.proteinTargetGrams
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


// ============================================================
// Nutrition Target Storage
// ============================================================

export function readNutritionTargets():
NutritionTarget[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  const saved =
    localStorage.getItem(
      FITNESS_OS_STORAGE_KEYS.nutritionTargets
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
      isNutritionTarget
    );
  } catch {
    return [];
  }
}


export function writeNutritionTargets(
  records:
    NutritionTarget[]
): void {
  setFitnessOsStorage(
    FITNESS_OS_STORAGE_KEYS.nutritionTargets,
    JSON.stringify(
      records
    )
  );
}


// ============================================================
// Daily Nutrition Validation
// ============================================================

function isDailyNutritionRecord(
  value: unknown
): value is DailyNutritionRecord {
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
    isOptionalNumber(
      value.calories
    ) &&
    isOptionalNumber(
      value.proteinGrams
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


// ============================================================
// Daily Nutrition Storage
// ============================================================

export const DAILY_NUTRITION_CHANGED_EVENT =
  "fitness-os-daily-nutrition-changed";


export function readDailyNutrition():
DailyNutritionRecord[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  const saved =
    localStorage.getItem(
      FITNESS_OS_STORAGE_KEYS.dailyNutrition
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
      isDailyNutritionRecord
    );
  } catch {
    return [];
  }
}


export function subscribeToDailyNutrition(
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
        FITNESS_OS_STORAGE_KEYS.dailyNutrition
      ) {
        listener();
      }
    };

  window.addEventListener(
    DAILY_NUTRITION_CHANGED_EVENT,
    handleCustomEvent
  );

  window.addEventListener(
    "storage",
    handleStorageEvent
  );

  return () => {
    window.removeEventListener(
      DAILY_NUTRITION_CHANGED_EVENT,
      handleCustomEvent
    );

    window.removeEventListener(
      "storage",
      handleStorageEvent
    );
  };
}


export function writeDailyNutrition(
  records:
    DailyNutritionRecord[]
): void {
  setFitnessOsStorage(
    FITNESS_OS_STORAGE_KEYS.dailyNutrition,
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
        DAILY_NUTRITION_CHANGED_EVENT
      )
    );
  }
}

// ============================================================
// Resting Metabolic Rate Storage
// ============================================================

function isMetabolicRateRecord(
  value: unknown
): value is MetabolicRateRecord {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.measuredDate === "string" &&
    typeof value.restingCalories === "number" &&
    (value.source === "IndirectCalorimetry" ||
      value.source === "ProviderEstimate" ||
      value.source === "ManualEstimate") &&
    isOptionalNumber(value.weightLb) &&
    isOptionalString(value.notes) &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

export function readMetabolicRateRecords(): MetabolicRateRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  const saved = localStorage.getItem(
    FITNESS_OS_STORAGE_KEYS.metabolicRateRecords
  );

  if (!saved) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.filter(isMetabolicRateRecord) : [];
  } catch {
    return [];
  }
}

export function writeMetabolicRateRecords(
  records: MetabolicRateRecord[]
): void {
  setFitnessOsStorage(
    FITNESS_OS_STORAGE_KEYS.metabolicRateRecords,
    JSON.stringify(records)
  );
}
