"use client";

import { useEffect, useState } from "react";

import { useCoachingPreferences } from "../hooks/useCoachingPreferences";
import type {
  CoachingAdjustmentStyle,
  CoachingBalanceLevel,
  CoachingFocus,
  CoachingPreferences,
} from "../coachingPreferences";

const FOCUS_OPTIONS: Array<{ value: CoachingFocus; label: string; description: string }> = [
  { value: "Balanced", label: "Balanced", description: "Balance progress, consistency, recovery, and enjoyment." },
  { value: "Performance", label: "Performance", description: "Favor measurable progress when several safe choices are available." },
  { value: "Consistency", label: "Consistency", description: "Favor choices that are easiest to repeat reliably." },
  { value: "Recovery", label: "Recovery", description: "Favor the more conservative safe option when discretion is available." },
  { value: "Enjoyment", label: "Enjoyment", description: "Favor preferred activities when they fit the plan safely." },
];

const BALANCE_OPTIONS: Array<{ value: CoachingBalanceLevel; label: string }> = [
  { value: "Lower", label: "Lower emphasis" },
  { value: "Standard", label: "Standard emphasis" },
  { value: "Higher", label: "Higher emphasis" },
];

const ADJUSTMENT_STYLE_OPTIONS: Array<{
  value: CoachingAdjustmentStyle;
  label: string;
  description: string;
}> = [
  { value: "Conservative", label: "Conservative", description: "Prefer smaller changes and more time before escalating." },
  { value: "Balanced", label: "Balanced", description: "Use measured changes when the evidence supports them." },
  { value: "Assertive", label: "Assertive", description: "Prefer the stronger option within the same safe range." },
];

export default function CoachingPreferencesForm() {
  const { preferences, loaded, savePreferences } = useCoachingPreferences();
  const [draft, setDraft] = useState<CoachingPreferences>(preferences);
  const [saved, setSaved] = useState(false);

  useEffect(() => setDraft(preferences), [preferences]);

  if (!loaded) {
    return <div className="rounded-2xl border bg-white p-5 text-sm text-slate-500 shadow-sm">Loading coaching preferences...</div>;
  }

  function updateBalance(
    key: keyof CoachingPreferences["modalityBalance"],
    value: CoachingBalanceLevel
  ) {
    setSaved(false);
    setDraft((current) => ({
      ...current,
      modalityBalance: { ...current.modalityBalance, [key]: value },
    }));
  }

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Coaching preferences</p>
      <h2 className="mt-1 text-lg font-bold">How should discretionary coaching lean?</h2>
      <p className="mt-1 text-sm text-slate-600">
        These preferences help rank equally safe choices. They never override your active goal, required training, progression rules, or recovery safeguards.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {FOCUS_OPTIONS.map((option) => (
          <label key={option.value} className={`cursor-pointer rounded-xl border p-4 ${draft.focus === option.value ? "border-blue-600 bg-blue-50" : "border-slate-200"}`}>
            <span className="flex items-start gap-3">
              <input type="radio" name="coaching-focus" value={option.value} checked={draft.focus === option.value} onChange={() => { setSaved(false); setDraft((current) => ({ ...current, focus: option.value })); }} className="mt-1 h-4 w-4" />
              <span>
                <span className="block font-semibold text-slate-900">{option.label}</span>
                <span className="mt-1 block text-sm text-slate-500">{option.description}</span>
              </span>
            </span>
          </label>
        ))}
      </div>

      <div className="mt-6 border-t border-slate-200 pt-5">
        <h3 className="font-semibold text-slate-900">Adjustment style</h3>
        <p className="mt-1 text-sm text-slate-500">
          Choose how strongly Guide should act when several options are already safe.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {ADJUSTMENT_STYLE_OPTIONS.map((option) => (
            <label key={option.value} className={`cursor-pointer rounded-xl border p-4 ${draft.adjustmentStyle === option.value ? "border-blue-600 bg-blue-50" : "border-slate-200"}`}>
              <span className="flex items-start gap-3">
                <input type="radio" name="coaching-adjustment-style" value={option.value} checked={draft.adjustmentStyle === option.value} onChange={() => { setSaved(false); setDraft((current) => ({ ...current, adjustmentStyle: option.value })); }} className="mt-1 h-4 w-4" />
                <span>
                  <span className="block font-semibold text-slate-900">{option.label}</span>
                  <span className="mt-1 block text-sm text-slate-500">{option.description}</span>
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-slate-200 pt-5">
        <h3 className="font-semibold text-slate-900">Discretionary training balance</h3>
        <p className="mt-1 text-sm text-slate-500">Adjust optional emphasis without changing required sessions.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {([
            ["strength", "Strength"],
            ["running", "Running / cardio"],
            ["activeHobbies", "Active hobbies"],
          ] as const).map(([key, label]) => (
            <label key={key} className="text-sm font-semibold text-slate-700">
              {label}
              <select value={draft.modalityBalance[key]} onChange={(event) => updateBalance(key, event.target.value as CoachingBalanceLevel)} className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal text-slate-900">
                {BALANCE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button type="button" onClick={() => { savePreferences({ focus: draft.focus, adjustmentStyle: draft.adjustmentStyle, modalityBalance: draft.modalityBalance }); setSaved(true); }} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Save Coaching Preferences</button>
        {saved && <span className="text-sm font-medium text-emerald-700">Saved</span>}
      </div>
    </section>
  );
}
