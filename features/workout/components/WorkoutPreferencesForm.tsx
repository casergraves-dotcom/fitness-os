"use client";

import { useState } from "react";

import { useWorkoutPreferences } from "../hooks/useWorkoutPreferences";
import {
  playRestCompletionSound,
  vibrateForRestCompletion,
} from "../restCompletionCues";
import type {
  RestDurationPreferenceKey,
  WorkoutPreferences,
} from "../workoutPreferences";

const REST_FIELDS: Array<{
  key: RestDurationPreferenceKey;
  label: string;
  description: string;
}> = [
  {
    key: "heavyCompoundSeconds",
    label: "Primary compound",
    description: "Main lifts such as squats, presses, rows, and hinges.",
  },
  {
    key: "moderateCompoundSeconds",
    label: "General compound fallback",
    description: "Used when an exercise cannot be classified more specifically.",
  },
  {
    key: "isolationSeconds",
    label: "Accessory and isolation",
    description: "Smaller-muscle and single-joint exercises.",
  },
  {
    key: "coreSeconds",
    label: "Core",
    description: "Core stability, flexion, rotation, and hip-flexion work.",
  },
  {
    key: "bodyweightSeconds",
    label: "Bodyweight",
    description: "Exercises without external resistance.",
  },
];

export default function WorkoutPreferencesForm() {
  const { preferences, loaded, savePreferences } = useWorkoutPreferences();

  if (!loaded) {
    return (
      <div className="rounded-2xl border bg-white p-5 text-sm text-slate-500 shadow-sm">
        Loading workout preferences...
      </div>
    );
  }

  return (
    <WorkoutPreferencesEditor
      initialPreferences={preferences}
      savePreferences={savePreferences}
    />
  );
}

function WorkoutPreferencesEditor({
  initialPreferences,
  savePreferences,
}: {
  initialPreferences: WorkoutPreferences;
  savePreferences: (
    next: Omit<WorkoutPreferences, "updatedAt">
  ) => void;
}) {
  const [draft, setDraft] = useState<WorkoutPreferences>(initialPreferences);
  const [saved, setSaved] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
        Rest timer defaults
      </p>
      <h2 className="mt-1 text-lg font-bold text-slate-950">
        Rest between working sets
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Fitness OS selects a default from canonical exercise metadata. You can
        still adjust or skip each countdown during a workout.
      </p>

      <div className="mt-5 divide-y divide-slate-100">
        {REST_FIELDS.map((field) => (
          <label
            key={field.key}
            className="flex items-center justify-between gap-4 py-4 first:pt-0"
          >
            <span className="min-w-0">
              <span className="block font-semibold text-slate-900">
                {field.label}
              </span>
              <span className="mt-0.5 block text-sm text-slate-500">
                {field.description}
              </span>
            </span>

            <span className="flex shrink-0 items-center gap-2">
              <input
                type="number"
                min={30}
                max={600}
                step={15}
                inputMode="numeric"
                value={draft.restDurations[field.key]}
                onChange={(event) => {
                  setSaved(false);
                  setDraft((current) => ({
                    ...current,
                    restDurations: {
                      ...current.restDurations,
                      [field.key]: Number(event.target.value),
                    },
                  }));
                }}
                className="h-11 w-20 rounded-xl border border-slate-300 px-3 text-right text-base font-semibold text-slate-900"
                aria-label={`${field.label} rest duration in seconds`}
              />
              <span className="text-sm text-slate-500">sec</span>
            </span>
          </label>
        ))}
      </div>

      <div className="mt-5 border-t border-slate-100 pt-5">
        <p className="font-semibold text-slate-900">Completion cues</p>
        <p className="mt-1 text-sm text-slate-500">
          These cues play when Fitness OS detects that rest has finished while
          the app is active. Device mute and browser permissions still apply.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
            <input
              type="checkbox"
              checked={draft.restCompletionCues.sound}
              onChange={(event) => {
                setSaved(false);
                setDraft((current) => ({
                  ...current,
                  restCompletionCues: {
                    ...current.restCompletionCues,
                    sound: event.target.checked,
                  },
                }));
              }}
              className="h-5 w-5"
            />
            <span>
              <span className="block font-semibold text-slate-900">Sound</span>
              <span className="block text-sm text-slate-500">Two short tones</span>
            </span>
          </label>

          <label className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
            <input
              type="checkbox"
              checked={draft.restCompletionCues.vibration}
              onChange={(event) => {
                setSaved(false);
                setDraft((current) => ({
                  ...current,
                  restCompletionCues: {
                    ...current.restCompletionCues,
                    vibration: event.target.checked,
                  },
                }));
              }}
              className="h-5 w-5"
            />
            <span>
              <span className="block font-semibold text-slate-900">Vibration</span>
              <span className="block text-sm text-slate-500">When supported</span>
            </span>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void playRestCompletionSound()}
            className="min-h-11 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-blue-700"
          >
            Test sound
          </button>
          <button
            type="button"
            onClick={vibrateForRestCompletion}
            className="min-h-11 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-blue-700"
          >
            Test vibration
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="font-semibold text-slate-900">Background alerts</p>
        <p className="mt-1 text-sm text-slate-600">
          Not enabled in this build. Reliable alerts while Fitness OS is
          suspended require native local-notification support or a complete Web
          Push service. The timestamp countdown still catches up accurately when
          you return.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={() => {
            savePreferences({
              restDurations: draft.restDurations,
              restCompletionCues: draft.restCompletionCues,
            });
            setSaved(true);
          }}
          className="min-h-11 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Save Rest Preferences
        </button>
        {saved && (
          <p className="text-sm font-medium text-green-700" role="status">
            Saved. New rest periods will use these defaults.
          </p>
        )}
      </div>
    </div>
  );
}
