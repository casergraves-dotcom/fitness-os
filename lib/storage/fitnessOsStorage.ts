// ============================================================
// Imports
// ============================================================

import {
  deleteCloudStorageKey,
  uploadStorageKey,
} from "./cloudSync";

import {
  FitnessOsSyncKey,
} from "./fitnessOsStorageKeys";

// ============================================================
// Set Fitness OS Storage
// ============================================================

export function setFitnessOsStorage(
  key: FitnessOsSyncKey,
  value: string,
): void {
  // ----------------------------------------------------------
  // Save Locally
  // ----------------------------------------------------------

  localStorage.setItem(
    key,
    value,
  );

  // ----------------------------------------------------------
  // Sync To Cloud
  // ----------------------------------------------------------
  //
  // Local storage remains the immediate source for the UI.
  // Cloud synchronization happens asynchronously so network
  // failure never blocks the application.
  //

  void uploadStorageKey(key).catch(
    (error) => {
      console.error(
        `Fitness OS cloud sync failed for ${key}:`,
        error,
      );
    },
  );
}

// ============================================================
// Remove Fitness OS Storage
// ============================================================

export function removeFitnessOsStorage(
  key: FitnessOsSyncKey,
): void {
  // ----------------------------------------------------------
  // Remove Locally
  // ----------------------------------------------------------

  localStorage.removeItem(key);

  // ----------------------------------------------------------
  // Remove From Cloud
  // ----------------------------------------------------------

  void deleteCloudStorageKey(key).catch(
    (error) => {
      console.error(
        `Fitness OS cloud deletion failed for ${key}:`,
        error,
      );
    },
  );
}