"use client";

// ============================================================
// Imports
// ============================================================

import {
  useEffect,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  useDailySteps,
} from "../hooks/useDailySteps";

import {
  useStepTargets,
} from "../hooks/useStepTargets";

import { parseDailyStepInput } from "../utils/parseDailyStepInput";


// ============================================================
// Component
// ============================================================

export default function DailyStepsCard() {
  const {
    loaded,
    todayRecord,
    saveDailySteps,
    deleteDailySteps,
  } =
    useDailySteps();

  const {
    loaded:
      targetLoaded,

    currentTarget,
  } =
    useStepTargets();

  const [
    editing,
    setEditing,
  ] =
    useState(false);

  const [
    steps,
    setSteps,
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

    setSteps(
      todayRecord
        ? String(
            todayRecord.steps
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
    setSteps(
      todayRecord
        ? String(
            todayRecord.steps
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
    const parsedSteps =
      parseDailyStepInput(
        steps
      );

    const trimmedNotes =
      notes.trim();

    if (
      parsedSteps.status ===
      "empty"
    ) {
      if (
        todayRecord &&
        trimmedNotes ===
          ""
      ) {
        deleteDailySteps(
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
        "Enter today's step total before saving."
      );

      return;
    }

    if (
      parsedSteps.status ===
      "invalid"
    ) {
      setValidationMessage(
        "Enter steps as a whole number using digits only."
      );

      return;
    }

    saveDailySteps({
      steps:
        parsedSteps.steps,

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
    !loaded ||
    !targetLoaded
  ) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">
          Loading daily activity...
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
            Daily Activity
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-900">
            Today&apos;s Steps
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Log your daily step total without entering individual walks or activities.
          </p>
        </div>


        <div className="mt-5 space-y-5">

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">
              Steps
            </span>

            <div className="mt-2 flex items-center gap-2">
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={
                  steps
                }
                onChange={(
                  event
                ) =>
                  setSteps(
                    event.target
                      .value
                  )
                }
                placeholder="Example: 8500"
              />

              <span className="text-sm text-slate-500">
                steps
              </span>
            </div>

            {parseDailyStepInput(steps).status === "valid" && (
              <span className="mt-2 block text-xs text-slate-500">
                Will save {Number(steps).toLocaleString()} steps
              </span>
            )}
          </label>


          <label className="block">
            <span className="text-sm font-semibold text-slate-800">
              Notes
            </span>

            <Textarea
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
              className="mt-2"
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

            <Button
              type="button"
              onClick={
                save
              }
            >
              Save Steps
            </Button>

            <Button
              type="button"
              onClick={() => {
                setValidationMessage(
                  null
                );

                setEditing(
                  false
                );
              }}
              variant="outline"
            >
              Cancel
            </Button>

          </div>


          {todayRecord && (
            <p className="text-xs leading-5 text-slate-500">
              Clear the step total and notes, then save to remove today&apos;s step entry.
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
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Daily Activity
          </p>
          <h3 className="mt-1 font-bold text-slate-900">
            Steps not logged
          </h3>
          {currentTarget && (
            <p className="mt-1 text-sm text-slate-500">
              Target: {currentTarget.dailyStepTarget.toLocaleString()} steps
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={
            beginEditing
          }
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Log Steps
        </button>
      </div>
    );
  }


  // ----------------------------------------------------------
  // Current Record
  // ----------------------------------------------------------

  const targetSteps =
    currentTarget
      ?.dailyStepTarget;

  const difference =
    targetSteps !==
      undefined
      ? todayRecord.steps -
        targetSteps
      : undefined;


  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Daily Activity
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-900">
            Today&apos;s Steps
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


      <div className="mt-5 rounded-xl bg-slate-50 p-4">

        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Steps
        </p>

        <p className="mt-1 text-lg font-bold text-slate-900">
          {
            todayRecord.steps
              .toLocaleString()
          }
          {targetSteps !==
            undefined
            ? ` / ${targetSteps.toLocaleString()}`
            : ""}
          {" "}steps
        </p>


        {difference !==
          undefined && (
          <p className="mt-1 text-xs text-slate-500">
            {difference <
            0
              ? `${Math.abs(
                  difference
                ).toLocaleString()} steps remaining`
              : difference >
                0
              ? `${difference.toLocaleString()} steps over target`
              : "Step target met"}
          </p>
        )}

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
