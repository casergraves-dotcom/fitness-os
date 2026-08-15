"use client";

import {
  useState,
} from "react";

import type {
  WeeklyProgressionDecisionRecord,
} from "@/features/workout/types";


// ============================================================
// Props
// ============================================================

interface WeeklyDecisionRecordProps {
  decision:
    WeeklyProgressionDecisionRecord | null;

  onOverride: (
    weekStartDate: string,
    finalShouldAdvance: boolean,
    reason?: string
  ) => void;
}


// ============================================================
// Weekly Decision Record
// ============================================================

export default function WeeklyDecisionRecord({
  decision,
  onOverride,
}: WeeklyDecisionRecordProps) {
  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    reason,
    setReason,
  ] = useState("");


  if (!decision) {
    return null;
  }


  // Keep a stable non-null reference for nested callbacks.
  const currentDecision =
    decision;


  // Deload transitions are automatic and intentionally cannot
  // be manually held.
  const canOverride =
    currentDecision.weekType !==
      "Deload";


  // The override always flips the currently applied result.
  const overrideTarget =
    !currentDecision
      .finalShouldAdvance;


  function applyOverride() {
    onOverride(
      currentDecision.weekStartDate,
      overrideTarget,
      reason
    );

    setReason("");
    setEditing(false);
  }


  return (
    <div className="mt-5 rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Last Applied Decision
      </p>


      <div className="mt-2 flex flex-wrap items-center gap-2">
        <p className="font-semibold text-slate-900">
          {currentDecision
            .finalShouldAdvance
            ? "Advance"
            : "Repeat week"}
        </p>

        {currentDecision
          .manuallyOverridden && (
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
            Manually overridden
          </span>
        )}
      </div>


      <p className="mt-2 text-sm text-slate-600">
        Fitness OS recommended{" "}
        <span className="font-medium text-slate-800">
          {currentDecision
            .automaticShouldAdvance
            ? "advancing"
            : "repeating the week"}
        </span>
        .
      </p>


      <p className="mt-1 text-sm text-slate-600">
        {
          currentDecision
            .automaticReason
        }
      </p>


      {currentDecision
        .manuallyOverridden &&
        currentDecision
          .overrideReason && (
          <p className="mt-2 text-sm text-slate-600">
            <span className="font-medium text-slate-800">
              Override reason:
            </span>{" "}
            {
              currentDecision
                .overrideReason
            }
          </p>
        )}


      {canOverride &&
        !editing && (
          <button
            type="button"
            className="mt-4 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() =>
              setEditing(true)
            }
          >
            {currentDecision
              .finalShouldAdvance
              ? "Repeat instead"
              : "Advance instead"}
          </button>
        )}


      {canOverride &&
        editing && (
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Reason for override
              </span>

              <textarea
                className="mt-1 min-h-20 w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900"
                value={reason}
                onChange={(
                  event
                ) =>
                  setReason(
                    event.target
                      .value
                  )
                }
                placeholder="Optional"
              />
            </label>


            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                onClick={
                  applyOverride
                }
              >
                Confirm{" "}
                {overrideTarget
                  ? "advance"
                  : "repeat"}
              </button>

              <button
                type="button"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
                onClick={() => {
                  setReason("");
                  setEditing(
                    false
                  );
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
    </div>
  );
}