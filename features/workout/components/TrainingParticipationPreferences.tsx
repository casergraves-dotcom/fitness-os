"use client";

import { useEffect, useMemo, useState } from "react";

import { useTrainingPlanState } from "../hooks/useTrainingPlanState";
import {
  DEFAULT_TRAINING_MODALITIES,
  getEnabledTrainingModalitiesForDate,
} from "../logic/getTrainingParticipationPreferenceForDate";
import type { TrainingModality } from "../types";

const OPTIONS: Array<{ value: TrainingModality; label: string; description: string }> = [
  { value: "Strength", label: "Strength training", description: "Gym and home strength sessions." },
  { value: "Run", label: "Running", description: "Scheduled development and endurance runs." },
  { value: "Aerial", label: "Aerial", description: "Aerial sessions and aerial-specific load context." },
];

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function TrainingParticipationPreferences() {
  const { state, loaded, setTrainingParticipationPreferences } = useTrainingPlanState();
  const today = formatLocalDate(new Date());
  const current = useMemo(
    () => state
      ? getEnabledTrainingModalitiesForDate(state.trainingParticipationPreferences, today)
      : DEFAULT_TRAINING_MODALITIES,
    [state, today]
  );
  const [selected, setSelected] = useState<TrainingModality[]>(current);
  const [saved, setSaved] = useState(false);

  useEffect(() => setSelected(current), [current]);

  if (!loaded) {
    return <div className="rounded-2xl border bg-white p-5 shadow-sm text-sm text-slate-500">Loading training preferences...</div>;
  }

  if (!state) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">Training Participation</h2>
        <p className="mt-2 text-sm text-slate-600">Start a training plan before changing participation preferences.</p>
      </div>
    );
  }

  function toggle(value: TrainingModality) {
    setSaved(false);
    setSelected((values) =>
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value]
    );
  }

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Training participation</p>
      <h2 className="mt-1 text-lg font-bold">Activities in your plan</h2>
      <p className="mt-1 text-sm text-slate-600">Changes apply from today forward. Earlier schedules and adherence remain unchanged.</p>

      <div className="mt-5 space-y-3">
        {OPTIONS.map((option) => (
          <label key={option.value} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
            <input type="checkbox" checked={selected.includes(option.value)} onChange={() => toggle(option.value)} className="mt-1 h-5 w-5" />
            <span>
              <span className="block font-semibold text-slate-900">{option.label}</span>
              <span className="mt-1 block text-sm text-slate-500">{option.description}</span>
            </span>
          </label>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button type="button" onClick={() => { setTrainingParticipationPreferences(selected); setSaved(true); }} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Save Preferences</button>
        {saved && <span className="text-sm font-medium text-emerald-700">Saved for {today}</span>}
      </div>
    </section>
  );
}
