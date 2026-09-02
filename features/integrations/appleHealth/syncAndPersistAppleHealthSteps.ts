import type {
  DailyStepRecord,
} from "../../dailyActivity/dailyActivityTypes.ts";
import type {
  AppleHealthStepBridge,
} from "./appleHealthStepBridge.ts";
import {
  syncAppleHealthSteps,
} from "./syncAppleHealthSteps.ts";

interface PersistenceAdapter {
  read: () => DailyStepRecord[];
  write: (records: DailyStepRecord[]) => void;
}

interface SyncAndPersistOptions {
  bridge: AppleHealthStepBridge;
  startDate: string;
  endDate: string;
  requestAuthorization?: boolean;
  persistence?: PersistenceAdapter;
  now?: () => Date;
  createId?: () => string;
}

function createRecordId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// This is the sole web-side entry point for importing Apple Health step
// totals. It deliberately uses the existing daily-step storage helper so every
// current consumer observes the same canonical records and cloud sync behavior.
export async function syncAndPersistAppleHealthSteps(
  options: SyncAndPersistOptions
) {
  const persistence = options.persistence ?? await getCanonicalPersistence();
  const existingRecords = persistence.read();
  const result = await syncAppleHealthSteps({
    bridge: options.bridge,
    records: existingRecords,
    startDate: options.startDate,
    endDate: options.endDate,
    syncedAt: (options.now ?? (() => new Date()))().toISOString(),
    createId: options.createId ?? createRecordId,
    requestAuthorization: options.requestAuthorization,
  });

  if (
    (result.status === "Synced" || result.status === "PartialHistory") &&
    (result.added > 0 || result.updated > 0)
  ) {
    persistence.write(result.records);
  }

  return result;
}

async function getCanonicalPersistence(): Promise<PersistenceAdapter> {
  const storage = await import(
    "../../dailyActivity/dailyActivityStorage.ts"
  );
  return {
    read: storage.readDailySteps,
    write: storage.writeDailySteps,
  };
}
