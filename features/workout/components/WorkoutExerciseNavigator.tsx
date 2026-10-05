import { Check } from "lucide-react";

import type { Exercise } from "../types";

export default function WorkoutExerciseNavigator({
  exercises,
  onSelect,
}: {
  exercises: Exercise[];
  onSelect: (exerciseId: string) => void;
}) {
  return (
    <nav aria-label="Jump to workout exercise" className="sticky top-[calc(env(safe-area-inset-top)+0.5rem)] z-20 rounded-xl border border-slate-200 bg-white/95 p-2 shadow-md backdrop-blur">
      <div className="flex items-center gap-1.5 overflow-x-auto">
        <span className="shrink-0 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Jump</span>
        {exercises.map((exercise, index) => {
          const completed = exercise.sets.filter((set) => set.completed).length;
          const total = exercise.sets.length;
          const exerciseComplete = total > 0 && completed === total;

          return (
            <button
              key={exercise.id}
              type="button"
              onClick={() => onSelect(exercise.id)}
              className={`flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-sm transition ${exerciseComplete ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"}`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${exerciseComplete ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"}`}>
                {exerciseComplete ? <Check size={14} /> : index + 1}
              </span>
              <span className="flex max-w-40 items-baseline gap-1.5">
                <span className="truncate font-semibold">{exercise.name}</span>
                <span className="shrink-0 text-[11px] opacity-70">{completed}/{total}</span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
