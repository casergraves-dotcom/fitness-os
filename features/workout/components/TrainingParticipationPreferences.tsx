"use client";

import { useEffect, useMemo, useState } from "react";

import { useTrainingPlanState } from "../hooks/useTrainingPlanState";
import {
  DEFAULT_TRAINING_MODALITIES,
  getEnabledTrainingModalitiesForDate,
  getTrainingParticipationPreferenceForDate,
} from "../logic/getTrainingParticipationPreferenceForDate";
import type {
  TrainingDayOfWeek,
  TrainingModality,
} from "../types";

const OPTIONS: Array<{ value: TrainingModality; label: string; description: string }> = [
  { value: "Strength", label: "Strength training", description: "Gym and home strength sessions." },
  { value: "Run", label: "Running", description: "Scheduled development and endurance runs." },
  { value: "Aerial", label: "Aerial", description: "Aerial sessions and aerial-specific load context." },
];

const DAYS: Array<{ value: TrainingDayOfWeek; label: string }> = [
  { value: "Sunday", label: "Sun" },
  { value: "Monday", label: "Mon" },
  { value: "Tuesday", label: "Tue" },
  { value: "Wednesday", label: "Wed" },
  { value: "Thursday", label: "Thu" },
  { value: "Friday", label: "Fri" },
  { value: "Saturday", label: "Sat" },
];

type PreferredDays = Partial<Record<TrainingModality, TrainingDayOfWeek[]>>;

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
  const currentPreferredDays = useMemo(
    () => state
      ? getTrainingParticipationPreferenceForDate(
          state.trainingParticipationPreferences,
          today
        )?.preferredDaysByModality ?? {}
      : {},
    [state, today]
  );
  const [selected, setSelected] = useState<TrainingModality[]>(current);
  const [preferredDays, setPreferredDays] = useState<PreferredDays>(
    currentPreferredDays
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => setSelected(current), [current]);
  useEffect(() => setPreferredDays(currentPreferredDays), [currentPreferredDays]);

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

  function togglePreferredDay(
    modality: TrainingModality,
    day: TrainingDayOfWeek
  ) {
    setSaved(false);
    setPreferredDays((values) => {
      const currentDays = values[modality] ?? [];
      return {
        ...values,
        [modality]: currentDays.includes(day)
          ? currentDays.filter((item) => item !== day)
          : [...currentDays, day],
      };
    });
  }

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Training participation</p>
      <h2 className="mt-1 text-lg font-bold">Activities in your plan</h2>
      <p className="mt-1 text-sm text-slate-600">Changes apply from today forward. Earlier schedules and adherence remain unchanged.</p>

      <div className="mt-5 space-y-3">
        {OPTIONS.map((option) => {
          const enabled = selected.includes(option.value);
          return (
            <div key={option.value} className="rounded-xl border border-slate-200 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={enabled} onChange={() => toggle(option.value)} className="mt-1 h-5 w-5" />
                <span>
                  <span className="block font-semibold text-slate-900">{option.label}</span>
                  <span className="mt-1 block text-sm text-slate-500">{option.description}</span>
                </span>
              </label>

              {enabled && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Preferred days <span className="normal-case font-normal">(optional)</span>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {DAYS.map((day) => {
                      const active = (preferredDays[option.value] ?? []).includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          aria-pressed={active}
                          onClick={() => togglePreferredDay(option.value, day.value)}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                            active
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Preferred days guide future planning. They do not move activities already on your schedule.
      </p>

      <div className="mt-5 flex items-center gap-3">
        <button type="button" onClick={() => { setTrainingParticipationPreferences(selected, preferredDays); setSaved(true); }} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Save Preferences</button>
        {saved && <span className="text-sm font-medium text-emerald-700">Saved for {today}</span>}
      </div>
    </section>
  );
}
