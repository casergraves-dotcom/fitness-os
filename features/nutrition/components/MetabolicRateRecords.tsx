"use client";

import { useState } from "react";
import { useMetabolicRateRecords } from "../hooks/useMetabolicRateRecords";
import type { MetabolicRateSource } from "../nutritionTypes";

const SOURCE_LABELS: Record<MetabolicRateSource, string> = {
  IndirectCalorimetry: "Measured breathing test",
  ProviderEstimate: "Provider estimate",
  ManualEstimate: "Manual estimate",
};

const todayDate = () => new Date().toISOString().slice(0, 10);
const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
  });

export default function MetabolicRateRecords() {
  const { records, latestRecord, addRecord, deleteRecord } = useMetabolicRateRecords();
  const [adding, setAdding] = useState(false);
  const [restingCalories, setRestingCalories] = useState("");
  const [measuredDate, setMeasuredDate] = useState(todayDate());
  const [source, setSource] = useState<MetabolicRateSource>("IndirectCalorimetry");
  const [weightLb, setWeightLb] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setRestingCalories(""); setMeasuredDate(todayDate());
    setSource("IndirectCalorimetry"); setWeightLb(""); setNotes(""); setError(null);
  }

  function handleSave() {
    const calories = Number(restingCalories);
    const weight = weightLb.trim() ? Number(weightLb) : undefined;
    if (!measuredDate || !Number.isFinite(calories) || calories <= 0) {
      setError("Enter a valid resting calorie rate and date."); return;
    }
    if (weight !== undefined && (!Number.isFinite(weight) || weight <= 0)) {
      setError("Test-time weight must be greater than zero."); return;
    }
    addRecord({ measuredDate, restingCalories: calories, source, weightLb: weight,
      notes: notes.trim() || undefined });
    resetForm(); setAdding(false);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Resting Metabolic Rate</p>
          <h3 className="mt-1 text-lg font-bold">RMR Records</h3>
          <p className="mt-1 text-sm text-slate-500">Store a measured or estimated resting calorie burn for nutrition recommendations.</p>
        </div>
        <button className="rounded-xl border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600"
          onClick={() => setAdding((current) => !current)} type="button">
          {adding ? "Cancel" : "Add RMR Record"}
        </button>
      </div>

      {latestRecord ? (
        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Latest</p>
          <p className="mt-1 text-xl font-bold">{latestRecord.restingCalories.toLocaleString()} cal/day</p>
          <p className="mt-1 text-sm text-slate-500">
            {SOURCE_LABELS[latestRecord.source]} · {formatDate(latestRecord.measuredDate)}
            {latestRecord.weightLb ? ` · ${latestRecord.weightLb} lb` : ""}
          </p>
        </div>
      ) : (
        <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
          No RMR record yet. The nutrition calculator will use its standard BMR formula.
        </div>
      )}

      {adding && (
        <div className="mt-5 border-t border-slate-200 pt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">Resting calorie burn
              <div className="mt-2 flex items-center gap-2">
                <input className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 font-normal"
                  inputMode="numeric" min="1" onChange={(e) => setRestingCalories(e.target.value)}
                  type="number" value={restingCalories} />
                <span className="font-normal text-slate-500">cal/day</span>
              </div>
            </label>
            <label className="text-sm font-semibold">Test or estimate date
              <input className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal"
                onChange={(e) => setMeasuredDate(e.target.value)} type="date" value={measuredDate} />
            </label>
            <label className="text-sm font-semibold">Source
              <select className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal"
                onChange={(e) => setSource(e.target.value as MetabolicRateSource)} value={source}>
                {Object.entries(SOURCE_LABELS).map(([value, label]) =>
                  <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold">Test-time weight (optional)
              <div className="mt-2 flex items-center gap-2">
                <input className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 font-normal"
                  inputMode="decimal" min="1" onChange={(e) => setWeightLb(e.target.value)}
                  step="0.1" type="number" value={weightLb} />
                <span className="font-normal text-slate-500">lb</span>
              </div>
            </label>
          </div>
          <label className="mt-4 block text-sm font-semibold">Notes (optional)
            <textarea className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal"
              onChange={(e) => setNotes(e.target.value)} placeholder="Testing conditions or provider details" value={notes} />
          </label>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <button className="mt-4 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
            onClick={handleSave} type="button">Save RMR Record</button>
        </div>
      )}

      {records.length > 0 && (
        <div className="mt-5 border-t border-slate-200 pt-5">
          <h4 className="font-semibold">History</h4>
          <div className="mt-3 space-y-2">
            {records.map((record) => (
              <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4" key={record.id}>
                <div>
                  <p className="font-semibold">{record.restingCalories.toLocaleString()} cal/day</p>
                  <p className="text-sm text-slate-500">{SOURCE_LABELS[record.source]} · {formatDate(record.measuredDate)}
                    {record.weightLb ? ` · ${record.weightLb} lb` : ""}</p>
                  {record.notes && <p className="mt-1 text-sm text-slate-600">{record.notes}</p>}
                </div>
                <button className="text-sm text-red-600" onClick={() => {
                  if (window.confirm("Delete this RMR record?")) deleteRecord(record.id);
                }} type="button">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
