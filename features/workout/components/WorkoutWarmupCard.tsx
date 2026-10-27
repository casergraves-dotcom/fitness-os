"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";

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
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <section
      className={`rounded-2xl border shadow-sm ${
        completed
          ? "border-emerald-200 bg-emerald-50"
          : skipped
            ? "border-slate-200 bg-slate-50"
            : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Session warm-up
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-950">
            {completed
              ? "Complete"
              : skipped
                ? "Skipped for today"
                : "3–5 min cardio + movement prep"}
          </p>
        </div>

        {resolved ? (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
          >
            <RotateCcw size={16} /> Reopen
          </button>
        ) : (
          <button
            type="button"
            aria-expanded={detailsOpen}
            onClick={() => setDetailsOpen((open) => !open)}
            className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-xl px-2 text-sm font-semibold text-blue-700"
          >
            {detailsOpen ? "Hide steps" : "View steps"}
            {detailsOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
          </button>
        )}
      </div>

      {!resolved && detailsOpen && (
        <div className="border-t border-slate-200 px-4 pb-3 pt-3">
          <ol className="space-y-2 text-sm text-slate-700 sm:grid sm:grid-cols-3 sm:gap-2 sm:space-y-0">
            <li className="rounded-xl bg-slate-50 px-3 py-2">
              <span className="font-semibold">1. Easy cardio</span>
              <span className="block text-xs leading-relaxed text-slate-600">
                Walk, cycle, or row for 3–5 minutes at a conversational pace.
              </span>
            </li>
            <li className="rounded-xl bg-slate-50 px-3 py-2">
              <span className="font-semibold">2. Movement round</span>
              <span className="block text-xs leading-relaxed text-slate-600">
                8 squats, 8 hip hinges, and 8 arm circles each way.
              </span>
            </li>
            <li className="rounded-xl bg-slate-50 px-3 py-2">
              <span className="font-semibold">3. Ramp-up set</span>
              <span className="block text-xs leading-relaxed text-slate-600">
                Add light practice inside your first eligible exercise.
              </span>
            </li>
          </ol>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Warm-up work stays separate from working-set completion, volume, and personal records.
          </p>
        </div>
      )}

      {!resolved && (
        <div className="flex gap-2 border-t border-slate-200 p-3">
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
          >
            <Check size={16} /> Warm-up complete
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
          >
            Skip
          </button>
        </div>
      )}
    </section>
  );
}
