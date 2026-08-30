"use client";

// ============================================================
// Imports
// ============================================================

import {
  useState,
} from "react";

import {
  useNutritionTargets,
} from "../hooks/useNutritionTargets";
import {
  calculateNutritionTargetRecommendation,
} from "../utils/calculateNutritionTargetRecommendation";
import type {
  NutritionActivityLevel,
  NutritionCalculatorSex,
  NutritionGoalDirection,
  NutritionTargetRecommendation,
} from "../utils/calculateNutritionTargetRecommendation";
import {
  useBodyCompositionGoals,
} from "../../progress/hooks/useBodyCompositionGoals";
import {
  useBodyMeasurements,
} from "../../progress/hooks/useBodyMeasurements";
import {
  useDexaRecords,
} from "../../progress/hooks/useDexaRecords";
import {
  useMetabolicRateRecords,
} from "../hooks/useMetabolicRateRecords";


// ============================================================
// Helpers
// ============================================================

function formatEffectiveDate(
  date: string
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month:
        "short",

      day:
        "numeric",

      year:
        "numeric",
    }
  ).format(
    new Date(
      `${date}T12:00:00`
    )
  );
}


function parseOptionalNumber(
  value: string
) {
  if (
    value.trim() ===
    ""
  ) {
    return undefined;
  }

  const parsed =
    Number(
      value
    );

  return Number.isFinite(
    parsed
  )
    ? parsed
    : undefined;
}


// ============================================================
// Component
// ============================================================

export default function NutritionTargets() {
  const {
    loaded,
    history,
    currentTarget,
    addTarget,
  } =
    useNutritionTargets();

  const { measurements } = useBodyMeasurements();
  const { records: dexaRecords } = useDexaRecords();
  const { currentGoal } = useBodyCompositionGoals();
  const { latestRecord: latestMetabolicRateRecord } =
    useMetabolicRateRecords();

  const [
    editing,
    setEditing,
  ] =
    useState(false);

  const [
    calorieTarget,
    setCalorieTarget,
  ] =
    useState("");

  const [
    proteinTarget,
    setProteinTarget,
  ] =
    useState("");

  const [
    effectiveDate,
    setEffectiveDate,
  ] =
    useState("");

  const [
    notes,
    setNotes,
  ] =
    useState("");

  const [
    validationMessage,
    setValidationMessage,
  ] =
    useState<
      string |
      null
    >(
      null
    );

  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calculatorSex, setCalculatorSex] = useState<NutritionCalculatorSex>("Male");
  const [calculatorAge, setCalculatorAge] = useState("");
  const [calculatorHeightFeet, setCalculatorHeightFeet] = useState("");
  const [calculatorHeightInches, setCalculatorHeightInches] = useState("");
  const [calculatorWeight, setCalculatorWeight] = useState("");
  const [calculatorLeanMass, setCalculatorLeanMass] = useState("");
  const [calculatorActivity, setCalculatorActivity] = useState<NutritionActivityLevel>("Moderate");
  const [calculatorGoal, setCalculatorGoal] = useState<NutritionGoalDirection>("Lose");
  const [calculatorGoalRate, setCalculatorGoalRate] = useState("0.5");
  const [calculatorResult, setCalculatorResult] = useState<NutritionTargetRecommendation | null>(null);
  const [calculatorMessage, setCalculatorMessage] = useState<string | null>(null);


  // ----------------------------------------------------------
  // Begin Editing
  // ----------------------------------------------------------

  function beginEditing() {
    if (
      currentTarget
    ) {
      setCalorieTarget(
        currentTarget.calorieTarget !==
        undefined
          ? String(
              currentTarget.calorieTarget
            )
          : ""
      );

      setProteinTarget(
        currentTarget.proteinTargetGrams !==
        undefined
          ? String(
              currentTarget.proteinTargetGrams
            )
          : ""
      );

      setNotes(
        currentTarget.notes ??
        ""
      );
    } else {
      setCalorieTarget(
        ""
      );

      setProteinTarget(
        ""
      );

      setNotes(
        ""
      );
    }

    setEffectiveDate(
      ""
    );

    setValidationMessage(
      null
    );

    setCalculatorOpen(false);
    setCalculatorResult(null);
    setCalculatorMessage(null);

    setEditing(
      true
    );
  }

  function calculateSuggestedTargets() {
    try {
      const result = calculateNutritionTargetRecommendation({
        sex: calculatorSex,
        ageYears: Number(calculatorAge),
        heightInches:
          Number(calculatorHeightFeet) * 12 +
          Number(calculatorHeightInches || "0"),
        weightLb: Number(calculatorWeight),
        activityLevel: calculatorActivity,
        goal: calculatorGoal,
        goalRateLbPerWeek:
          calculatorGoal === "Maintain" ? 0 : Number(calculatorGoalRate),
        leanMassLb: parseOptionalNumber(calculatorLeanMass),
        restingMetabolicRateCalories:
          latestMetabolicRateRecord?.restingCalories,
      });

      setCalculatorResult(result);
      setCalculatorMessage(null);
    } catch (error) {
      setCalculatorResult(null);
      setCalculatorMessage(
        error instanceof Error ? error.message : "Enter valid calculator inputs."
      );
    }
  }

  function toggleCalculator() {
    if (calculatorOpen) {
      setCalculatorOpen(false);
      return;
    }

    const latestWeight = measurements.find(
      (measurement) => measurement.weightLb !== undefined
    );
    const latestDexaLeanMass = dexaRecords.find(
      (record) => record.leanMassLb !== undefined
    );

    setCalculatorWeight(
      latestWeight?.weightLb !== undefined
        ? String(latestWeight.weightLb)
        : ""
    );
    setCalculatorLeanMass(
      latestDexaLeanMass?.leanMassLb !== undefined
        ? String(latestDexaLeanMass.leanMassLb)
        : ""
    );

    if (currentGoal) {
      const expectedRate = currentGoal.expectedWeeklyWeightChangeLb;
      const goal =
        currentGoal.primaryGoal === "Maintenance"
          ? "Maintain"
          : expectedRate !== undefined && expectedRate > 0
            ? "Gain"
            : "Lose";

      setCalculatorGoal(goal);
      setCalculatorGoalRate(
        goal === "Maintain"
          ? "0"
          : String(Math.abs(expectedRate ?? 0.5))
      );
    }

    setCalculatorResult(null);
    setCalculatorMessage(null);
    setCalculatorOpen(true);
  }

  function useSuggestedTargets() {
    if (!calculatorResult) return;

    setCalorieTarget(String(calculatorResult.suggestedCalories));
    setProteinTarget(String(calculatorResult.suggestedProteinGrams));
    setCalculatorMessage(null);
  }


  // ----------------------------------------------------------
  // Save
  // ----------------------------------------------------------

  function saveTarget() {
    const calories =
      parseOptionalNumber(
        calorieTarget
      );

    const protein =
      parseOptionalNumber(
        proteinTarget
      );

    if (
      calories ===
        undefined &&
      protein ===
        undefined
    ) {
      setValidationMessage(
        "Set at least a calorie target or protein target."
      );

      return;
    }

    if (
      calories !==
        undefined &&
      calories <=
        0
    ) {
      setValidationMessage(
        "Calorie target must be greater than zero."
      );

      return;
    }

    if (
      protein !==
        undefined &&
      protein <=
        0
    ) {
      setValidationMessage(
        "Protein target must be greater than zero."
      );

      return;
    }

    addTarget({
      effectiveDate:
        effectiveDate ||
        undefined,

      calorieTarget:
        calories,

      proteinTargetGrams:
        protein,

      notes:
        notes.trim() ||
        undefined,
    });

    setValidationMessage(
      null
    );

    setEditing(
      false
    );
  }


  // ----------------------------------------------------------
  // Loading
  // ----------------------------------------------------------

  if (
    !loaded
  ) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">
          Loading nutrition targets...
        </p>
      </div>
    );
  }


  // ----------------------------------------------------------
  // Edit Form
  // ----------------------------------------------------------

  if (
    editing
  ) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Nutrition Targets
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-900">
            {currentTarget
              ? "Change Nutrition Targets"
              : "Set Nutrition Targets"}
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Target changes create a new historical record so earlier
            nutrition data remains tied to the targets that were active
            at the time.
          </p>
        </div>


        <div className="mt-5 space-y-5">

          <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">Need a starting point?</p>
                <p className="mt-1 text-sm text-slate-600">
                  Calculate suggestions, then review or edit them before saving.
                </p>
              </div>
              <button
                type="button"
                onClick={toggleCalculator}
                className="rounded-xl border border-blue-600 bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
              >
                {calculatorOpen ? "Hide Calculator" : "Calculate Suggested Targets"}
              </button>
            </div>

            {calculatorOpen && (
              <div className="mt-5 border-t border-blue-100 pt-5">
                <p className="mb-4 text-xs leading-5 text-slate-500">
                  {calculatorWeight
                    ? "Weight is prefilled from your latest body measurement. "
                    : "No stored body weight was available. "}
                  {calculatorLeanMass
                    ? "Lean mass is prefilled from your latest DEXA record. "
                    : "No stored DEXA lean mass was available. "}
                  {currentGoal
                    ? "Goal direction and rate are prefilled from your active body-composition goal."
                    : "No active body-composition goal was available."}
                  {latestMetabolicRateRecord
                    ? ` Maintenance will use your ${latestMetabolicRateRecord.measuredDate} RMR record.`
                    : " No stored RMR was available, so maintenance will use the BMR formula."}
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <CalculatorSelect
                    label="Sex used by BMR formula"
                    value={calculatorSex}
                    onChange={(value) => setCalculatorSex(value as NutritionCalculatorSex)}
                    options={["Male", "Female"]}
                  />
                  <CalculatorInput label="Age" value={calculatorAge} onChange={setCalculatorAge} suffix="years" min={1} />
                  <div>
                    <span className="text-sm font-semibold text-slate-800">Height</span>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <CalculatorInput label="" value={calculatorHeightFeet} onChange={setCalculatorHeightFeet} suffix="ft" min={1} />
                      <CalculatorInput label="" value={calculatorHeightInches} onChange={setCalculatorHeightInches} suffix="in" min={0} />
                    </div>
                  </div>
                  <CalculatorInput label="Weight" value={calculatorWeight} onChange={setCalculatorWeight} suffix="lb" min={1} />
                  <CalculatorInput label="Lean mass (optional)" value={calculatorLeanMass} onChange={setCalculatorLeanMass} suffix="lb" min={1} />
                  <CalculatorSelect
                    label="Activity level"
                    value={calculatorActivity}
                    onChange={(value) => setCalculatorActivity(value as NutritionActivityLevel)}
                    options={["Sedentary", "Light", "Moderate", "VeryActive", "ExtraActive"]}
                  />
                  <CalculatorSelect
                    label="Goal"
                    value={calculatorGoal}
                    onChange={(value) => setCalculatorGoal(value as NutritionGoalDirection)}
                    options={["Lose", "Maintain", "Gain"]}
                  />
                  {calculatorGoal !== "Maintain" && (
                    <CalculatorInput
                      label="Goal rate"
                      value={calculatorGoalRate}
                      onChange={setCalculatorGoalRate}
                      suffix="lb / week"
                      min={0}
                      step="0.1"
                    />
                  )}
                </div>

                <button
                  type="button"
                  onClick={calculateSuggestedTargets}
                  className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Calculate Suggestions
                </button>

                {calculatorMessage && (
                  <p className="mt-3 text-sm font-medium text-red-600">{calculatorMessage}</p>
                )}

                {calculatorResult && (
                  <div className="mt-5 rounded-xl border border-blue-100 bg-white p-4">
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                      Suggested Starting Targets
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <CalculatorMetric label="Maintenance" value={`${calculatorResult.maintenanceCalories} cal`} />
                      <CalculatorMetric label="Calories" value={`${calculatorResult.suggestedCalories} cal`} />
                      <CalculatorMetric
                        label="Protein"
                        value={`${calculatorResult.suggestedProteinGrams} g`}
                        detail={`${calculatorResult.proteinMinimumGrams}–${calculatorResult.proteinMaximumGrams} g useful range`}
                      />
                    </div>
                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      {calculatorResult.method === "StoredRmr"
                        ? "Maintenance starts from your latest stored RMR. "
                        : "Maintenance starts from a Mifflin–St Jeor estimate. "}
                      Protein uses {calculatorResult.proteinBasis === "LeanMass" ? "lean mass refined by a body-weight cross-check" : "a body-weight range"}; the displayed default is a practical starting point within that range. These suggestions have not changed your targets.
                    </p>
                    <button
                      type="button"
                      onClick={useSuggestedTargets}
                      className="mt-4 rounded-xl border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                    >
                      Use These Suggestions
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Daily calorie target
              </span>

              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step="1"
                  value={
                    calorieTarget
                  }
                  onChange={(
                    event
                  ) =>
                    setCalorieTarget(
                      event.target
                        .value
                    )
                  }
                  placeholder="Optional"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900"
                />

                <span className="text-sm text-slate-500">
                  cal
                </span>
              </div>
            </label>


            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Daily protein target
              </span>

              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step="1"
                  value={
                    proteinTarget
                  }
                  onChange={(
                    event
                  ) =>
                    setProteinTarget(
                      event.target
                        .value
                    )
                  }
                  placeholder="Optional"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900"
                />

                <span className="text-sm text-slate-500">
                  g
                </span>
              </div>
            </label>

          </div>


          <label className="block">
            <span className="text-sm font-semibold text-slate-800">
              Effective date
            </span>

            <input
              type="date"
              value={
                effectiveDate
              }
              onChange={(
                event
              ) =>
                setEffectiveDate(
                  event.target
                    .value
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900"
            />

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Leave blank to make the new targets effective today.
            </p>
          </label>


          <label className="block">
            <span className="text-sm font-semibold text-slate-800">
              Notes
            </span>

            <textarea
              value={
                notes
              }
              onChange={(
                event
              ) =>
                setNotes(
                  event.target
                    .value
                )
              }
              rows={3}
              placeholder="Optional context"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900"
            />
          </label>


          {validationMessage && (
            <p className="text-sm font-medium text-red-600">
              {
                validationMessage
              }
            </p>
          )}


          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={
                saveTarget
              }
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Save Targets
            </button>

            <button
              type="button"
              onClick={() =>
                setEditing(
                  false
                )
              }
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

          </div>

        </div>

      </div>
    );
  }


  // ----------------------------------------------------------
  // Empty State
  // ----------------------------------------------------------

  if (
    !currentTarget
  ) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          Nutrition Targets
        </p>

        <h3 className="mt-1 text-lg font-bold text-slate-900">
          Set your daily targets
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Add calorie and protein targets so Fitness OS can evaluate
          nutrition adherence without requiring meal-by-meal food logging.
        </p>

        <button
          type="button"
          onClick={
            beginEditing
          }
          className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Set Nutrition Targets
        </button>

      </div>
    );
  }


  // ----------------------------------------------------------
  // Current Target
  // ----------------------------------------------------------

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Current Nutrition Targets
          </p>

          <h3 className="mt-1 text-xl font-bold text-slate-900">
            Daily Targets
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Effective{" "}
            {
              formatEffectiveDate(
                currentTarget.effectiveDate
              )
            }.
          </p>
        </div>


        <button
          type="button"
          onClick={
            beginEditing
          }
          className="rounded-xl border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
        >
          Change Targets
        </button>

      </div>


      <div className="mt-5 grid gap-3 sm:grid-cols-2">

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Calories
          </p>

          <p className="mt-1 text-lg font-bold text-slate-900">
            {currentTarget.calorieTarget !==
            undefined
              ? `${currentTarget.calorieTarget} cal`
              : "Not set"}
          </p>
        </div>


        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Protein
          </p>

          <p className="mt-1 text-lg font-bold text-slate-900">
            {currentTarget.proteinTargetGrams !==
            undefined
              ? `${currentTarget.proteinTargetGrams} g`
              : "Not set"}
          </p>
        </div>

      </div>


      {currentTarget.notes && (
        <div className="mt-5 rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Notes
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {
              currentTarget.notes
            }
          </p>
        </div>
      )}


      {history.length > 1 && (
        <div className="mt-5 border-t border-slate-200 pt-5">

          <p className="text-sm font-semibold text-slate-800">
            Target History
          </p>

          <div className="mt-3 space-y-2">
            {history.map(
              (
                target
              ) => (
                <div
                  key={
                    target.id
                  }
                  className="rounded-xl bg-slate-50 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">

                    <p className="text-sm font-semibold text-slate-800">
                      {
                        formatEffectiveDate(
                          target.effectiveDate
                        )
                      }
                    </p>

                    <p className="text-sm text-slate-500">
                      {target.calorieTarget !==
                      undefined
                        ? `${target.calorieTarget} cal`
                        : "Calories not set"}
                      {" · "}
                      {target.proteinTargetGrams !==
                      undefined
                        ? `${target.proteinTargetGrams} g protein`
                        : "Protein not set"}
                    </p>

                  </div>
                </div>
              )
            )}
          </div>

        </div>
      )}

    </div>
  );
}

function CalculatorInput({
  label,
  value,
  onChange,
  suffix,
  min,
  step = "1",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix: string;
  min: number;
  step?: string;
}) {
  return (
    <label className="block">
      {label && <span className="text-sm font-semibold text-slate-800">{label}</span>}
      <div className={`${label ? "mt-2" : ""} flex items-center gap-2`}>
        <input
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900"
        />
        <span className="whitespace-nowrap text-sm text-slate-500">{suffix}</span>
      </div>
    </label>
  );
}

function CalculatorSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replace(/([a-z])([A-Z])/g, "$1 $2")}
          </option>
        ))}
      </select>
    </label>
  );
}

function CalculatorMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
      {detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}
    </div>
  );
}
