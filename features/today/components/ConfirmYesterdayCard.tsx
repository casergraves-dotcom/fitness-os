"use client";

import { useState } from "react";

import { useDailyNutrition } from "@/features/nutrition";
import { useDailySteps } from "@/features/dailyActivity";
import { isDailyRecordSettled } from "@/features/dailyActivity/utils/isDailyRecordSettled";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseDailyStepInput } from "@/features/dailyActivity/utils/parseDailyStepInput";

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function ConfirmYesterdayCard() {
  const nutrition = useDailyNutrition();
  const dailySteps = useDailySteps();
  const today = formatLocalDate(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = formatLocalDate(yesterdayDate);
  const nutritionRecord = nutrition.getRecordForDate(yesterday);
  const stepRecord = dailySteps.getRecordForDate(yesterday);
  const [editing, setEditing] = useState(false);
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [steps, setSteps] = useState("");
  const [stepValidationMessage, setStepValidationMessage] = useState<string | null>(null);

  const nutritionSettled =
    !nutritionRecord ||
    isDailyRecordSettled({
      recordDate: nutritionRecord.date,
      confirmedAt: nutritionRecord.confirmedAt,
      currentDate: today,
    });
  const stepsSettled =
    !stepRecord ||
    isDailyRecordSettled({
      recordDate: stepRecord.date,
      confirmedAt: stepRecord.confirmedAt,
      currentDate: today,
    });
  const needsConfirmation = !nutritionSettled || !stepsSettled;

  if (
    !nutrition.loaded ||
    !dailySteps.loaded ||
    (!nutritionRecord && !stepRecord)
  ) {
    return null;
  }

  function beginEditing() {
    setCalories(nutritionRecord?.calories?.toString() ?? "");
    setProtein(nutritionRecord?.proteinGrams?.toString() ?? "");
    setSteps(stepRecord?.steps.toString() ?? "");
    setStepValidationMessage(null);
    setEditing(true);
  }

  function confirmExisting() {
    const confirmedAt = new Date().toISOString();

    if (nutritionRecord && !nutritionSettled) {
      nutrition.saveDailyNutrition({
        date: yesterday,
        calories: nutritionRecord.calories,
        proteinGrams: nutritionRecord.proteinGrams,
        notes: nutritionRecord.notes,
        confirmedAt,
      });
    }

    if (stepRecord && !stepsSettled) {
      dailySteps.saveDailySteps({
        date: yesterday,
        steps: stepRecord.steps,
        notes: stepRecord.notes,
        confirmedAt,
      });
    }
  }

  function saveCorrections() {
    const parsedCalories = calories === "" ? undefined : Number(calories);
    const parsedProtein = protein === "" ? undefined : Number(protein);
    const parsedSteps = parseDailyStepInput(steps);
    const confirmedAt = new Date().toISOString();

    if (parsedSteps.status === "invalid") {
      setStepValidationMessage("Enter steps as a whole number using digits only.");
      return;
    }

    if (
      parsedCalories !== undefined ||
      parsedProtein !== undefined ||
      nutritionRecord
    ) {
      nutrition.saveDailyNutrition({
        date: yesterday,
        calories: parsedCalories,
        proteinGrams: parsedProtein,
        notes: nutritionRecord?.notes,
        confirmedAt,
      });
    }

    if (parsedSteps.status === "valid") {
      dailySteps.saveDailySteps({
        date: yesterday,
        steps: parsedSteps.steps,
        notes: stepRecord?.notes,
        confirmedAt,
      });
    }

    setStepValidationMessage(null);
    setEditing(false);
  }

  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            {needsConfirmation ? "Confirm yesterday" : "Yesterday"}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">
            {needsConfirmation ? "Are these final totals?" : "Yesterday's totals"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {needsConfirmation
              ? "Until confirmed, yesterday stays provisional in Reflect."
              : "Review or correct the totals used throughout Fitness OS."}
          </p>
        </div>

        {!editing && (
          <div className="flex gap-2">
            {needsConfirmation && (
              <Button type="button" onClick={confirmExisting}>Confirm</Button>
            )}
            <Button type="button" variant="outline" onClick={beginEditing}>Edit</Button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="text-sm font-medium text-slate-700">Calories
            <Input type="number" min="0" value={calories} onChange={(event) => setCalories(event.target.value)} className="mt-1" />
          </label>
          <label className="text-sm font-medium text-slate-700">Protein (g)
            <Input type="number" min="0" value={protein} onChange={(event) => setProtein(event.target.value)} className="mt-1" />
          </label>
          <label className="text-sm font-medium text-slate-700">Steps
            <Input type="text" inputMode="numeric" pattern="[0-9]*" value={steps} onChange={(event) => setSteps(event.target.value)} className="mt-1" />
            {parseDailyStepInput(steps).status === "valid" && (
              <span className="mt-1 block text-xs font-normal text-slate-500">
                Will save {Number(steps).toLocaleString()} steps
              </span>
            )}
          </label>
          {stepValidationMessage && (
            <p className="text-sm font-medium text-red-600 sm:col-span-3">{stepValidationMessage}</p>
          )}
          <div className="flex gap-2 sm:col-span-3">
            <Button type="button" onClick={saveCorrections}>
              {needsConfirmation ? "Save & confirm" : "Save changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div><dt className="text-slate-500">Calories</dt><dd className="font-semibold text-slate-950">{nutritionRecord?.calories?.toLocaleString() ?? "Not logged"}</dd></div>
          <div><dt className="text-slate-500">Protein</dt><dd className="font-semibold text-slate-950">{nutritionRecord?.proteinGrams !== undefined ? `${nutritionRecord.proteinGrams.toLocaleString()} g` : "Not logged"}</dd></div>
          <div><dt className="text-slate-500">Steps</dt><dd className="font-semibold text-slate-950">{stepRecord?.steps.toLocaleString() ?? "Not logged"}</dd></div>
        </dl>
      )}
    </section>
  );
}
