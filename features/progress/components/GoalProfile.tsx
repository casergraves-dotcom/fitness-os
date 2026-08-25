"use client";

// ============================================================
// Imports
// ============================================================

import {
  useMemo,
  useState,
} from "react";

import {
  useBodyCompositionGoals,
} from "../hooks/useBodyCompositionGoals";

import type {
  BodyCompositionGoalType,
} from "../bodyCompositionTypes";


// ============================================================
// Constants
// ============================================================

const GOAL_OPTIONS: {
  value:
    BodyCompositionGoalType;

  label:
    string;

  description:
    string;
}[] = [
  {
    value:
      "FatLoss",

    label:
      "Fat Loss",

    description:
      "Reduce body fat while protecting useful strength and fitness.",
  },
  {
    value:
      "BodyComposition",

    label:
      "Body Composition",

    description:
      "Improve the balance of fat mass and lean mass without focusing only on scale weight.",
  },
  {
    value:
      "Maintenance",

    label:
      "Maintenance",

    description:
      "Maintain current body composition while supporting training and recovery.",
  },
  {
    value:
      "Performance",

    label:
      "Performance",

    description:
      "Prioritize performance while still monitoring body-composition trends.",
  },
];


// ============================================================
// Helpers
// ============================================================

function formatGoalType(
  type:
    BodyCompositionGoalType
) {
  return (
    GOAL_OPTIONS.find(
      (
        option
      ) =>
        option.value ===
        type
    )?.label ??
    type
  );
}


function formatEffectiveDate(
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


function parseOptionalNumber(
  value:
    string
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

export default function GoalProfile() {
  const {
    loaded,
    currentGoal,
    addGoal,
  } =
    useBodyCompositionGoals();

  const [
    editing,
    setEditing,
  ] =
    useState(false);

  const [
    primaryGoal,
    setPrimaryGoal,
  ] =
    useState<
      BodyCompositionGoalType
    >(
      "FatLoss"
    );

  const [
    targetWeight,
    setTargetWeight,
  ] =
    useState("");

  const [
    targetBodyFat,
    setTargetBodyFat,
  ] =
    useState("");

  const [
    expectedWeeklyChange,
    setExpectedWeeklyChange,
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
  // Current Goal Description
  // ----------------------------------------------------------

  const currentGoalDescription =
    useMemo(
      () =>
        currentGoal
          ? GOAL_OPTIONS.find(
              (
                option
              ) =>
                option.value ===
                currentGoal.primaryGoal
            )?.description
          : undefined,
      [
        currentGoal,
      ]
    );


  // ----------------------------------------------------------
  // Begin Editing
  // ----------------------------------------------------------

  function beginEditing() {
    if (
      currentGoal
    ) {
      setPrimaryGoal(
        currentGoal.primaryGoal
      );

      setTargetWeight(
        currentGoal.targetWeightLb !==
          undefined
          ? String(
              currentGoal.targetWeightLb
            )
          : ""
      );

      setTargetBodyFat(
        currentGoal.targetBodyFatPercent !==
          undefined
          ? String(
              currentGoal.targetBodyFatPercent
            )
          : ""
      );

      setExpectedWeeklyChange(
        currentGoal.expectedWeeklyWeightChangeLb !==
          undefined
          ? String(
              currentGoal.expectedWeeklyWeightChangeLb
            )
          : ""
      );

      setNotes(
        currentGoal.notes ??
        ""
      );
    } else {
      setPrimaryGoal(
        "FatLoss"
      );

      setTargetWeight(
        ""
      );

      setTargetBodyFat(
        ""
      );

      setExpectedWeeklyChange(
        ""
      );

      setNotes(
        ""
      );
    }

    setValidationMessage(
      null
    );

    setEditing(
      true
    );
  }


  // ----------------------------------------------------------
  // Save Goal
  // ----------------------------------------------------------

  function saveGoal() {
    const parsedTargetWeight =
      parseOptionalNumber(
        targetWeight
      );

    const parsedTargetBodyFat =
      parseOptionalNumber(
        targetBodyFat
      );

    const parsedWeeklyChange =
      parseOptionalNumber(
        expectedWeeklyChange
      );

    if (
      parsedTargetWeight !==
        undefined &&
      parsedTargetWeight <=
        0
    ) {
      setValidationMessage(
        "Target weight must be greater than zero."
      );

      return;
    }

    if (
      parsedTargetBodyFat !==
        undefined &&
      (
        parsedTargetBodyFat <=
          0 ||
        parsedTargetBodyFat >=
          100
      )
    ) {
      setValidationMessage(
        "Target body fat must be between 0 and 100%."
      );

      return;
    }

    addGoal({
      primaryGoal,

      targetWeightLb:
        parsedTargetWeight,

      targetBodyFatPercent:
        parsedTargetBodyFat,

      expectedWeeklyWeightChangeLb:
        parsedWeeklyChange,

      notes:
        notes.trim() !==
        ""
          ? notes.trim()
          : undefined,
    });

    setEditing(
      false
    );

    setValidationMessage(
      null
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
          Loading goal profile...
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
            Goal Profile
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-900">
            {currentGoal
              ? "Change Goal"
              : "Set Goal"}
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Goal changes create a new historical record so earlier
            progress remains tied to the goal that was active at the time.
          </p>

        </div>


        <div className="mt-5 space-y-5">

          <label className="block">

            <span className="text-sm font-semibold text-slate-800">
              Primary goal
            </span>

            <select
              value={
                primaryGoal
              }
              onChange={(
                event
              ) =>
                setPrimaryGoal(
                  event.target
                    .value as BodyCompositionGoalType
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900"
            >
              {GOAL_OPTIONS.map(
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

            <p className="mt-2 text-sm leading-5 text-slate-500">
              {
                GOAL_OPTIONS.find(
                  (
                    option
                  ) =>
                    option.value ===
                    primaryGoal
                )?.description
              }
            </p>

          </label>


          <div className="grid gap-4 sm:grid-cols-2">

            <label className="block">

              <span className="text-sm font-semibold text-slate-800">
                Target weight
              </span>

              <div className="mt-2 flex items-center gap-2">

                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.1"
                  value={
                    targetWeight
                  }
                  onChange={(
                    event
                  ) =>
                    setTargetWeight(
                      event.target
                        .value
                    )
                  }
                  placeholder="Optional"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900"
                />

                <span className="text-sm text-slate-500">
                  lb
                </span>

              </div>

            </label>


            <label className="block">

              <span className="text-sm font-semibold text-slate-800">
                Target body fat
              </span>

              <div className="mt-2 flex items-center gap-2">

                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={100}
                  step="0.1"
                  value={
                    targetBodyFat
                  }
                  onChange={(
                    event
                  ) =>
                    setTargetBodyFat(
                      event.target
                        .value
                    )
                  }
                  placeholder="Optional"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900"
                />

                <span className="text-sm text-slate-500">
                  %
                </span>

              </div>

            </label>

          </div>


          <label className="block">

            <span className="text-sm font-semibold text-slate-800">
              Expected weekly weight change
            </span>

            <div className="mt-2 flex items-center gap-2">

              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={
                  expectedWeeklyChange
                }
                onChange={(
                  event
                ) =>
                  setExpectedWeeklyChange(
                    event.target
                      .value
                  )
                }
                placeholder="Optional"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900"
              />

              <span className="whitespace-nowrap text-sm text-slate-500">
                lb / week
              </span>

            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Use a negative value for expected weight loss.
              This is a planning context, not an automatic prescription.
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
              placeholder="Optional goal context"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900"
            />

          </label>


          {validationMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-700">
                {
                  validationMessage
                }
              </p>
            </div>
          )}


          <div className="flex flex-wrap justify-end gap-3">

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

            <button
              type="button"
              onClick={
                saveGoal
              }
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Save Goal
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
    !currentGoal
  ) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          Goal Profile
        </p>

        <h3 className="mt-1 text-lg font-bold text-slate-900">
          Set your current goal
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Add the outcome Fitness OS should use when evaluating
          body-composition and training progress.
        </p>

        <button
          type="button"
          onClick={
            beginEditing
          }
          className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Set Goal
        </button>

      </div>
    );
  }


  // ----------------------------------------------------------
  // Current Goal
  // ----------------------------------------------------------

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div>

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Current Goal
          </p>

          <h3 className="mt-1 text-xl font-bold text-slate-900">
            {
              formatGoalType(
                currentGoal.primaryGoal
              )
            }
          </h3>

          {currentGoalDescription && (
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              {
                currentGoalDescription
              }
            </p>
          )}

        </div>


        <button
          type="button"
          onClick={
            beginEditing
          }
          className="rounded-xl border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
        >
          Change Goal
        </button>

      </div>


      <div className="mt-5 grid gap-3 sm:grid-cols-3">

        <div className="rounded-xl bg-slate-50 p-4">

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Target Weight
          </p>

          <p className="mt-1 text-lg font-bold text-slate-900">
            {currentGoal.targetWeightLb !==
            undefined
              ? `${currentGoal.targetWeightLb} lb`
              : "Not set"}
          </p>

        </div>


        <div className="rounded-xl bg-slate-50 p-4">

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Target Body Fat
          </p>

          <p className="mt-1 text-lg font-bold text-slate-900">
            {currentGoal.targetBodyFatPercent !==
            undefined
              ? `${currentGoal.targetBodyFatPercent}%`
              : "Not set"}
          </p>

        </div>


        <div className="rounded-xl bg-slate-50 p-4">

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Expected Rate
          </p>

          <p className="mt-1 text-lg font-bold text-slate-900">
            {currentGoal.expectedWeeklyWeightChangeLb !==
            undefined
              ? `${currentGoal.expectedWeeklyWeightChangeLb} lb / week`
              : "Not set"}
          </p>

        </div>

      </div>


      <p className="mt-4 text-xs text-slate-500">
        Effective{" "}
        {
          formatEffectiveDate(
            currentGoal.effectiveDate
          )
        }
      </p>


      {currentGoal.notes && (
        <div className="mt-4 rounded-xl border border-slate-200 p-4">

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Notes
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            {
              currentGoal.notes
            }
          </p>

        </div>
      )}

    </div>
  );
}