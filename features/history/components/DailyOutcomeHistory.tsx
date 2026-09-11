"use client";

import { useMemo } from "react";

import { useDailySteps, useStepTargets } from "@/features/dailyActivity";
import { useDailyNutrition, useNutritionAdherence } from "@/features/nutrition";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function calorieResult(status: string) {
  if (status === "OnTarget") return "Within target range";
  if (status === "BelowTarget") return "Below target range";
  if (status === "AboveTarget") return "Above target range";
  return "No target available";
}

export default function DailyOutcomeHistory() {
  const nutrition = useDailyNutrition();
  const nutritionAdherence = useNutritionAdherence();
  const dailySteps = useDailySteps();
  const stepTargets = useStepTargets();

  const dates = useMemo(() => Array.from(new Set([
    ...nutrition.records.map((record) => record.date),
    ...dailySteps.records.map((record) => record.date),
  ])).sort((a, b) => b.localeCompare(a)), [nutrition.records, dailySteps.records]);

  const loaded = nutrition.loaded && nutritionAdherence.loaded && dailySteps.loaded && stepTargets.loaded;

  if (!loaded) return <p className="py-6 text-center text-sm text-slate-500">Loading daily outcomes...</p>;

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Daily outcomes</p>
      <h2 className="mt-1 text-xl font-bold">Nutrition and steps</h2>
      <p className="mt-1 text-sm text-slate-500">Historical results are recalculated from the values and targets recorded for each date.</p>

      {dates.length === 0 ? (
        <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Logged nutrition and steps will appear here.</p>
      ) : (
        <div className="mt-5 space-y-3">
          {dates.map((date) => {
            const record = nutrition.getRecordForDate(date);
            const adherence = nutritionAdherence.getAdherenceForDate(date);
            const stepRecord = dailySteps.getRecordForDate(date);
            const stepTarget = stepTargets.getTargetForDate(date)?.dailyStepTarget;
            const stepMet = stepRecord && stepTarget !== undefined ? stepRecord.steps >= stepTarget : null;

            return (
              <article key={date} className="rounded-xl bg-slate-50 p-4">
                <h3 className="font-semibold text-slate-950">{formatDate(date)}</h3>
                <p className="mt-1 text-xs text-slate-600">
                  Nutrition: {record ? (record.confirmedAt ? "confirmed" : "needs confirmation") : "not logged"}
                  {" · "}
                  Steps: {stepRecord ? (stepRecord.confirmedAt ? "confirmed" : "needs confirmation") : "not logged"}
                </p>
                <dl className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Calories</dt>
                    <dd className="mt-1 font-semibold text-slate-950">{record?.calories !== undefined ? `${record.calories.toLocaleString()} cal` : "Not logged"}</dd>
                    {record?.calories !== undefined && adherence && <dd className="mt-1 text-sm text-slate-600">
                      {calorieResult(adherence.calories.status)}
                      {adherence.calories.lowerBoundCalories !== undefined && adherence.calories.upperBoundCalories !== undefined && ` · ${adherence.calories.lowerBoundCalories.toLocaleString()}–${adherence.calories.upperBoundCalories.toLocaleString()} cal`}
                    </dd>}
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Protein</dt>
                    <dd className="mt-1 font-semibold text-slate-950">{record?.proteinGrams !== undefined ? `${record.proteinGrams.toLocaleString()} g` : "Not logged"}</dd>
                    {record?.proteinGrams !== undefined && adherence && <dd className="mt-1 text-sm text-slate-600">{adherence.protein.status === "Met" ? "Daily target met" : adherence.protein.status === "BelowTarget" ? "Below daily target" : "No target available"}</dd>}
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Steps</dt>
                    <dd className="mt-1 font-semibold text-slate-950">{stepRecord ? stepRecord.steps.toLocaleString() : "Not logged"}</dd>
                    {stepRecord && <dd className="mt-1 text-sm text-slate-600">
                      {stepMet === null ? "No target available" : stepMet ? "Daily target met" : "Below daily target"}
                      {stepTarget !== undefined && ` · ${stepTarget.toLocaleString()} steps`}
                    </dd>}
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
