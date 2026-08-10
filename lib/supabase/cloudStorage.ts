import { supabase } from "./client";

// ============================================================
// Types
// ============================================================

export interface CloudStorageRecord<T = unknown> {
  data_key: string;
  data: T;
  client_updated_at: string;
  server_updated_at: string;
}

// ============================================================
// Save Cloud Data
// ============================================================

export async function saveCloudData(
  dataKey: string,
  data: unknown
) {
  const {
    data: authData,
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  const user =
    authData.user;

  if (!user) {
    throw new Error(
      "Cannot save Fitness OS cloud data without an authenticated user."
    );
  }

  const clientUpdatedAt =
    new Date().toISOString();

  const {
    data: savedData,
    error,
  } = await supabase
    .from("fitness_os_data")
    .upsert(
      {
        user_id: user.id,
        data_key: dataKey,
        data,
        client_updated_at:
          clientUpdatedAt,
      },
      {
        onConflict:
          "user_id,data_key",
      }
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return savedData;
}

// ============================================================
// Read Cloud Data
// ============================================================

export async function readCloudData<T = unknown>(
  dataKey: string
): Promise<CloudStorageRecord<T> | null> {
  const {
    data: authData,
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  const user =
    authData.user;

  if (!user) {
    throw new Error(
      "Cannot read Fitness OS cloud data without an authenticated user."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("fitness_os_data")
    .select(
      "data_key,data,client_updated_at,server_updated_at"
    )
    .eq(
      "user_id",
      user.id
    )
    .eq(
      "data_key",
      dataKey
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as
    | CloudStorageRecord<T>
    | null;
}