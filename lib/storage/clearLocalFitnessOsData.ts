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
