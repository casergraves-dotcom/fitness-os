import { getMobilityRoutine } from "../mobilityLibrary";

import type { MobilityRoutineId } from "@/features/workout/types";

export default function MobilityRoutinePreview({
  routineId,
}: {
  routineId: MobilityRoutineId;
}) {
  const routine = getMobilityRoutine(routineId);

  if (!routine) {
    return null;
  }

  return (
    <details className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
      <summary className="cursor-pointer list-none font-semibold text-blue-700 marker:hidden">
        <span className="flex items-center justify-between gap-3">
          <span>View {routine.durationMinutes}-minute routine</span>
          <span aria-hidden="true">⌄</span>
        </span>
      </summary>

      <div className="mt-4 space-y-3 border-t border-blue-100 pt-4">
        <div>
          <p className="font-semibold text-slate-900">{routine.name}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{routine.description}</p>
        </div>

        {routine.drills.map((drill, index) => (
          <div key={drill.id} className="rounded-xl bg-white p-3">
            <div className="flex items-start justify-between gap-3">
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
        ))}
      </div>
    </details>
  );
}
