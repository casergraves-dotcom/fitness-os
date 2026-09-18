// ============================================================
// Clear Device-Local Fitness OS Data
// ============================================================
//
// Supabase authentication keys do not use this prefix. Removing
// only Fitness OS keys prevents one account's cached records or
// active sessions from appearing after another account signs in.

const FITNESS_OS_LOCAL_STORAGE_PREFIX =
  "fitness-os-";


export interface LocalStorageLike {
  readonly length: number;
  key(index: number): string | null;
  removeItem(key: string): void;
}

export const FITNESS_OS_CACHE_USER_KEY = "fitness-os-cache-user-id";

interface CacheStorageLike extends LocalStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}


export function clearLocalFitnessOsData(
  storage: LocalStorageLike = localStorage,
): void {
  const keysToRemove: string[] = [];

  for (
    let index = 0;
    index < storage.length;
    index += 1
  ) {
    const key = storage.key(index);

    if (
      key?.startsWith(
        FITNESS_OS_LOCAL_STORAGE_PREFIX,
      )
    ) {
      keysToRemove.push(key);
    }
  }

  for (const key of keysToRemove) {
    storage.removeItem(key);
  }
}

// An untagged cache may contain unsynced records from an older app version, so
// bind it on first use rather than deleting it. Once tagged, account changes
// must clear every Fitness OS key before another user's cloud data is loaded.
export function ensureLocalFitnessOsCacheOwner(
  userId: string,
  storage: CacheStorageLike = localStorage,
): void {
  const priorUserId = storage.getItem(FITNESS_OS_CACHE_USER_KEY);

  if (priorUserId && priorUserId !== userId) {
    clearLocalFitnessOsData(storage);
  }

  storage.setItem(FITNESS_OS_CACHE_USER_KEY, userId);
}
