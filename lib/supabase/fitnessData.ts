import {
  supabase,
} from "./client";

// ============================================================
// Types
// ============================================================

export interface FitnessCloudRecord<T = unknown> {
  id: string;

  user_id: string;

  data_key: string;

  data: T;

  client_updated_at: string;

  server_updated_at: string;

  created_at: string;
}

// ============================================================
// Save Cloud Data
// ============================================================

export async function saveFitnessCloudData<T>(
  dataKey: string,
  data: T
): Promise<FitnessCloudRecord<T>> {
  // ----------------------------------------------------------
  // Current User
  // ----------------------------------------------------------

  const {
    data:
      userData,

    error:
      userError,
  } =
    await supabase.auth
      .getUser();

  if (userError) {
    throw userError;
  }

  const user =
    userData.user;

  if (!user) {
    throw new Error(
      "Cannot save Fitness OS cloud data without an authenticated user."
    );
  }

  // ----------------------------------------------------------
  // Save
  // ----------------------------------------------------------

  const clientUpdatedAt =
    new Date()
      .toISOString();

  const {
    data:
      savedRecord,

    error:
      saveError,
  } =
    await supabase
      .from(
        "fitness_os_data"
      )
      .upsert(
        {
          user_id:
            user.id,

          data_key:
            dataKey,

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

  if (saveError) {
    throw saveError;
  }

  return (
    savedRecord as
      FitnessCloudRecord<T>
  );
}

// ============================================================
// Load Cloud Data
// ============================================================

export async function loadFitnessCloudData<T>(
  dataKey: string
): Promise<FitnessCloudRecord<T> | null> {
  // ----------------------------------------------------------
  // Current User
  // ----------------------------------------------------------

  const {
    data:
      userData,

    error:
      userError,
  } =
    await supabase.auth
      .getUser();

  if (userError) {
    throw userError;
  }

  const user =
    userData.user;

  if (!user) {
    return null;
  }

  // ----------------------------------------------------------
  // Load
  // ----------------------------------------------------------

  const {
    data:
      record,

    error:
      loadError,
  } =
    await supabase
      .from(
        "fitness_os_data"
      )
      .select("*")
      .eq(
        "user_id",
        user.id
      )
      .eq(
        "data_key",
        dataKey
      )
      .maybeSingle();

  if (loadError) {
    throw loadError;
  }

  return (
    record as
      FitnessCloudRecord<T> | null
  );
}