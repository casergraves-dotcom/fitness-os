"use client";

// ============================================================
// Imports
// ============================================================

import {
  useEffect,
  useState,
} from "react";

import {
  useDailyNutrition,
} from "../hooks/useDailyNutrition";

import {
  useNutritionAdherence,
} from "../hooks/useNutritionAdherence";


// ============================================================
// Helpers
// ============================================================

function parseOptionalNumber(
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

export default function DailyNutritionCard() {
  const {
    loaded,
    todayRecord,
    saveDailyNutrition,
    deleteDailyNutrition,
  } =
    useDailyNutrition();

  const {
    todayAdherence,
  } =
    useNutritionAdherence();

  const [
    editing,
    setEditing,
  ] =
    useState(false);

  const [
    calories,
    setCalories,
  ] =
    useState("");

  const [
    protein,
    setProtein,
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
  // Keep Form State In Sync
  // ----------------------------------------------------------

  useEffect(() => {
    if (
      editing
    ) {
      return;
    }

    setCalories(
      todayRecord?.calories !==
      undefined
        ? String(
            todayRecord.calories
          )
        : ""
    );

    setProtein(
      todayRecord?.proteinGrams !==
      undefined
        ? String(
            todayRecord.proteinGrams
          )
        : ""
    );

    setNotes(
      todayRecord?.notes ??
      ""
    );
  }, [
    todayRecord,
    editing,
  ]);


  // ----------------------------------------------------------
  // Begin Editing
  // ----------------------------------------------------------

  function beginEditing() {
    setCalories(
      todayRecord?.calories !==
      undefined
        ? String(
            todayRecord.calories
          )
        : ""
    );

    setProtein(
      todayRecord?.proteinGrams !==
      undefined
        ? String(
            todayRecord.proteinGrams
          )
        : ""
    );

    setNotes(
      todayRecord?.notes ??
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
  // Save / Clear
  // ----------------------------------------------------------

  function save() {
    const parsedCalories =
      parseOptionalNumber(
        calories
      );

    const parsedProtein =
      parseOptionalNumber(
        protein
      );

    const trimmedNotes =
      notes.trim();

    const isEmpty =
      parsedCalories ===
        undefined &&
      parsedProtein ===
        undefined &&
      trimmedNotes ===
        "";

    if (
      isEmpty
    ) {
      if (
        todayRecord
      ) {
        deleteDailyNutrition(
          todayRecord.id
        );

        setValidationMessage(
          null
        );

        setEditing(
          false
        );

        return;
      }

      setValidationMessage(
        "Enter calories, protein, or a note before saving."
      );

      return;
    }

    if (
      parsedCalories !==
        undefined &&
      parsedCalories <
        0
    ) {
      setValidationMessage(
        "Calories cannot be negative."
      );

      return;
    }

    if (
      parsedProtein !==
        undefined &&
      parsedProtein <
        0
    ) {
      setValidationMessage(
        "Protein cannot be negative."
      );

      return;
    }

    saveDailyNutrition({
      calories:
        parsedCalories,

      proteinGrams:
        parsedProtein,

      notes:
        trimmedNotes ||
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
          Loading nutrition...
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
            Nutrition
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-900">
            Today&apos;s Nutrition
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Log the daily totals you already track without entering individual foods or meals.
          </p>
        </div>


        <div className="mt-5 space-y-5">

          <div className="grid gap-4 sm:grid-cols-2">

            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Calories
              </span>

              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step="1"
                  value={
                    calories
                  }
                  onChange={(
                    event
                  ) =>
                    setCalories(
                      event.target
                        .value
                    )
                  }
                  placeholder="Optional"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900"
                />

                <span className="text-sm text-slate-500">
                  cal
                </span>
              </div>
            </label>


            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Protein
              </span>

              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step="1"
                  value={
                    protein
                  }
                  onChange={(
                    event
                  ) =>
                    setProtein(
                      event.target
                        .value
                    )
                  }
                  placeholder="Optional"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900"
                />

                <span className="text-sm text-slate-500">
                  g
                </span>
              </div>
            </label>

          </div>


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
                save
              }
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Save Nutrition
            </button>

            <button
              type="button"
              onClick={() => {
                setValidationMessage(
                  null
                );

                setEditing(
                  false
                );
              }}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

          </div>

          {todayRecord && (
            <p className="text-xs leading-5 text-slate-500">
              Clear calories, protein, and notes, then save to remove today&apos;s nutrition entry.
            </p>
          )}

        </div>

      </div>
    );
  }


  // ----------------------------------------------------------
  // Empty State
  // ----------------------------------------------------------

  if (
    !todayRecord
  ) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          Nutrition
        </p>

        <h3 className="mt-1 text-lg font-bold text-slate-900">
          Today&apos;s Nutrition
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          No nutrition totals have been logged for today.
        </p>

        <button
          type="button"
          onClick={
            beginEditing
          }
          className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Log Nutrition
        </button>

      </div>
    );
  }


  // ----------------------------------------------------------
  // Current Record
  // ----------------------------------------------------------

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Nutrition
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-900">
            Today&apos;s Nutrition
          </h3>
        </div>


        <button
          type="button"
          onClick={
            beginEditing
          }
          className="rounded-xl border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
        >
          Edit
        </button>

      </div>


      <div className="mt-5 grid gap-3 sm:grid-cols-2">

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Calories
          </p>

          <p className="mt-1 text-lg font-bold text-slate-900">
            {todayRecord.calories !==
            undefined
              ? todayAdherence?.calories.targetCalories !==
                undefined
                ? `${todayRecord.calories} / ${todayAdherence.calories.targetCalories} cal`
                : `${todayRecord.calories} cal`
              : "Not logged"}
          </p>

          {todayAdherence &&
            todayAdherence.calories.status !==
              "NoData" && (
            <p className="mt-1 text-xs text-slate-500">
              {todayAdherence.calories.status ===
              "OnTarget"
                ? "Within target range"
                : todayAdherence.calories.status ===
                  "BelowTarget"
                ? "Below target range"
                : "Above target range"}
            </p>
          )}
        </div>


        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Protein
          </p>

          <p className="mt-1 text-lg font-bold text-slate-900">
            {todayRecord.proteinGrams !==
            undefined
              ? todayAdherence?.protein.targetGrams !==
                undefined
                ? `${todayRecord.proteinGrams} / ${todayAdherence.protein.targetGrams} g`
                : `${todayRecord.proteinGrams} g`
              : "Not logged"}
          </p>

          {todayAdherence &&
            todayAdherence.protein.status !==
              "NoData" && (
            <p className="mt-1 text-xs text-slate-500">
              {todayAdherence.protein.status ===
              "Met"
                ? (
                    todayAdherence.protein.differenceGrams !==
                      undefined &&
                    todayAdherence.protein.differenceGrams >
                      0
                      ? `${todayAdherence.protein.differenceGrams} g over target`
                      : "Protein target met"
                  )
                : `${Math.abs(
                    todayAdherence.protein.differenceGrams ??
                      0
                  )} g remaining`}
            </p>
          )}
        </div>

      </div>


      {todayRecord.notes && (
        <div className="mt-4 rounded-xl border border-slate-200 p-4">

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Notes
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {
              todayRecord.notes
            }
          </p>

        </div>
      )}

    </div>
  );
}