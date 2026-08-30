import { Check, RotateCcw } from "lucide-react";

export default function WorkoutWarmupCard({
  completed,
  skipped,
  onComplete,
  onSkip,
  onReset,
}: {
  completed: boolean;
  skipped: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onReset: () => void;
}) {
  const resolved = completed || skipped;

  return (
    <section className={`rounded-2xl border p-5 shadow-sm ${completed ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Session warm-up</p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">
            {completed ? "Warm-up complete" : skipped ? "Warm-up skipped" : "Prepare for your working sets"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {resolved
              ? "This preparation is recorded separately and does not count toward workout volume."
              : "Complete this short general warm-up before opening your working sets."}
          </p>
        </div>

        {resolved && (
          <button type="button" onClick={onReset} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
            <RotateCcw size={16} /> Reopen
          </button>
        )}
      </div>

      {!resolved && (
        <>
          <ol className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
            <li className="rounded-xl bg-slate-50 p-3">
              <span className="font-semibold">1. Easy cardio · 3–5 min</span><br />Walk, cycle, or row at a conversational pace.
            </li>
            <li className="rounded-xl bg-slate-50 p-3">
              <span className="font-semibold">2. One movement round</span><br />8 bodyweight squats, 8 hip hinges, and 8 arm circles each way.
            </li>
            <li className="rounded-xl bg-slate-50 p-3">
              <span className="font-semibold">3. First-exercise ramp-up</span><br />Add and complete the light ramp-up set shown inside your first main exercise.
            </li>
          </ol>

          <p className="mt-3 text-xs text-slate-500">Ramp-up sets appear separately inside eligible exercises. Warm-up work is not included in working-set completion, training volume, or personal records.</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={onComplete} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
              <Check size={16} /> Mark warm-up complete
            </button>
            <button type="button" onClick={onSkip} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Skip for today</button>
          </div>
        </>
      )}
    </section>
  );
}
