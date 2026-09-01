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
    <nav aria-label="Workout exercises" className="sticky top-[calc(env(safe-area-inset-top)+0.5rem)] z-20 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-md backdrop-blur">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="shrink-0 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Jump to</span>
        {exercises.map((exercise, index) => {
          const completed = exercise.sets.filter((set) => set.completed).length;
          const total = exercise.sets.length;
          const exerciseComplete = total > 0 && completed === total;

          return (
            <button
              key={exercise.id}
              type="button"
              onClick={() => onSelect(exercise.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${exerciseComplete ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"}`}
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${exerciseComplete ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"}`}>
                {exerciseComplete ? <Check size={14} /> : index + 1}
              </span>
              <span>
                <span className="block max-w-32 truncate font-semibold">{exercise.name}</span>
                <span className="block text-xs opacity-75">{completed}/{total} sets</span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
