"use client";

import {
  Eye,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useProgressCheckIns,
} from "../hooks/useProgressCheckIns";

import type {
  ProgressCheckIn,
  ProgressPhotoReference,
  ProgressPhotoView,
} from "../bodyCompositionTypes";


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

function formatDisplayDate(
  date:
    string
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


function getPhotoForView(
  checkIn:
    ProgressCheckIn |
    undefined,
  view:
    ProgressPhotoView
) {
  return (
    checkIn?.photos?.find(
      (
        photo
      ) =>
        photo.view ===
        view
    ) ??
    null
  );
}


// ============================================================
// Progress Photo Comparison
// ============================================================

export default function ProgressPhotoComparison() {
  const {
    loaded,
    checkIns,
    openProgressPhoto,
  } =
    useProgressCheckIns();


  const photoCheckIns =
    useMemo(
      () =>
        checkIns.filter(
          (
            checkIn
          ) =>
            (
              checkIn.photos?.length ??
              0
            ) >
            0
        ),
      [
        checkIns,
      ]
    );


  const [
    earlierId,
    setEarlierId,
  ] =
    useState(
      ""
    );

  const [
    laterId,
    setLaterId,
  ] =
    useState(
      ""
    );


  const earlierCheckIn =
    photoCheckIns.find(
      (
        checkIn
      ) =>
        checkIn.id ===
        earlierId
    );

  const laterCheckIn =
    photoCheckIns.find(
      (
        checkIn
      ) =>
        checkIn.id ===
        laterId
    );


  if (
    !loaded
  ) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <p className="text-sm text-slate-500">
          Loading progress-photo comparison...
        </p>

      </div>
    );
  }


  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">

      <h3 className="text-lg font-bold text-slate-900">
        Progress Photo Comparison
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Compare the same photo view across two weekly check-in dates.
      </p>


      {photoCheckIns.length <
      2 ? (
        <div className="mt-5 rounded-xl bg-slate-50 p-5 text-center">

          <p className="font-semibold text-slate-700">
            Not enough photo check-ins yet
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Add progress photos to at least two weekly check-ins to enable comparison.
          </p>

        </div>
      ) : (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-2">

            <label className="block">

              <span className="text-sm font-semibold text-slate-800">
                Earlier Check-In
              </span>

              <select
                value={
                  earlierId
                }
                onChange={
                  (
                    event
                  ) =>
                    setEarlierId(
                      event.target.value
                    )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"
              >
                <option value="">
                  Select a check-in
                </option>

                {photoCheckIns.map(
                  (
                    checkIn
                  ) => (
                    <option
                      key={
                        checkIn.id
                      }
                      value={
                        checkIn.id
                      }
                    >
                      {
                        formatDisplayDate(
                          checkIn.date
                        )
                      }
                    </option>
                  )
                )}

              </select>

            </label>


            <label className="block">

              <span className="text-sm font-semibold text-slate-800">
                Later Check-In
              </span>

              <select
                value={
                  laterId
                }
                onChange={
                  (
                    event
                  ) =>
                    setLaterId(
                      event.target.value
                    )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"
              >
                <option value="">
                  Select a check-in
                </option>

                {photoCheckIns.map(
                  (
                    checkIn
                  ) => (
                    <option
                      key={
                        checkIn.id
                      }
                      value={
                        checkIn.id
                      }
                    >
                      {
                        formatDisplayDate(
                          checkIn.date
                        )
                      }
                    </option>
                  )
                )}

              </select>

            </label>

          </div>


          {earlierCheckIn &&
          laterCheckIn ? (
            <div className="mt-5 space-y-4">

              {PHOTO_VIEWS.map(
                (
                  view
                ) => {
                  const earlierPhoto =
                    getPhotoForView(
                      earlierCheckIn,
                      view
                    );

                  const laterPhoto =
                    getPhotoForView(
                      laterCheckIn,
                      view
                    );

                  if (
                    !earlierPhoto &&
                    !laterPhoto
                  ) {
                    return null;
                  }

                  return (
                    <ComparisonRow
                      key={
                        view
                      }
                      view={
                        view
                      }
                      earlierDate={
                        earlierCheckIn.date
                      }
                      laterDate={
                        laterCheckIn.date
                      }
                      earlierPhoto={
                        earlierPhoto
                      }
                      laterPhoto={
                        laterPhoto
                      }
                      onOpen={
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
                              "This progress photo could not be opened."
                            );
                          }
                        }
                      }
                    />
                  );
                }
              )}

            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-slate-50 p-5 text-center">

              <p className="font-semibold text-slate-700">
                Choose two check-ins
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Select an earlier and later check-in to compare available photo views.
              </p>

            </div>
          )}

        </>
      )}

    </div>
  );
}


// ============================================================
// Comparison Row
// ============================================================

function ComparisonRow({
  view,
  earlierDate,
  laterDate,
  earlierPhoto,
  laterPhoto,
  onOpen,
}: {
  view:
    ProgressPhotoView;

  earlierDate:
    string;

  laterDate:
    string;

  earlierPhoto:
    ProgressPhotoReference |
    null;

  laterPhoto:
    ProgressPhotoReference |
    null;

  onOpen:
    (
      photo:
        ProgressPhotoReference
    ) => void;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="font-semibold text-slate-900">
        {view}
      </p>


      <div className="mt-3 grid gap-3 md:grid-cols-2">

        <PhotoComparisonCard
          date={
            earlierDate
          }
          photo={
            earlierPhoto
          }
          onOpen={
            onOpen
          }
        />


        <PhotoComparisonCard
          date={
            laterDate
          }
          photo={
            laterPhoto
          }
          onOpen={
            onOpen
          }
        />

      </div>

    </div>
  );
}


// ============================================================
// Photo Comparison Card
// ============================================================

function PhotoComparisonCard({
  date,
  photo,
  onOpen,
}: {
  date:
    string;

  photo:
    ProgressPhotoReference |
    null;

  onOpen:
    (
      photo:
        ProgressPhotoReference
    ) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">

      <p className="text-sm font-semibold text-slate-800">
        {
          formatDisplayDate(
            date
          )
        }
      </p>


      {photo ? (
        <>
          <p className="mt-2 break-all text-xs text-slate-500">
            {photo.fileName}
          </p>

          <button
            type="button"
            onClick={
              () =>
                onOpen(
                  photo
                )
            }
            className="mt-3 flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Eye
              size={
                15
              }
            />

            View Photo
          </button>
        </>
      ) : (
        <p className="mt-2 text-sm text-slate-500">
          No photo for this view.
        </p>
      )}

    </div>
  );
}