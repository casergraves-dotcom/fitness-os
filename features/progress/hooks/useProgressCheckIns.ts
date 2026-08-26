"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useAuth,
} from "@/features/auth";

import {
  createPrivateFileSignedUrl,
  deletePrivateFiles,
  getProgressPhotoStoragePath,
  uploadPrivateFile,
} from "@/lib/storage/privateFileStorage";

import {
  readBodyMeasurements,
  readProgressCheckIns,
  subscribeToBodyMeasurements,
  writeProgressCheckIns,
} from "../bodyCompositionStorage";

import type {
  BodyMeasurement,
  ProgressCheckIn,
  ProgressPhotoReference,
  ProgressPhotoView,
} from "../bodyCompositionTypes";


// ============================================================
// Types
// ============================================================

export interface ProgressCheckInInput {
  date?: string;

  notes?: string;
}


export type ProgressPhotoFiles =
  Partial<
    Record<
      ProgressPhotoView,
      File
    >
  >;


export interface ProgressPhotoChanges {
  files?:
    ProgressPhotoFiles;

  removeViews?:
    ProgressPhotoView[];
}


export interface ProgressCheckInWithMeasurement {
  checkIn:
    ProgressCheckIn;

  measurement:
    BodyMeasurement |
    null;
}


// ============================================================
// Helpers
// ============================================================

const PROGRESS_PHOTO_VIEWS:
  ProgressPhotoView[] = [
    "Front",
    "Side",
    "Back",
  ];


function createId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}


function formatLocalDate(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}


function sortCheckIns(
  checkIns:
    ProgressCheckIn[]
) {
  return [
    ...checkIns,
  ].sort(
    (
      a,
      b
    ) => {
      const dateComparison =
        b.date.localeCompare(
          a.date
        );

      if (
        dateComparison !==
        0
      ) {
        return dateComparison;
      }

      return (
        new Date(
          b.createdAt
        ).getTime() -
        new Date(
          a.createdAt
        ).getTime()
      );
    }
  );
}


function sortMeasurements(
  measurements:
    BodyMeasurement[]
) {
  return [
    ...measurements,
  ].sort(
    (
      a,
      b
    ) => {
      const dateComparison =
        b.date.localeCompare(
          a.date
        );

      if (
        dateComparison !==
        0
      ) {
        return dateComparison;
      }

      return (
        new Date(
          b.createdAt
        ).getTime() -
        new Date(
          a.createdAt
        ).getTime()
      );
    }
  );
}


function measurementPriority(
  measurement:
    BodyMeasurement
) {
  switch (
    measurement.source
  ) {
    case "Manual":
      return 0;

    case "HomeScale":
      return 1;

    case "DEXA":
      return 2;

    default:
      return 3;
  }
}


function resolveMeasurementForCheckIn(
  checkIn:
    ProgressCheckIn,
  measurements:
    BodyMeasurement[]
) {
  if (
    checkIn.measurementId
  ) {
    const legacyLinkedMeasurement =
      measurements.find(
        (
          measurement
        ) =>
          measurement.id ===
          checkIn.measurementId
      );

    if (
      legacyLinkedMeasurement
    ) {
      return legacyLinkedMeasurement;
    }
  }

  const sameDateMeasurements =
    measurements
      .filter(
        (
          measurement
        ) =>
          measurement.date ===
          checkIn.date
      )
      .sort(
        (
          a,
          b
        ) => {
          const priorityDifference =
            measurementPriority(
              a
            ) -
            measurementPriority(
              b
            );

          if (
            priorityDifference !==
            0
          ) {
            return priorityDifference;
          }

          return (
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
          );
        }
      );

  return (
    sameDateMeasurements[0] ??
    null
  );
}


function getFileExtension(
  file:
    File
) {
  const lastDot =
    file.name.lastIndexOf(
      "."
    );

  if (
    lastDot >=
      0 &&
    lastDot <
      file.name.length -
      1
  ) {
    const extension =
      file.name
        .slice(
          lastDot + 1
        )
        .toLowerCase()
        .replace(
          /[^a-z0-9]/g,
          ""
        )
        .slice(
          0,
          10
        );

    if (
      extension
    ) {
      return extension;
    }
  }

  switch (
    file.type
  ) {
    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    case "image/gif":
      return "gif";

    case "image/heic":
    case "image/heif":
      return "heic";

    default:
      return "jpg";
  }
}


function sortPhotos(
  photos:
    ProgressPhotoReference[]
) {
  return [
    ...photos,
  ].sort(
    (
      a,
      b
    ) =>
      PROGRESS_PHOTO_VIEWS.indexOf(
        a.view
      ) -
      PROGRESS_PHOTO_VIEWS.indexOf(
        b.view
      )
  );
}


// ============================================================
// Hook
// ============================================================

export function useProgressCheckIns() {
  const {
    user,
    loaded:
      authLoaded,
  } =
    useAuth();

  const [
    checkIns,
    setCheckIns,
  ] =
    useState<
      ProgressCheckIn[]
    >([]);

  const [
    measurements,
    setMeasurements,
  ] =
    useState<
      BodyMeasurement[]
    >([]);

  const [
    loaded,
    setLoaded,
  ] =
    useState(false);


  // ----------------------------------------------------------
  // Load / Synchronize
  // ----------------------------------------------------------

  useEffect(() => {
    setCheckIns(
      sortCheckIns(
        readProgressCheckIns()
      )
    );

    const refreshMeasurements =
      () => {
        setMeasurements(
          sortMeasurements(
            readBodyMeasurements()
          )
        );
      };

    refreshMeasurements();

    setLoaded(
      true
    );

    return subscribeToBodyMeasurements(
      refreshMeasurements
    );
  }, []);


  // ----------------------------------------------------------
  // Derived Data
  // ----------------------------------------------------------

  const latestCheckIn =
    useMemo(
      () =>
        checkIns[0] ??
        null,
      [
        checkIns,
      ]
    );


  const checkInsWithMeasurements =
    useMemo(
      () =>
        checkIns.map(
          (
            checkIn
          ) => ({
            checkIn,

            measurement:
              resolveMeasurementForCheckIn(
                checkIn,
                measurements
              ),
          })
        ),
      [
        checkIns,
        measurements,
      ]
    );


  function getMeasurementForCheckIn(
    checkIn:
      ProgressCheckIn
  ) {
    return resolveMeasurementForCheckIn(
      checkIn,
      measurements
    );
  }


  // ----------------------------------------------------------
  // Upload Photo Set
  // ----------------------------------------------------------

  async function uploadPhotoFiles(
    checkInId:
      string,
    files:
      ProgressPhotoFiles
  ) {
    const viewsWithFiles =
      PROGRESS_PHOTO_VIEWS.filter(
        (
          view
        ) =>
          files[view] !==
          undefined
      );

    if (
      viewsWithFiles.length ===
      0
    ) {
      return {
        photos:
          [] as ProgressPhotoReference[],

        storagePaths:
          [] as string[],
      };
    }

    if (
      !user
    ) {
      throw new Error(
        "Sign in before uploading progress photos."
      );
    }

    const uploadedPhotos:
      ProgressPhotoReference[] = [];

    const uploadedStoragePaths:
      string[] = [];

    try {
      for (
        const view
        of viewsWithFiles
      ) {
        const file =
          files[view];

        if (
          !file
        ) {
          continue;
        }

        const photoId =
          createId();

        const storagePath =
          getProgressPhotoStoragePath(
            user.id,
            checkInId,
            photoId,
            view,
            getFileExtension(
              file
            )
          );

        await uploadPrivateFile(
          storagePath,
          file
        );

        uploadedStoragePaths.push(
          storagePath
        );

        uploadedPhotos.push({
          id:
            photoId,

          view,

          storagePath,

          fileName:
            file.name,

          contentType:
            file.type ||
            "application/octet-stream",

          uploadedAt:
            new Date()
              .toISOString(),
        });
      }

      return {
        photos:
          sortPhotos(
            uploadedPhotos
          ),

        storagePaths:
          uploadedStoragePaths,
      };
    } catch (
      error
    ) {
      if (
        uploadedStoragePaths.length >
        0
      ) {
        try {
          await deletePrivateFiles(
            uploadedStoragePaths
          );
        } catch (
          cleanupError
        ) {
          console.error(
            "Fitness OS could not clean up partially uploaded progress photos:",
            cleanupError
          );
        }
      }

      throw error;
    }
  }


  // ----------------------------------------------------------
  // Add Check-In
  // ----------------------------------------------------------

  async function addProgressCheckIn(
    input:
      ProgressCheckInInput,
    photoFiles:
      ProgressPhotoFiles = {}
  ) {
    const now =
      new Date()
        .toISOString();

    const id =
      createId();

    let uploadedStoragePaths:
      string[] = [];

    try {
      const uploaded =
        await uploadPhotoFiles(
          id,
          photoFiles
        );

      uploadedStoragePaths =
        uploaded.storagePaths;

      const checkIn:
        ProgressCheckIn = {
        id,

        date:
          input.date ??
          formatLocalDate(
            new Date()
          ),

        photos:
          uploaded.photos.length >
          0
            ? uploaded.photos
            : undefined,

        notes:
          input.notes,

        createdAt:
          now,

        updatedAt:
          now,
      };

      const previousCheckIns =
        readProgressCheckIns();

      const updatedCheckIns =
        sortCheckIns([
          checkIn,
          ...previousCheckIns,
        ]);

      try {
        writeProgressCheckIns(
          updatedCheckIns
        );
      } catch (
        error
      ) {
        if (
          uploadedStoragePaths.length >
          0
        ) {
          try {
            await deletePrivateFiles(
              uploadedStoragePaths
            );
          } catch (
            cleanupError
          ) {
            console.error(
              "Fitness OS could not clean up uploaded progress photos after a failed check-in save:",
              cleanupError
            );
          }
        }

        throw error;
      }

      setCheckIns(
        updatedCheckIns
      );

      return checkIn;
    } catch (
      error
    ) {
      throw error;
    }
  }


  // ----------------------------------------------------------
  // Update Check-In
  // ----------------------------------------------------------

  async function updateProgressCheckIn(
    id:
      string,
    input:
      ProgressCheckInInput,
    photoChanges:
      ProgressPhotoChanges = {}
  ) {
    const existingCheckIn =
      checkIns.find(
        (
          checkIn
        ) =>
          checkIn.id ===
          id
      );

    if (
      !existingCheckIn
    ) {
      return null;
    }

    const existingPhotos =
      existingCheckIn.photos ??
      [];

    const replacementViews =
      PROGRESS_PHOTO_VIEWS.filter(
        (
          view
        ) =>
          photoChanges.files?.[
            view
          ] !==
          undefined
      );

    const removeViews =
      new Set<
        ProgressPhotoView
      >([
        ...(
          photoChanges.removeViews ??
          []
        ),
        ...replacementViews,
      ]);

    const photosToRemove =
      existingPhotos.filter(
        (
          photo
        ) =>
          removeViews.has(
            photo.view
          )
      );

    const uploaded =
      await uploadPhotoFiles(
        id,
        photoChanges.files ??
        {}
      );

    const retainedPhotos =
      existingPhotos.filter(
        (
          photo
        ) =>
          !removeViews.has(
            photo.view
          )
      );

    const nextPhotos =
      sortPhotos([
        ...retainedPhotos,
        ...uploaded.photos,
      ]);

    const updatedCheckIn:
      ProgressCheckIn = {
      ...existingCheckIn,

      date:
        input.date ??
        existingCheckIn.date,

      photos:
        nextPhotos.length >
        0
          ? nextPhotos
          : undefined,

      notes:
        input.notes,

      updatedAt:
        new Date()
          .toISOString(),
    };

    const previousCheckIns =
      readProgressCheckIns();

    const updatedCheckIns =
      sortCheckIns(
        previousCheckIns.map(
          (
            checkIn
          ) =>
            checkIn.id ===
            id
              ? updatedCheckIn
              : checkIn
        )
      );

    try {
      writeProgressCheckIns(
        updatedCheckIns
      );
    } catch (
      error
    ) {
      if (
        uploaded.storagePaths.length >
        0
      ) {
        try {
          await deletePrivateFiles(
            uploaded.storagePaths
          );
        } catch (
          cleanupError
        ) {
          console.error(
            "Fitness OS could not clean up replacement progress photos after a failed check-in update:",
            cleanupError
          );
        }
      }

      throw error;
    }

    setCheckIns(
      updatedCheckIns
    );

    if (
      photosToRemove.length >
      0
    ) {
      try {
        await deletePrivateFiles(
          photosToRemove.map(
            (
              photo
            ) =>
              photo.storagePath
          )
        );
      } catch (
        cleanupError
      ) {
        console.error(
          "Fitness OS saved the updated check-in but could not remove one or more superseded progress-photo files:",
          cleanupError
        );
      }
    }

    return updatedCheckIn;
  }


  // ----------------------------------------------------------
  // Delete Check-In
  // ----------------------------------------------------------

  async function deleteProgressCheckIn(
    id:
      string
  ) {
    const existingCheckIn =
      checkIns.find(
        (
          checkIn
        ) =>
          checkIn.id ===
          id
      );

    if (
      !existingCheckIn
    ) {
      return;
    }

    const photoPaths =
      (
        existingCheckIn.photos ??
        []
      ).map(
        (
          photo
        ) =>
          photo.storagePath
      );

    // Delete private files first. If storage cleanup fails, leave
    // the structured check-in intact so the user can retry.
    if (
      photoPaths.length >
      0
    ) {
      await deletePrivateFiles(
        photoPaths
      );
    }

    const previousCheckIns =
      readProgressCheckIns();

    const updatedCheckIns =
      sortCheckIns(
        previousCheckIns.filter(
          (
            checkIn
          ) =>
            checkIn.id !==
            id
        )
      );

    try {
      writeProgressCheckIns(
        updatedCheckIns
      );
    } catch (
      error
    ) {
      // The check-in remains recoverable as structured data even if
      // its optional photo files were already removed.
      try {
        writeProgressCheckIns(
          previousCheckIns
        );
      } catch (
        restoreError
      ) {
        console.error(
          "Fitness OS could not restore the previous check-in collection after a failed delete:",
          restoreError
        );
      }

      throw error;
    }

    setCheckIns(
      updatedCheckIns
    );
  }


  // ----------------------------------------------------------
  // Open Progress Photo
  // ----------------------------------------------------------

  async function openProgressPhoto(
    photo:
      ProgressPhotoReference
  ) {
    const url =
      await createPrivateFileSignedUrl(
        photo.storagePath
      );

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }


  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------

  return {
    loaded:
      loaded &&
      authLoaded,

    user,

    checkIns,

    measurements,

    latestCheckIn,

    checkInsWithMeasurements,

    getMeasurementForCheckIn,

    addProgressCheckIn,

    updateProgressCheckIn,

    deleteProgressCheckIn,

    openProgressPhoto,
  };
}
