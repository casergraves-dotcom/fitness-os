"use client";

import Link from "next/link";

import {
  useStepTargets,
} from "@/features/dailyActivity";

import {
  useNutritionTargets,
} from "@/features/nutrition";

import {
  useBodyCompositionGoals,
} from "@/features/progress";

import type {
  BodyCompositionGoal,
  BodyCompositionGoalType,
} from "@/features/progress/bodyCompositionTypes";


// ============================================================
// Helpers
// ============================================================

function formatGoalType(
  goalType:
    BodyCompositionGoalType
) {
  switch (
    goalType
  ) {
    case "FatLoss":
      return "Fat Loss";

    case "BodyComposition":
      return "Body Composition";

    case "Maintenance":
      return "Maintenance";

    case "Performance":
      return "Performance";
  }
}


function getGoalDetail(
  goal:
    BodyCompositionGoal |
    null
) {
  if (
    !goal
  ) {
    return "Set an outcome goal";
  }

  const details:
    string[] = [];

  if (
    goal.targetWeightLb !==
    undefined
  ) {
    details.push(
      `${goal.targetWeightLb} lb target`
    );
  }

  if (
    goal.targetBodyFatPercent !==
    undefined
  ) {
    details.push(
      `${goal.targetBodyFatPercent}% body fat target`
    );
  }

  if (
    details.length ===
    0
  ) {
    return "Active outcome";
  }

  return details.join(
    " · "
  );
}


// ============================================================
// Today Targets
// ============================================================

export default function TodayTargets() {
  const {
    loaded:
      goalsLoaded,

    currentGoal,
  } =
    useBodyCompositionGoals();

  const {
    loaded:
      nutritionTargetsLoaded,

    currentTarget:
      nutritionTarget,
  } =
    useNutritionTargets();

  const {
    loaded:
      stepTargetsLoaded,

    currentTarget:
      stepTarget,
  } =
    useStepTargets();

  const loaded =
    goalsLoaded &&
    nutritionTargetsLoaded &&
    stepTargetsLoaded;

  if (
    !loaded
  ) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">
          Loading your targets...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5">

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Your Targets
          </p>

        </div>

        <Link
          href="/settings/goals"
          className="shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Manage targets
        </Link>
      </div>


      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-200 pt-3 lg:grid-cols-4">

        <TargetCard
          label="Outcome"
          value={
            currentGoal
              ? formatGoalType(
                  currentGoal.primaryGoal
                )
              : "Not set"
          }
          detail={
            getGoalDetail(
              currentGoal
            )
          }
        />

        <TargetCard
          label="Calories"
          value={
            nutritionTarget
              ?.calorieTarget !==
            undefined
              ? `${nutritionTarget.calorieTarget.toLocaleString()} cal`
              : "Not set"
          }
          detail="Daily target"
        />

        <TargetCard
          label="Protein"
          value={
            nutritionTarget
              ?.proteinTargetGrams !==
            undefined
              ? `${nutritionTarget.proteinTargetGrams.toLocaleString()} g`
              : "Not set"
          }
          detail="Daily target"
        />

        <TargetCard
          label="Steps"
          value={
            stepTarget
              ? `${stepTarget.dailyStepTarget.toLocaleString()} steps`
              : "Not set"
          }
          detail="Daily target"
        />

      </div>

    </div>
  );
}


// ============================================================
// Target Card
// ============================================================

function TargetCard({
  label,
  value,
  detail,
}: {
  label: string;

  value: string;

  detail: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-0.5 truncate font-semibold text-slate-900">
        {value}
      </p>

      <p className="mt-0.5 truncate text-xs text-slate-500">
        {detail}
      </p>
    </div>
  );
}
