import { Check, ChevronRight } from "lucide-react";

export interface WorkoutExerciseDashboardItem {
  id: string;
  name: string;
  order: number;
  completedSets: number;
  totalSets: number;
  targetLabel?: string;
  performanceSummary?: string;
}

export default function WorkoutExerciseDashboard({
  items,
  recommendedExerciseId,
  onSelect,
}: {
  items: WorkoutExerciseDashboardItem[];
  recommendedExerciseId?: string;
  onSelect: (exerciseId: string) => void;
}) {
  return (
    <section aria-labelledby="workout-dashboard-title">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Workout dashboard</p>
          <h2 id="workout-dashboard-title" className="mt-1 text-xl font-bold text-slate-950">Choose an exercise</h2>
        </div>
        <p className="text-right text-xs text-slate-500">Any order</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {items.map((item) => {
          const completed = item.totalSets > 0 && item.completedSets === item.totalSets;
          const inProgress = item.completedSets > 0 && !completed;
          const recommended = item.id === recommendedExerciseId;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`relative flex min-h-32 flex-col rounded-2xl border p-3 text-left shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                completed
                  ? "border-emerald-300 bg-emerald-50"
                  : recommended
                    ? "border-blue-400 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-blue-300"
              }`}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${completed ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-700"}`}>
                  {completed ? <Check size={15} /> : item.order}
                </span>
                <ChevronRight size={17} className="shrink-0 text-slate-400" />
              </span>

              <span className="mt-2 line-clamp-2 text-sm font-bold leading-5 text-slate-950">{item.name}</span>
              <span className={`mt-1 text-xs font-semibold ${completed ? "text-emerald-700" : inProgress ? "text-blue-700" : "text-slate-500"}`}>
                {completed ? "Completed" : inProgress ? "In progress" : recommended ? "Up next" : "Not started"}
                {" · "}{item.completedSets}/{item.totalSets}
              </span>

              <span className="mt-auto line-clamp-2 pt-2 text-xs leading-4 text-slate-600">
                {item.performanceSummary ?? item.targetLabel ?? "Open to view target"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
