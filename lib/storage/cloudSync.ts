// ============================================================
// Imports
// ============================================================

import { supabase } from "@/lib/supabase/client";

import {
  FITNESS_OS_SYNC_KEYS,
  FitnessOsSyncKey,
} from "./fitnessOsStorageKeys";

// ============================================================
// Types
// ============================================================

interface CloudStorageRow {
  data_key: string;
  data: unknown;
  client_updated_at: string;
  server_updated_at: string;
}

// ============================================================
// Helpers
// ============================================================

function isSyncKey(
  key: string,
): key is FitnessOsSyncKey {
  return FITNESS_OS_SYNC_KEYS.some(
    (syncKey) => syncKey === key,
  );
}

// ============================================================
// Upload One Local Storage Value
// ============================================================

export async function uploadStorageKey(
  key: FitnessOsSyncKey,
): Promise<void> {
  const rawValue = localStorage.getItem(key);

  if (rawValue === null) {
    return;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error(
      "Cannot sync Fitness OS data without an authenticated user.",
    );
  }

  let data: unknown;

  try {
    data = JSON.parse(rawValue);
  } catch {
    data = rawValue;
  }

  const now = new Date().toISOString();

  const { error } = await supabase
    .from("fitness_os_data")
    .upsert(
      {
        user_id: user.id,
        data_key: key,
        data,
        client_updated_at: now,
      },
      {
        onConflict: "user_id,data_key",
      },
    );

  if (error) {
    throw error;
  }
}

// ============================================================
// Delete One Cloud Storage Value
// ============================================================

export async function deleteCloudStorageKey(
  key: FitnessOsSyncKey,
): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error(
      "Cannot delete Fitness OS cloud data without an authenticated user.",
    );
  }

  const { error } = await supabase
    .from("fitness_os_data")
    .delete()
    .eq(
      "user_id",
      user.id,
    )
    .eq(
      "data_key",
      key,
    );

  if (error) {
    throw error;
  }
}

// ============================================================
// Download One Cloud Value
// ============================================================

export async function downloadStorageKey(
  key: FitnessOsSyncKey,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("fitness_os_data")
    .select(
      "data_key,data,client_updated_at,server_updated_at",
    )
    .eq("data_key", key)
    .maybeSingle<CloudStorageRow>();

  if (error) {
    throw error;
  }

  if (!data) {
    return false;
  }

  localStorage.setItem(
    key,
    JSON.stringify(data.data),
  );

  return true;
}

// ============================================================
// Upload All Existing Local Data
// ============================================================

export async function uploadAllLocalData(): Promise<void> {
  for (const key of FITNESS_OS_SYNC_KEYS) {
    await uploadStorageKey(key);
  }
}

// ============================================================
// Download All Existing Cloud Data
// ============================================================

export async function downloadAllCloudData(): Promise<void> {
  for (const key of FITNESS_OS_SYNC_KEYS) {
    await downloadStorageKey(key);
  }
}

// ============================================================
// Get Cloud Snapshot
// ============================================================

export async function getCloudSnapshot(): Promise<
  CloudStorageRow[]
> {
  const { data, error } = await supabase
    .from("fitness_os_data")
    .select(
      "data_key,data,client_updated_at,server_updated_at",
    );

  if (error) {
    throw error;
  }

  return (data ?? []).filter((row) =>
    isSyncKey(row.data_key),
  );
}