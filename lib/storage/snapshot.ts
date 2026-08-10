import {
  CLOUD_SYNC_STORAGE_KEYS,
  type CloudSyncStorageKey,
} from "./keys";

// ============================================================
// Types
// ============================================================

export interface LocalStorageSnapshotItem {
  key: CloudSyncStorageKey;

  data: unknown;
}

export interface LocalStorageSnapshot {
  createdAt: string;

  items: LocalStorageSnapshotItem[];
}

// ============================================================
// Read One Storage Item
// ============================================================

function readStorageItem(
  key: CloudSyncStorageKey
): LocalStorageSnapshotItem | null {
  const rawValue =
    localStorage.getItem(
      key
    );

  if (rawValue === null) {
    return null;
  }

  try {
    return {
      key,
      data:
        JSON.parse(
          rawValue
        ),
    };
  } catch {
    console.warn(
      `Fitness OS could not parse local storage key: ${key}`
    );

    return null;
  }
}

// ============================================================
// Create Snapshot
// ============================================================

export function createLocalStorageSnapshot():
  LocalStorageSnapshot {
  if (
    typeof window ===
    "undefined"
  ) {
    return {
      createdAt:
        new Date()
          .toISOString(),

      items: [],
    };
  }

  const items =
    CLOUD_SYNC_STORAGE_KEYS
      .map(
        readStorageItem
      )
      .filter(
        (
          item
        ): item is LocalStorageSnapshotItem =>
          item !== null
      );

  return {
    createdAt:
      new Date()
        .toISOString(),

    items,
  };
}