"use client";

// ============================================================
// Imports
// ============================================================

import {
  useState,
} from "react";

import {
  useStepTargets,
} from "../hooks/useStepTargets";


// ============================================================
// Helpers
// ============================================================

function formatEffectiveDate(
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


function parseStepTarget(
  value: string
) {
  if (
    value.trim() ===
    ""
  ) {
    return undefined;
  }

  const parsed =
    Number(
      value
    );

  return Number.isFinite(
    parsed
  )
    ? parsed
    : undefined;
}


// ============================================================
// Component
// ============================================================

export default function StepTargets() {
  const {
    loaded,
    history,
    currentTarget,
    addTarget,
  } =
    useStepTargets();

  const [
    editing,
    setEditing,
  ] =
    useState(false);

  const [
    stepTarget,
    setStepTarget,
  ] =
    useState("");

  const [
    effectiveDate,
    setEffectiveDate,
  ] =
    useState("");

  const [
    notes,
    setNotes,
  ] =
    useState("");

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


  // ----------------------------------------------------------
  // Begin Editing
  // ----------------------------------------------------------

  function beginEditing() {
    if (
      currentTarget
    ) {
      setStepTarget(
        String(
          currentTarget.dailyStepTarget
        )
      );

      setNotes(
        currentTarget.notes ??
        ""
      );
    } else {
      setStepTarget(
        ""
      );

      setNotes(
        ""
      );
    }

    setEffectiveDate(
      ""
    );

    setValidationMessage(
      null
    );

    setEditing(
      true
    );
  }


  // ----------------------------------------------------------
  // Save
  // ----------------------------------------------------------

  function saveTarget() {
    const steps =
      parseStepTarget(
        stepTarget
      );

    if (
      steps ===
      undefined
    ) {
      setValidationMessage(
        "Set a daily step target before saving."
      );

      return;
    }

    if (
      steps <=
      0
    ) {
      setValidationMessage(
        "Daily step target must be greater than zero."
      );

      return;
    }

    if (
      !Number.isInteger(
        steps
      )
    ) {
      setValidationMessage(
        "Daily step target must be a whole number."
      );

      return;
    }

    addTarget({
      effectiveDate:
        effectiveDate ||
        undefined,

      dailyStepTarget:
        steps,

      notes:
        notes.trim() ||
        undefined,
    });

    setValidationMessage(
      null
    );

    setEditing(
      false
    );
  }


  // ----------------------------------------------------------
  // Loading
  // ----------------------------------------------------------

  if (
    !loaded
  ) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">
          Loading step target...
        </p>
      </div>
    );
  }


  // ----------------------------------------------------------
  // Edit Form
  // ----------------------------------------------------------

  if (
    editing
  ) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Step Target
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-900">
            {currentTarget
              ? "Change Step Target"
              : "Set Step Target"}
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Target changes create a new historical record so earlier
            activity data remains tied to the step target that was active
            at the time.
          </p>
        </div>


        <div className="mt-5 space-y-5">

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">
              Daily step target
            </span>

            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                min={1}
                step="1"
                value={
                  stepTarget
                }
                onChange={(
                  event
                ) =>
                  setStepTarget(
                    event.target
                      .value
                  )
                }
                placeholder="Example: 8000"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900"
              />

              <span className="text-sm text-slate-500">
                steps
              </span>
            </div>
          </label>


          <label className="block">
            <span className="text-sm font-semibold text-slate-800">
              Effective date
            </span>

            <input
              type="date"
              value={
                effectiveDate
              }
              onChange={(
                event
              ) =>
                setEffectiveDate(
                  event.target
                    .value
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900"
            />

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Leave blank to make the new target effective today.
            </p>
          </label>


          <label className="block">
            <span className="text-sm font-semibold text-slate-800">
              Notes
            </span>

            <textarea
              value={
                notes
              }
              onChange={(
                event
              ) =>
                setNotes(
                  event.target
                    .value
                )
              }
              rows={3}
              placeholder="Optional context"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900"
            />
          </label>


          {validationMessage && (
            <p className="text-sm font-medium text-red-600">
              {
                validationMessage
              }
            </p>
          )}


          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={
                saveTarget
              }
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Save Step Target
            </button>

            <button
              type="button"
              onClick={() =>
                setEditing(
                  false
                )
              }
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

          </div>

        </div>

      </div>
    );
  }


  // ----------------------------------------------------------
  // Empty State
  // ----------------------------------------------------------

  if (
    !currentTarget
  ) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          Step Target
        </p>

        <h3 className="mt-1 text-lg font-bold text-slate-900">
          Set your daily step target
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Add a daily step target so Fitness OS can track general-activity
          adherence alongside training and nutrition.
        </p>

        <button
          type="button"
          onClick={
            beginEditing
          }
          className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Set Step Target
        </button>

      </div>
    );
  }


  // ----------------------------------------------------------
  // Current Target
  // ----------------------------------------------------------

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Current Step Target
          </p>

          <h3 className="mt-1 text-xl font-bold text-slate-900">
            {
              currentTarget.dailyStepTarget
                .toLocaleString()
            }{" "}
            steps / day
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Effective{" "}
            {
              formatEffectiveDate(
                currentTarget.effectiveDate
              )
            }.
          </p>
        </div>


        <button
          type="button"
          onClick={
            beginEditing
          }
          className="rounded-xl border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
        >
          Change Target
        </button>

      </div>


      {currentTarget.notes && (
        <div className="mt-5 rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Notes
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {
              currentTarget.notes
            }
          </p>
        </div>
      )}


      {history.length > 1 && (
        <div className="mt-5 border-t border-slate-200 pt-5">

          <p className="text-sm font-semibold text-slate-800">
            Target History
          </p>

          <div className="mt-3 space-y-2">
            {history.map(
              (
                target
              ) => (
                <div
                  key={
                    target.id
                  }
                  className="rounded-xl bg-slate-50 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">

                    <p className="text-sm font-semibold text-slate-800">
                      {
                        formatEffectiveDate(
                          target.effectiveDate
                        )
                      }
                    </p>

                    <p className="text-sm text-slate-500">
                      {
                        target.dailyStepTarget
                          .toLocaleString()
                      }{" "}
                      steps / day
                    </p>

                  </div>
                </div>
              )
            )}
          </div>

        </div>
      )}

    </div>
  );
}