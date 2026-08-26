"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Eye,
  ImagePlus,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  useProgressCheckIns,
} from "../hooks/useProgressCheckIns";

import {
  useBodyCompositionGoals,
} from "../hooks/useBodyCompositionGoals";

import {
  useBodyCompositionTrends,
} from "../hooks/useBodyCompositionTrends";

import {
  useBodyCompositionGoalProgress,
} from "../hooks/useBodyCompositionGoalProgress";

import type {
  BodyMeasurement,
  ProgressCheckIn,
  ProgressPhotoReference,
  ProgressPhotoView,
} from "../bodyCompositionTypes";


// ============================================================
// Types
// ============================================================

interface CheckInFormState {
  date:
    string;

  notes:
    string;
}


type PhotoFileState =
  Partial<
    Record<
      ProgressPhotoView,
      File
    >
  >;


// ============================================================
// Constants
// ============================================================

const PHOTO_VIEWS:
  ProgressPhotoView[] = [
    "Front",
    "Side",
    "Back",
  ];


// ============================================================
// Helpers
// ============================================================

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


function formatDisplayDate(
  date: string
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month:
        "short",

      day:
        "numeric",

      year:
        "numeric",
    }
  ).format(
    new Date(
      `${date}T12:00:00`
    )
  );
}


function createEmptyForm():
CheckInFormState {
  return {
    date:
      formatLocalDate(
        new Date()
      ),

    notes:
      "",
  };
}


function createFormFromCheckIn(
  checkIn:
    ProgressCheckIn
):
CheckInFormState {
  return {
    date:
      checkIn.date,

    notes:
      checkIn.notes ??
      "",
  };
}


function calculateChange(
  current:
    number |
    undefined,
  previous:
    number |
    undefined
) {
  if (
    current ===
      undefined ||
    previous ===
      undefined
  ) {
    return undefined;
  }

  return (
    current -
    previous
  );
}


function formatSignedChange(
  value:
    number |
    undefined,
  unit:
    string
) {
  if (
    value ===
    undefined
  ) {
    return "—";
  }

  const rounded =
    Math.round(
      value * 10
    ) / 10;

  return `${rounded > 0 ? "+" : ""}${rounded} ${unit}`;
}


function formatGoalStatus(
  status:
    string
) {
  switch (
    status
  ) {
    case "OnTrack":
      return "On track";

    case "SlowerThanExpected":
      return "Slower than expected";

    case "FasterThanExpected":
      return "Faster than expected";

    case "Plateau":
      return "Possible plateau";

    case "MovingAwayFromGoal":
      return "Moving away from goal";

    default:
      return "Not enough data";
  }
}


// ============================================================
// Component
// ============================================================

export default function WeeklyProgressCheckIn() {
  const {
    loaded,
    user,
    checkIns,
    measurements,
    checkInsWithMeasurements,
    addProgressCheckIn,
    updateProgressCheckIn,
    deleteProgressCheckIn,
    openProgressPhoto,
  } =
    useProgressCheckIns();

  const {
    currentGoal,
  } =
    useBodyCompositionGoals();

  const {
    weightTrend,
    weightTrendSummary,
  } =
    useBodyCompositionTrends(
      measurements
    );

  const goalProgress =
    useBodyCompositionGoalProgress(
      currentGoal,
      weightTrend
    );

  const [
    formOpen,
    setFormOpen,
  ] =
    useState(false);

  const [
    editingId,
    setEditingId,
  ] =
    useState<
      string |
      null
    >(
      null
    );

  const [
    form,
    setForm,
  ] =
    useState<
      CheckInFormState
    >(
      createEmptyForm
    );

  const [
    photoFiles,
    setPhotoFiles,
  ] =
    useState<
      PhotoFileState
    >({});

  const [
    removedPhotoViews,
    setRemovedPhotoViews,
  ] =
    useState<
      ProgressPhotoView[]
    >([]);

  const [
    validationMessage,
    setValidationMessage,
  ] =
    useState<
      string |
      null
    >(
      null
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);


  const editingCheckIn =
    editingId
      ? checkIns.find(
          (
            checkIn
          ) =>
            checkIn.id ===
            editingId
        ) ??
        null
      : null;


  const previousById =
    useMemo(
      () => {
        const chronological =
          [
            ...checkInsWithMeasurements,
          ].sort(
            (
              a,
              b
            ) =>
              a.checkIn.date.localeCompare(
                b.checkIn.date
              ) ||
              a.checkIn.createdAt.localeCompare(
                b.checkIn.createdAt
              )
          );

        const map =
          new Map<
            string,
            | (typeof chronological)[number]
            | null
          >();

        chronological.forEach(
          (
            entry,
            index
          ) => {
            map.set(
              entry.checkIn.id,
              index >
                0
                ? chronological[
                    index - 1
                  ]
                : null
            );
          }
        );

        return map;
      },
      [
        checkInsWithMeasurements,
      ]
    );


  // ----------------------------------------------------------
  // Form
  // ----------------------------------------------------------

  function resetPhotoEdits() {
    setPhotoFiles(
      {}
    );

    setRemovedPhotoViews(
      []
    );
  }


  function beginAdd() {
    setEditingId(
      null
    );

    setForm(
      createEmptyForm()
    );

    resetPhotoEdits();

    setValidationMessage(
      null
    );

    setFormOpen(
      true
    );
  }


  function beginEdit(
    checkIn:
      ProgressCheckIn
  ) {
    setEditingId(
      checkIn.id
    );

    setForm(
      createFormFromCheckIn(
        checkIn
      )
    );

    resetPhotoEdits();

    setValidationMessage(
      null
    );

    setFormOpen(
      true
    );
  }


  function cancelForm() {
    setFormOpen(
      false
    );

    setEditingId(
      null
    );

    resetPhotoEdits();

    setValidationMessage(
      null
    );
  }


  function selectPhoto(
    view:
      ProgressPhotoView,
    file:
      File |
      null
  ) {
    setPhotoFiles(
      (
        current
      ) => {
        const next = {
          ...current,
        };

        if (
          file
        ) {
          next[view] =
            file;
        } else {
          delete next[
            view
          ];
        }

        return next;
      }
    );

    if (
      file
    ) {
      setRemovedPhotoViews(
        (
          current
        ) =>
          current.filter(
            (
              existingView
            ) =>
              existingView !==
              view
          )
      );
    }
  }


  function removePhoto(
    view:
      ProgressPhotoView
  ) {
    setPhotoFiles(
      (
        current
      ) => {
        const next = {
          ...current,
        };

        delete next[
          view
        ];

        return next;
      }
    );

    setRemovedPhotoViews(
      (
        current
      ) =>
        current.includes(
          view
        )
          ? current
          : [
              ...current,
              view,
            ]
    );
  }


  async function saveCheckIn() {
    if (
      !form.date
    ) {
      setValidationMessage(
        "Choose a date for the weekly check-in."
      );

      return;
    }

    const hasNewPhotos =
      Object.keys(
        photoFiles
      ).length >
      0;

    if (
      hasNewPhotos &&
      !user
    ) {
      setValidationMessage(
        "Sign in before uploading progress photos."
      );

      return;
    }

    const input = {
      date:
        form.date,

      notes:
        form.notes.trim() !==
        ""
          ? form.notes.trim()
          : undefined,
    };

    setSaving(
      true
    );

    setValidationMessage(
      null
    );

    try {
      if (
        editingId
      ) {
        await updateProgressCheckIn(
          editingId,
          input,
          {
            files:
              photoFiles,

            removeViews:
              removedPhotoViews,
          }
        );
      } else {
        await addProgressCheckIn(
          input,
          photoFiles
        );
      }

      setFormOpen(
        false
      );

      setEditingId(
        null
      );

      resetPhotoEdits();
    } catch (
      error
    ) {
      console.error(
        "Weekly progress check-in save failed:",
        error
      );

      setValidationMessage(
        "The check-in could not be saved. Existing check-in data was preserved, and any newly uploaded photo files were cleaned up when possible."
      );
    } finally {
      setSaving(
        false
      );
    }
  }


  // ----------------------------------------------------------
  // Loading
  // ----------------------------------------------------------

  if (
    !loaded
  ) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">
          Loading weekly check-ins...
        </p>
      </div>
    );
  }


  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <div className="space-y-4">

      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <div className="flex flex-wrap items-start justify-between gap-4">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Weekly Progress Check-In
            </p>

            <h3 className="mt-1 text-lg font-bold text-slate-900">
              Progress Review
            </h3>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Review your current body-composition trend and capture weekly context.
              Measurements are managed separately in Body Measurements. Optional
              front, side, and back progress photos stay private and attach to the
              check-in.
            </p>
          </div>

          {!formOpen && (
            <button
              type="button"
              onClick={
                beginAdd
              }
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus
                size={
                  16
                }
              />

              Add Check-In
            </button>
          )}

        </div>


        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <SummaryMetric
            label="Check-Ins"
            value={
              String(
                checkIns.length
              )
            }
          />

          <SummaryMetric
            label="7-Day Weight Trend"
            value={
              weightTrendSummary.latestTrendWeightLb !==
              undefined
                ? `${weightTrendSummary.latestTrendWeightLb} lb`
                : "Not enough data"
            }
          />

          <SummaryMetric
            label="Observed Rate"
            value={
              goalProgress.observedWeeklyWeightChangeLb !==
              undefined
                ? `${goalProgress.observedWeeklyWeightChangeLb > 0 ? "+" : ""}${goalProgress.observedWeeklyWeightChangeLb} lb / week`
                : "Not enough data"
            }
          />

          <SummaryMetric
            label="Goal Status"
            value={
              formatGoalStatus(
                goalProgress.status
              )
            }
          />

        </div>

      </div>


      {formOpen && (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            {editingId
              ? "Edit Weekly Check-In"
              : "New Weekly Check-In"}
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-900">
            Weekly Snapshot
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Choose the review date, add optional progress photos, and record any
            useful weekly context. Measurements remain in Body Measurements.
          </p>


          <div className="mt-5 space-y-5">

            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Date
              </span>

              <input
                type="date"
                value={
                  form.date
                }
                onChange={
                  (
                    event
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,

                        date:
                          event.target.value,
                      })
                    )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"
              />
            </label>


            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Measurement Data
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-700">
                The preferred Body Measurement recorded on the same date will
                appear in check-in history automatically. Manual measurements are
                preferred, followed by Home Scale records, while DEXA remains a
                distinct measurement source.
              </p>
            </div>


            <div>

              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Progress Photos
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Optional. Add any combination of front, side, and back photos.
                    Files are stored in private authenticated storage.
                  </p>
                </div>
              </div>


              <div className="mt-3 grid gap-3 md:grid-cols-3">

                {PHOTO_VIEWS.map(
                  (
                    view
                  ) => {
                    const existingPhoto =
                      editingCheckIn?.photos?.find(
                        (
                          photo
                        ) =>
                          photo.view ===
                          view
                      ) ??
                      null;

                    const selectedFile =
                      photoFiles[
                        view
                      ];

                    const markedForRemoval =
                      removedPhotoViews.includes(
                        view
                      );

                    return (
                      <PhotoEditorCard
                        key={
                          view
                        }
                        view={
                          view
                        }
                        existingPhoto={
                          existingPhoto
                        }
                        selectedFile={
                          selectedFile
                        }
                        markedForRemoval={
                          markedForRemoval
                        }
                        onSelect={
                          (
                            file
                          ) =>
                            selectPhoto(
                              view,
                              file
                            )
                        }
                        onRemove={
                          () =>
                            removePhoto(
                              view
                            )
                        }
                        onRestore={
                          () =>
                            setRemovedPhotoViews(
                              (
                                current
                              ) =>
                                current.filter(
                                  (
                                    existingView
                                  ) =>
                                    existingView !==
                                    view
                                )
                            )
                        }
                        onOpen={
                          existingPhoto
                            ? async () => {
                                try {
                                  await openProgressPhoto(
                                    existingPhoto
                                  );
                                } catch (
                                  error
                                ) {
                                  console.error(
                                    "Progress photo open failed:",
                                    error
                                  );

                                  window.alert(
                                    "This progress photo could not be opened. The weekly check-in and its other data are still available."
                                  );
                                }
                              }
                            : undefined
                        }
                      />
                    );
                  }
                )}

              </div>

            </div>


            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Notes
              </span>

              <textarea
                value={
                  form.notes
                }
                onChange={
                  (
                    event
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,

                        notes:
                          event.target.value,
                      })
                    )
                }
                rows={
                  4
                }
                placeholder="Optional weekly context — training, nutrition, travel, routine changes, or anything else that helps explain the week."
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"
              />
            </label>


            {validationMessage && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm font-medium text-amber-800">
                  {validationMessage}
                </p>
              </div>
            )}


            <div className="flex flex-wrap justify-end gap-3">

              <button
                type="button"
                onClick={
                  cancelForm
                }
                disabled={
                  saving
                }
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  saveCheckIn
                }
                disabled={
                  saving
                }
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Save Check-In"}
              </button>

            </div>

          </div>

        </div>
      )}


      {checkInsWithMeasurements.length >
      0 ? (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">

          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Check-In History
          </p>


          <div className="mt-4 space-y-3">

            {checkInsWithMeasurements.map(
              (
                entry
              ) => (
                <CheckInHistoryItem
                  key={
                    entry.checkIn.id
                  }
                  checkIn={
                    entry.checkIn
                  }
                  measurement={
                    entry.measurement
                  }
                  previous={
                    previousById.get(
                      entry.checkIn.id
                    ) ??
                    null
                  }
                  onEdit={
                    () =>
                      beginEdit(
                        entry.checkIn
                      )
                  }
                  onOpenPhoto={
                    async (
                      photo
                    ) => {
                      try {
                        await openProgressPhoto(
                          photo
                        );
                      } catch (
                        error
                      ) {
                        console.error(
                          "Progress photo open failed:",
                          error
                        );

                        window.alert(
                          "This progress photo could not be opened. The weekly check-in and its other data are still available."
                        );
                      }
                    }
                  }
                  onDelete={
                    async () => {
                      const photoCount =
                        entry.checkIn.photos?.length ??
                        0;

                      const confirmed =
                        window.confirm(
                          photoCount >
                          0
                            ? `Delete the weekly check-in from ${formatDisplayDate(
                                entry.checkIn.date
                              )}? Its ${photoCount} attached progress photo${photoCount === 1 ? "" : "s"} will also be removed. Body Measurements from that date will not be deleted.`
                            : `Delete the weekly check-in from ${formatDisplayDate(
                                entry.checkIn.date
                              )}? Body Measurements from that date will not be deleted.`
                        );

                      if (
                        !confirmed
                      ) {
                        return;
                      }

                      try {
                        await deleteProgressCheckIn(
                          entry.checkIn.id
                        );
                      } catch (
                        error
                      ) {
                        console.error(
                          "Weekly progress check-in deletion failed:",
                          error
                        );

                        window.alert(
                          "The check-in could not be fully deleted. If progress-photo cleanup failed, the structured check-in was left intact so you can retry."
                        );
                      }
                    }
                  }
                />
              )
            )}

          </div>

        </div>
      ) : (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">

          <p className="text-sm font-semibold text-slate-900">
            No weekly check-ins yet
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Add a check-in when you want a weekly progress review. Existing
            Body Measurements will be referenced automatically, and progress
            photos are optional.
          </p>

        </div>
      )}

    </div>
  );
}


// ============================================================
// Photo Editor
// ============================================================

function PhotoEditorCard({
  view,
  existingPhoto,
  selectedFile,
  markedForRemoval,
  onSelect,
  onRemove,
  onRestore,
  onOpen,
}: {
  view:
    ProgressPhotoView;

  existingPhoto:
    ProgressPhotoReference |
    null;

  selectedFile:
    File |
    undefined;

  markedForRemoval:
    boolean;

  onSelect:
    (
      file:
        File |
        null
    ) => void;

  onRemove:
    () => void;

  onRestore:
    () => void;

  onOpen?:
    () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">

      <div className="flex items-center justify-between gap-2">

        <p className="font-semibold text-slate-900">
          {view}
        </p>

        {existingPhoto &&
          !markedForRemoval && (
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
            Saved
          </span>
        )}

      </div>


      {markedForRemoval ? (
        <div className="mt-3">

          <p className="text-sm font-medium text-red-700">
            Photo will be removed
          </p>

          <button
            type="button"
            onClick={
              onRestore
            }
            className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Keep existing photo
          </button>

        </div>
      ) : (
        <>
          {selectedFile ? (
            <div className="mt-3">

              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                New Photo
              </p>

              <p className="mt-1 break-all text-sm text-slate-700">
                {selectedFile.name}
              </p>

              {existingPhoto && (
                <p className="mt-1 text-xs text-slate-500">
                  This will replace the saved {view.toLowerCase()} photo.
                </p>
              )}

            </div>
          ) : existingPhoto ? (
            <div className="mt-3">

              <p className="break-all text-sm text-slate-700">
                {existingPhoto.fileName}
              </p>

              <button
                type="button"
                onClick={
                  onOpen
                }
                className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                <Eye
                  size={
                    15
                  }
                />

                View Photo
              </button>

            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              No photo selected.
            </p>
          )}


          <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">

            <ImagePlus
              size={
                15
              }
            />

            {existingPhoto
              ? "Replace"
              : "Choose Photo"}

            <input
              type="file"
              accept="image/*"
              onChange={
                (
                  event
                ) =>
                  onSelect(
                    event.target.files?.[
                      0
                    ] ??
                    null
                  )
              }
              className="sr-only"
            />

          </label>


          {(existingPhoto ||
            selectedFile) && (
            <button
              type="button"
              onClick={
                selectedFile &&
                !existingPhoto
                  ? () =>
                      onSelect(
                        null
                      )
                  : onRemove
              }
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              {selectedFile &&
              !existingPhoto ? (
                <X
                  size={
                    15
                  }
                />
              ) : (
                <Trash2
                  size={
                    15
                  }
                />
              )}

              {selectedFile &&
              !existingPhoto
                ? "Clear Selection"
                : "Remove Photo"}
            </button>
          )}

        </>
      )}

    </div>
  );
}


// ============================================================
// Summary Metric
// ============================================================

function SummaryMetric({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}


// ============================================================
// History
// ============================================================

function CheckInHistoryItem({
  checkIn,
  measurement,
  previous,
  onEdit,
  onOpenPhoto,
  onDelete,
}: {
  checkIn:
    ProgressCheckIn;

  measurement:
    BodyMeasurement |
    null;

  previous:
    {
      checkIn:
        ProgressCheckIn;

      measurement:
        BodyMeasurement |
        null;
    } |
    null;

  onEdit:
    () => void;

  onOpenPhoto:
    (
      photo:
        ProgressPhotoReference
    ) => void;

  onDelete:
    () => void;
}) {
  const previousMeasurement =
    previous?.measurement ??
    null;

  const weightChange =
    calculateChange(
      measurement?.weightLb,
      previousMeasurement?.weightLb
    );

  const waistChange =
    calculateChange(
      measurement?.waistIn,
      previousMeasurement?.waistIn
    );

  const bodyFatChange =
    calculateChange(
      measurement?.bodyFatPercent,
      previousMeasurement?.bodyFatPercent
    );

  const photos =
    checkIn.photos ??
    [];


  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div>
          <p className="font-semibold text-slate-900">
            {formatDisplayDate(
              checkIn.date
            )}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Weekly check-in
          </p>
        </div>


        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={
              onEdit
            }
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Pencil
              size={
                15
              }
            />

            Edit
          </button>

          <button
            type="button"
            onClick={
              onDelete
            }
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <Trash2
              size={
                15
              }
            />

            Delete
          </button>

        </div>

      </div>


      {measurement ? (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-2">

            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
              {measurement.source}
            </span>

            <span className="text-xs text-slate-500">
              Body Measurement from the same date
            </span>

          </div>


          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">

            <HistoryMetric
              label="Weight"
              value={
                measurement.weightLb
              }
              unit="lb"
              change={
                formatSignedChange(
                  weightChange,
                  "lb"
                )
              }
            />

            <HistoryMetric
              label="Waist"
              value={
                measurement.waistIn
              }
              unit="in"
              change={
                formatSignedChange(
                  waistChange,
                  "in"
                )
              }
            />

            <HistoryMetric
              label="Body Fat"
              value={
                measurement.bodyFatPercent
              }
              unit="%"
              change={
                formatSignedChange(
                  bodyFatChange,
                  "%"
                )
              }
            />

          </div>
        </>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-4">

          <p className="text-sm font-semibold text-slate-700">
            No Body Measurement recorded on this date
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Add or edit a record in Body Measurements using this same date
            and it will appear here automatically.
          </p>

        </div>
      )}


      <div className="mt-4 border-t border-slate-200 pt-4">

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Progress Photos
        </p>

        {photos.length >
        0 ? (
          <div className="mt-2 flex flex-wrap gap-2">

            {PHOTO_VIEWS.map(
              (
                view
              ) => {
                const photo =
                  photos.find(
                    (
                      candidate
                    ) =>
                      candidate.view ===
                      view
                  );

                if (
                  !photo
                ) {
                  return null;
                }

                return (
                  <button
                    key={
                      photo.id
                    }
                    type="button"
                    onClick={
                      () =>
                        onOpenPhoto(
                          photo
                        )
                    }
                    className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Eye
                      size={
                        15
                      }
                    />

                    {view}
                  </button>
                );
              }
            )}

          </div>
        ) : (
          <p className="mt-1 text-sm text-slate-500">
            No progress photos attached.
          </p>
        )}

      </div>


      {checkIn.notes && (
        <div className="mt-4 border-t border-slate-200 pt-4">

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Notes
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-700">
            {checkIn.notes}
          </p>

        </div>
      )}

    </div>
  );
}


// ============================================================
// History Metric
// ============================================================

function HistoryMetric({
  label,
  value,
  unit,
  change,
}: {
  label:
    string;

  value:
    number |
    undefined;

  unit:
    string;

  change:
    string;
}) {
  return (
    <div>

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-900">
        {value !==
        undefined
          ? `${value} ${unit}`
          : "—"}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        Change: {change}
      </p>

    </div>
  );
}
