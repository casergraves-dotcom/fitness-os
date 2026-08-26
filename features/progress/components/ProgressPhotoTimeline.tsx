"use client";

import {
  Eye,
} from "lucide-react";

import {
  useProgressCheckIns,
} from "../hooks/useProgressCheckIns";

import type {
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


// ============================================================
// Progress Photo Timeline
// ============================================================

export default function ProgressPhotoTimeline() {
  const {
    loaded,
    checkIns,
    openProgressPhoto,
  } =
    useProgressCheckIns();


  const timelineEntries =
    checkIns
      .filter(
        (
          checkIn
        ) =>
          (
            checkIn.photos?.length ??
            0
          ) >
          0
      )
      .map(
        (
          checkIn
        ) => ({
          id:
            checkIn.id,

          date:
            checkIn.date,

          photos:
            checkIn.photos ??
            [],
        })
      );


  if (
    !loaded
  ) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <p className="text-sm text-slate-500">
          Loading progress photos...
        </p>

      </div>
    );
  }


  if (
    timelineEntries.length ===
    0
  ) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <h3 className="text-lg font-bold text-slate-900">
          Progress Photo Timeline
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Saved weekly progress photos will appear here over time.
        </p>

        <div className="mt-5 rounded-xl bg-slate-50 p-5 text-center">

          <p className="font-semibold text-slate-700">
            No progress photos yet
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Add front, side, or back photos to a weekly check-in to begin the timeline.
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">

      <h3 className="text-lg font-bold text-slate-900">
        Progress Photo Timeline
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Review saved progress photos by weekly check-in date.
      </p>


      <div className="mt-5 space-y-4">

        {timelineEntries.map(
          (
            entry
          ) => (
            <div
              key={
                entry.id
              }
              className="rounded-xl bg-slate-50 p-4"
            >

              <p className="font-semibold text-slate-900">
                {
                  formatDisplayDate(
                    entry.date
                  )
                }
              </p>


              <div className="mt-3 flex flex-wrap gap-2">

                {PHOTO_VIEWS.map(
                  (
                    view
                  ) => {
                    const photo =
                      entry.photos.find(
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
                      <PhotoButton
                        key={
                          photo.id
                        }
                        photo={
                          photo
                        }
                        onOpen={
                          async () => {
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

            </div>
          )
        )}

      </div>

    </div>
  );
}


// ============================================================
// Photo Button
// ============================================================

function PhotoButton({
  photo,
  onOpen,
}: {
  photo:
    ProgressPhotoReference;

  onOpen:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onOpen
      }
      className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
    >

      <Eye
        size={
          15
        }
      />

      {photo.view}

    </button>
  );
}