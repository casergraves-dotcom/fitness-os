"use client";

import {
  useState,
} from "react";

import {
  useLongTermProgressReview,
} from "../hooks/useLongTermProgressReview";

import {
  DEFAULT_PROGRESS_REVIEW_RANGE,
} from "../utils/getProgressReviewPeriod";

import type {
  ProgressReviewRange,
} from "../utils/getProgressReviewPeriod";

import type {
  LongTermProgressReviewObservationType,
} from "../utils/getLongTermProgressReview";


// ============================================================
// Constants
// ============================================================

const REVIEW_RANGES:
  Array<{
    value:
      ProgressReviewRange;

    label:
      string;
  }> = [
    {
      value:
        "4W",

      label:
        "4 weeks",
    },
    {
      value:
        "12W",

      label:
        "12 weeks",
    },
    {
      value:
        "6M",

      label:
        "6 months",
    },
    {
      value:
        "1Y",

      label:
        "1 year",
    },
    {
      value:
        "All",

      label:
        "All history",
    },
  ];


// ============================================================
// Helpers
// ============================================================

function getObservationLabel(
  type:
    LongTermProgressReviewObservationType
) {
  switch (
    type
  ) {
    case "BodyComposition":
      return "Body Composition";

    case "Dexa":
        return "DEXA";

    case "Strength":
      return "Strength";

    case "Running":
      return "Running / Cardio";

    case "Recovery":
      return "Recovery";

    case "Adherence":
      return "Training Adherence";

    case "Milestone":
      return "Milestone";

    case "PersonalRecord":
      return "Strength PR";

    case "ProgressPhoto":
      return "Progress Photos";

    default:
      return "Progress";
  }
}


function formatPeriodDates(
  startDate:
    string | null,
  endDate:
    string
) {
  return startDate
    ? `${startDate} to ${endDate}`
    : `Through ${endDate}`;
}


// ============================================================
// Long-Term Progress Review
// ============================================================

export default function LongTermProgressReview() {
  const [
    range,
    setRange,
  ] =
    useState<
      ProgressReviewRange
    >(
      DEFAULT_PROGRESS_REVIEW_RANGE
    );

  const {
    loaded,
    review,
  } =
    useLongTermProgressReview({
      range,
    });


  // ----------------------------------------------------------
  // Loading
  // ----------------------------------------------------------

  if (!loaded) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <p className="text-sm text-slate-500">
          Building longer-term review...
        </p>

      </div>
    );
  }


  // ----------------------------------------------------------
  // Missing Review
  // ----------------------------------------------------------

  if (!review) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <h3 className="text-lg font-bold text-slate-900">
          Longer-Term Review
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          No longer-term review is available yet.
        </p>

      </div>
    );
  }


  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div>

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Reflect
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-900">
            Longer-Term Review
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {
              review.period
                .label
            }
            {" · "}
            {
              formatPeriodDates(
                review.period
                  .startDate,
                review.period
                  .endDate
              )
            }
          </p>

        </div>


        <label>

          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Review Period
          </span>

          <select
            value={
              range
            }
            onChange={
              (
                event
              ) =>
                setRange(
                  event.target
                    .value as
                    ProgressReviewRange
                )
            }
            className="mt-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5"
          >

            {REVIEW_RANGES.map(
              (
                option
              ) => (
                <option
                  key={
                    option.value
                  }
                  value={
                    option.value
                  }
                >
                  {
                    option.label
                  }
                </option>
              )
            )}

          </select>

        </label>

      </div>


      {/* ====================================================
          Review Observations
      ==================================================== */}

      <div className="mt-6 border-t border-slate-200 pt-5">

        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Period Summary
        </p>

        {review.observations.length >
        0 ? (
          <div className="mt-3 grid gap-3 lg:grid-cols-2">

            {review.observations.map(
              (
                observation,
                index
              ) => (
                <div
                  key={
                    `${observation.type}-${index}`
                  }
                  className="rounded-xl bg-slate-50 p-4"
                >

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {
                      getObservationLabel(
                        observation.type
                      )
                    }
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    {
                      observation.message
                    }
                  </p>

                  {observation.actionHref &&
                  observation.actionLabel && (
                    <a
                      href={
                        observation.actionHref
                      }
                      className="mt-3 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      {
                        observation.actionLabel
                      }
                    </a>
                  )}

                </div>
              )
            )}

          </div>
        ) : (
          <div className="mt-3 rounded-xl bg-slate-50 p-4">

            <p className="font-semibold text-slate-900">
              No meaningful period summary yet
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Fitness OS needs more evidence inside this review period before
              it can summarize longer-term progress.
            </p>

          </div>
        )}

      </div>


      {/* ====================================================
          Data Limitations
      ==================================================== */}

      {review.dataLimitations.length >
        0 && (
        <details className="group mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 marker:hidden">
            <span className="flex items-center justify-between gap-3">
              <span>
                Still learning in {review.dataLimitations.length} {review.dataLimitations.length === 1 ? "area" : "areas"}
              </span>
              <span aria-hidden="true" className="text-slate-500 transition-transform group-open:rotate-180">
                ⌄
              </span>
            </span>
          </summary>

          <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">

            {review.dataLimitations.map(
              (
                limitation
              ) => (
                <p
                  key={
                    limitation
                  }
                  className="text-sm leading-6 text-slate-600"
                >
                  {
                    limitation
                  }
                </p>
              )
            )}

          </div>

        </details>
      )}


      {/* ====================================================
          Scope
      ==================================================== */}

      <details className="group mt-5 border-t border-slate-200 pt-4">
        <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-wide text-slate-500 marker:hidden">
          <span className="flex items-center justify-between gap-3">
            Methodology
            <span aria-hidden="true" className="transition-transform group-open:rotate-180">
              ⌄
            </span>
          </span>
        </summary>

        <div className="mt-3 space-y-1">

        {review.scopeNotes.map(
          (
            note
          ) => (
            <p
              key={
                note
              }
              className="text-xs leading-5 text-slate-500"
            >
              {
                note
              }
            </p>
          )
        )}

        </div>
      </details>

    </div>
  );
}
