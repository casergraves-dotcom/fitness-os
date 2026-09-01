"use client";

import { useState } from "react";

import { useTrainingActivityCompletions } from "@/features/workout/hooks/useTrainingActivityCompletions";
import type { MobilityRoutineId, TrainingActivity } from "@/features/workout/types";

import { getMobilityRoutine } from "../mobilityLibrary";

export default function MobilityRoutineSession({
  routineId,
  onClose,
}: {
  routineId: MobilityRoutineId;
  onClose: () => void;
}) {
  const routine = getMobilityRoutine(routineId);
  const { completeActivity } = useTrainingActivityCompletions();
  const [completedDrillIds, setCompletedDrillIds] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  if (!routine) {
    return null;
  }

  const selectedRoutine = routine;

  const allDrillsComplete = completedDrillIds.length === selectedRoutine.drills.length;

  function toggleDrill(drillId: string) {
    setCompletedDrillIds((current) =>
      current.includes(drillId)
        ? current.filter((id) => id !== drillId)
        : [...current, drillId]
    );
  }

  function finishRoutine() {
    const activity: TrainingActivity = {
      id: `anytime-${selectedRoutine.id}`,
      type: "Mobility",
      label: selectedRoutine.name,
      mobilityRoutineId: selectedRoutine.id,
      durationMin: selectedRoutine.durationMinutes,
      durationMax: selectedRoutine.durationMinutes,
      optional: true,
    };

    completeActivity(activity);
    setFinished(true);
  }

  if (finished) {
    return (
      <div className="mx-auto w-full max-w-3xl rounded-2xl border bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">
          ✓
        </div>
        <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-emerald-700">
          Mobility complete
        </p>
        <h1 className="mt-2 text-2xl font-bold">Nice work</h1>
        <p className="mt-2 text-slate-500">Your mobility session has been saved.</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border bg-white p-6 shadow-sm">
      <button
        type="button"
        onClick={onClose}
        className="text-sm font-medium text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-blue-700"
      >
        ← Choose a different activity
      </button>

      <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-blue-600">
        Mobility & Stretching
      </p>
      <h1 className="mt-2 text-2xl font-bold">{routine.name}</h1>
      <p className="mt-2 leading-6 text-slate-500">{routine.description}</p>
      <p className="mt-3 text-sm font-semibold text-slate-700">
        About {routine.durationMinutes} minutes · {completedDrillIds.length}/{routine.drills.length} movements
      </p>

      <div className="mt-6 space-y-3">
        {routine.drills.map((drill, index) => {
          const completed = completedDrillIds.includes(drill.id);

          return (
            <div
              key={drill.id}
              className={`rounded-xl border p-4 ${
                completed
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => toggleDrill(drill.id)}
                  aria-pressed={completed}
                  aria-label={`${completed ? "Mark incomplete" : "Complete"}: ${drill.name}`}
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 font-bold ${
                    completed
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-300 text-transparent"
                  }`}
                >
                  ✓
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {index + 1}. {drill.name}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {drill.targetArea}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                      {drill.durationSeconds}s{drill.perSide ? " / side" : ""}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    <span className="font-semibold text-slate-800">Setup:</span> {drill.setup}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    <span className="font-semibold text-slate-800">Move:</span> {drill.execution}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{drill.safetyCue}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={finishRoutine}
        disabled={!allDrillsComplete}
        className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
      >
        {allDrillsComplete ? "Complete Routine" : "Complete each movement to finish"}
      </button>
    </div>
  );
}
