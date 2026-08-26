import {
  supabase,
} from "@/lib/supabase/client";

// ============================================================
// Fitness OS Private File Storage
// ============================================================

export const FITNESS_OS_PRIVATE_BUCKET =
  "fitness-os-private";


// ------------------------------------------------------------
// Path Helpers
// ------------------------------------------------------------

export function getDexaReportStoragePath(
  userId: string,
  dexaRecordId: string,
  fileName: string
) {
  return [
    userId,
    "dexa",
    dexaRecordId,
    fileName,
  ].join("/");
}


export function getProgressPhotoStoragePath(
  userId: string,
  checkInId: string,
  photoId: string,
  view:
    | "Front"
    | "Side"
    | "Back",
  extension: string
) {
  return [
    userId,
    "progress-photos",
    checkInId,
    `${photoId}-${view.toLowerCase()}.${extension}`,
  ].join("/");
}


// ============================================================
// Upload Private File
// ============================================================

export async function uploadPrivateFile(
  storagePath: string,
  file: File
): Promise<void> {
  const {
    error,
  } =
    await supabase.storage
      .from(
        FITNESS_OS_PRIVATE_BUCKET
      )
      .upload(
        storagePath,
        file,
        {
          upsert: false,
        }
      );

  if (error) {
    throw error;
  }
}


// ============================================================
// Download Private File
// ============================================================

export async function downloadPrivateFile(
  storagePath: string
): Promise<Blob> {
  const {
    data,
    error,
  } =
    await supabase.storage
      .from(
        FITNESS_OS_PRIVATE_BUCKET
      )
      .download(
        storagePath
      );

  if (error) {
    throw error;
  }

  return data;
}


// ============================================================
// Create Temporary Download URL
// ============================================================

export async function createPrivateFileSignedUrl(
  storagePath: string,
  expiresInSeconds = 300
): Promise<string> {
  const {
    data,
    error,
  } =
    await supabase.storage
      .from(
        FITNESS_OS_PRIVATE_BUCKET
      )
      .createSignedUrl(
        storagePath,
        expiresInSeconds
      );

  if (error) {
    throw error;
  }

  return data.signedUrl;
}


// ============================================================
// Delete Private File
// ============================================================

export async function deletePrivateFile(
  storagePath: string
): Promise<void> {
  const {
    error,
  } =
    await supabase.storage
      .from(
        FITNESS_OS_PRIVATE_BUCKET
      )
      .remove([
        storagePath,
      ]);

  if (error) {
    throw error;
  }
}


// ============================================================
// Delete Multiple Private Files
// ============================================================

export async function deletePrivateFiles(
  storagePaths: string[]
): Promise<void> {
  if (
    storagePaths.length ===
    0
  ) {
    return;
  }

  const {
    error,
  } =
    await supabase.storage
      .from(
        FITNESS_OS_PRIVATE_BUCKET
      )
      .remove(
        storagePaths
      );

  if (error) {
    throw error;
  }
}
